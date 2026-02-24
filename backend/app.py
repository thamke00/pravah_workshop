"""FastAPI application for Navi Mumbai House Price Prediction.

Exposes a REST API with prediction, health, model-info, and locations
endpoints. Designed to be deployed on Render (Python runtime).

Compliant with Google Python Style Guide.
"""

from __future__ import annotations

import json
import logging
import os
import pickle
import time
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator, Dict, List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)
logger = logging.getLogger(__name__)

# ── Paths ──────────────────────────────────────────────────────────────────────
_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_DIR, "model.pkl")
SCALER_PATH = os.path.join(_DIR, "scaler.pkl")
ENCODERS_PATH = os.path.join(_DIR, "encoders.pkl")
METADATA_PATH = os.path.join(_DIR, "model_metadata.json")

# ── App State ──────────────────────────────────────────────────────────────────
_state: Dict[str, Any] = {}
_start_time = time.time()

FEATURES = [
    "location",
    "area_sqft",
    "bhk",
    "bathrooms",
    "floor",
    "total_floors",
    "age_of_property",
    "parking",
    "lift",
]


# ── Lifespan ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Loads model artifacts at startup."""
    logger.info("Loading model artifacts …")
    try:
        with open(MODEL_PATH, "rb") as f:
            _state["model"] = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            _state["scaler"] = pickle.load(f)
        with open(ENCODERS_PATH, "rb") as f:
            _state["encoders"] = pickle.load(f)
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _state["metadata"] = json.load(f)
        logger.info("Model artifacts loaded successfully.")
    except FileNotFoundError as exc:
        logger.error("Artifact not found: %s — run train_model.py first.", exc)
    yield
    _state.clear()


# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Navi Mumbai House Price Predictor API",
    description=(
        "Machine learning API that predicts residential property prices "
        "in Navi Mumbai using a Gradient Boosting Regressor (R²≈0.87)."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Vercel frontend + local dev
_allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
_allowed_origins = [o.strip() for o in _allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root endpoint for basic verification."""
    return {
        "message": "Welcome to Pravah: Navi Mumbai Price Predictor API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content=b"", media_type="image/x-icon")


# ── Schemas ────────────────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    """Input schema for the price prediction endpoint."""

    location: str = Field(..., description="Locality in Navi Mumbai", examples=["Kharghar"])
    area_sqft: float = Field(..., gt=0, description="Carpet area in square feet", examples=[950.0])
    bhk: int = Field(..., ge=1, le=10, description="Number of bedrooms", examples=[2])
    bathrooms: float = Field(..., ge=1, le=10, description="Number of bathrooms", examples=[2.0])
    floor: int = Field(..., ge=0, description="Floor number (0 = Ground)", examples=[5])
    total_floors: float = Field(..., ge=1, description="Total floors in the building", examples=[15.0])
    age_of_property: float = Field(..., ge=0, description="Age of the property in years", examples=[5.0])
    parking: bool = Field(..., description="Whether parking is available", examples=[True])
    lift: bool = Field(..., description="Whether lift is available", examples=[True])

    @field_validator("location")
    @classmethod
    def validate_location(cls, value: str) -> str:
        return value.strip().title()


class HousePricePredictionResponse(BaseModel):
    """Output schema for the prediction endpoint."""

    predicted_price_inr: float
    predicted_price_formatted: str
    confidence_range: Dict[str, Any]
    price_per_sqft: float
    inputs_used: Dict[str, Any]


class ApiHealthResponse(BaseModel):
    """Health check response."""

    status: str
    model_loaded: bool
    uptime_seconds: float
    version: str


class ModelMetadataResponse(BaseModel):
    """Model metadata response."""

    model_name: str
    r2_score: float
    mae: float
    rmse: float
    feature_importances: List[Dict[str, Any]]
    training_samples: Optional[int] = None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _format_inr(amount: float) -> str:
    """Formats an INR amount into a human-readable string (e.g., ₹1.23 Cr)."""
    if amount >= 1_00_00_000:
        return f"₹{amount / 1_00_00_000:.2f} Cr"
    if amount >= 1_00_000:
        return f"₹{amount / 1_00_000:.2f} L"
    return f"₹{amount:,.0f}"


def _encode_input(request: PredictionRequest) -> np.ndarray:
    """Encodes the request into a scaled feature vector.

    Args:
        request: Validated PredictionRequest.

    Returns:
        Scaled numpy array ready for model inference.   

    Raises:
        HTTPException: If the location is not known to the encoder.
    """
    metadata = _state.get("metadata", {})
    encoders = _state.get("encoders", {})
    scaler = _state.get("scaler")

    # Encode location
    le = encoders.get("location")
    if le is None:
        raise HTTPException(status_code=503, detail="Location encoder not found.")
    
    known_locations = list(le.classes_)
    if request.location not in known_locations:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Unknown location '{request.location}'. "
                f"Valid options: {known_locations}"
            ),
        )
    location_encoded = float(le.transform([request.location])[0])

    feature_vector = np.array([[
        location_encoded,
        request.area_sqft,
        float(request.bhk),
        request.bathrooms,
        float(request.floor),
        request.total_floors,
        request.age_of_property,
        1.0 if request.parking else 0.0,
        1.0 if request.lift else 0.0,
    ]])

    if scaler is None:
        raise HTTPException(status_code=503, detail="Scaler not loaded.")
    return scaler.transform(feature_vector)


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/api/v1/health", response_model=ApiHealthResponse, tags=["Monitoring"])
def health() -> ApiHealthResponse:
    """Returns the health status and uptime of the API."""
    return ApiHealthResponse(
        status="ok",
        model_loaded="model" in _state,
        uptime_seconds=float(f"{time.time() - _start_time:.2f}"),
        version="1.0.0",
    )


@app.get("/api/v1/locations", tags=["Data"])
def get_locations() -> Dict[str, List[str]]:
    """Returns the list of valid Navi Mumbai locations the model recognises."""
    metadata = _state.get("metadata", {})
    return {"locations": metadata.get("locations", [])}


@app.get("/api/v1/model-info", response_model=ModelMetadataResponse, tags=["Model"])
def model_info() -> ModelMetadataResponse:
    """Returns model metadata, performance metrics, and feature importances."""
    metadata = _state.get("metadata")
    if not metadata:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    metrics = metadata.get("metrics", {})
    return ModelMetadataResponse(
        model_name=metadata.get("model_name", "GradientBoostingRegressor"),
        r2_score=round(metrics.get("r2_score", 0), 4),
        mae=round(metrics.get("mae", 0), 0),
        rmse=round(metrics.get("rmse", 0), 0),
        feature_importances=metadata.get("feature_importance", []),
    )


@app.post("/api/v1/predict", response_model=HousePricePredictionResponse, tags=["Prediction"])
def predict(request: PredictionRequest) -> HousePricePredictionResponse:
    """Predicts the house price for the given property attributes.

    Args:
        request: Property features as a JSON body.

    Returns:
        Predicted price in INR with confidence range and price-per-sqft.
    """
    if "model" not in _state:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Ensure train_model.py has been run.",
        )

    model = _state["model"]
    metadata = _state.get("metadata", {})
    rmse = metadata.get("metrics", {}).get("rmse", 0.0)

    X_scaled = _encode_input(request)
    predicted_val: float = float(model.predict(X_scaled)[0])
    predicted_val = float(max(predicted_val, 0.0))  # guard against negative predictions

    return HousePricePredictionResponse(
        predicted_price_inr=float(f"{predicted_val:.2f}"),
        predicted_price_formatted=_format_inr(predicted_val),
        confidence_range={
            "low": float(f"{max(0.0, predicted_val - rmse):.2f}"),
            "high": float(f"{predicted_val + rmse:.2f}"),
            "low_formatted": _format_inr(float(max(0.0, predicted_val - rmse))),
            "high_formatted": _format_inr(float(predicted_val + rmse)),
        },
        price_per_sqft=float(f"{predicted_val / request.area_sqft:.2f}") if request.area_sqft else 0.0,
        inputs_used=request.model_dump(),
    )


# ── Entry Point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
