"""Model training script for Navi Mumbai House Price Prediction.

This script:
  1. Loads and cleans the raw CSV dataset.
  2. Engineers features and encodes categoricals.
  3. Trains a Gradient Boosting Regressor.
  4. Persists model artifacts: model.pkl, scaler.pkl, encoders.pkl.

Usage:
    python train_model.py

Compliant with Google Python Style Guide.
"""

import json
import logging
import os
import pickle
import re
import sys
from typing import Any, Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────
RAW_CSV = os.path.join(
    os.path.dirname(__file__),
    "navi_mumbai_real_estate_uncleaned_2500.csv",
)
MODEL_DIR = os.path.dirname(__file__)

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
TARGET = "actual_price"

RANDOM_STATE = 42
TEST_SIZE = 0.20

GBR_PARAMS: Dict[str, Any] = {
    "n_estimators": 300,
    "learning_rate": 0.05,
    "max_depth": 5,
    "subsample": 0.8,
    "min_samples_split": 10,
    "random_state": RANDOM_STATE,
}


# ── Data Cleaning ──────────────────────────────────────────────────────────────

def _clean_price(value: Any) -> float:
    """Strips currency symbols and converts to float."""
    if pd.isna(value):
        return np.nan
    text = str(value).replace("₹", "").replace("INR", "").replace(",", "").strip()
    try:
        return float(text)
    except ValueError:
        return np.nan


def _parse_bhk(value: Any) -> float:
    """Extracts numeric BHK count from strings like '2BHK' or '3'."""
    if pd.isna(value):
        return np.nan
    text = str(value).strip().upper().replace("BHK", "")
    try:
        return float(text)
    except ValueError:
        return np.nan


def _parse_floor(value: Any) -> float:
    """Maps floor strings ('Ground', '0', '5') to numeric."""
    if pd.isna(value):
        return np.nan
    text = str(value).strip().lower()
    if text == "ground":
        return 0.0
    try:
        return float(text)
    except ValueError:
        return np.nan


def _parse_bool_col(value: Any) -> float:
    """Maps yes/no/true/false strings to 1.0 / 0.0."""
    if pd.isna(value):
        return np.nan
    text = str(value).strip().lower()
    if text in ("yes", "true", "1"):
        return 1.0
    if text in ("no", "false", "0"):
        return 0.0
    return np.nan


def load_and_clean(csv_path: str) -> pd.DataFrame:
    """Loads the raw CSV, cleans and returns a tidy DataFrame.

    Args:
        csv_path: Absolute path to the raw CSV file.

    Returns:
        Cleaned DataFrame with columns matching FEATURES + TARGET.
    """
    logger.info("Loading CSV: %s", csv_path)
    df = pd.read_csv(csv_path)
    logger.info("Raw shape: %s", df.shape)

    # Normalise column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    df.rename(columns={"actual_price": "actual_price"}, inplace=True)

    # Clean price
    df["actual_price"] = df["actual_price"].apply(_clean_price)

    # Clean location
    df["location"] = (
        df["location"]
        .astype(str)
        .str.strip()
        .str.title()
        .str.replace(r"\s+", " ", regex=True)
    )

    # Normalise location aliases
    location_map = {
        "Cbd Belapur": "CBD Belapur",
        "Kharghar ": "Kharghar",
        " Panvel": "Panvel",
        "Nerul": "Nerul",
        "Ulwe": "Ulwe",
    }
    df["location"] = df["location"].replace(location_map)

    # Parse BHK
    df["bhk"] = df["bhk"].apply(_parse_bhk)

    # Parse floor
    df["floor"] = df["floor"].apply(_parse_floor)

    # Parse boolean columns
    df["parking"] = df["parking"].apply(_parse_bool_col)
    df["lift"] = df["lift"].apply(_parse_bool_col)

    # Ensure numeric columns
    for col in ["area_sqft", "bathrooms", "total_floors", "age_of_property"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # --- Filtering ---
    # Drop missing location or empty strings
    df = df[df["location"].notna() & (df["location"] != "") & (df["location"] != "Nan")]

    # Drop negative or zero area / price
    df = df[df["area_sqft"] > 0]
    df = df[df["actual_price"] > 0]

    # Remove extreme outliers (keep 1st–99th percentile for area and price)
    area_lo, area_hi = df["area_sqft"].quantile(0.01), df["area_sqft"].quantile(0.99)
    price_lo, price_hi = df["actual_price"].quantile(0.01), df["actual_price"].quantile(0.99)
    df = df[(df["area_sqft"] >= area_lo) & (df["area_sqft"] <= area_hi)]
    df = df[(df["actual_price"] >= price_lo) & (df["actual_price"] <= price_hi)]

    logger.info("After outlier removal: %s", df.shape)

    # Convert to proper types
    df[["area_sqft", "actual_price"]] = df[["area_sqft", "actual_price"]].astype(float)

    return df


def _impute_medians(df: pd.DataFrame) -> pd.DataFrame:
    """Imputes missing numeric values with column median."""
    numeric_cols = df.select_dtypes(include=np.number).columns
    for col in numeric_cols:
        if df[col].isna().any():
            median = df[col].median()
            df[col] = df[col].fillna(median)
            logger.info("Imputed '%s' median=%.2f", col, median)
    return df


# ── Feature Engineering ────────────────────────────────────────────────────────

def build_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, Dict[str, LabelEncoder]]:
    """Encodes categoricals and returns feature matrix + target + encoders dict.

    Args:
        df: Cleaned DataFrame.

    Returns:
        Tuple of (feature DataFrame, target Series, encoders dict).
    """
    df = df.copy()
    df = _impute_medians(df)

    encoders: Dict[str, LabelEncoder] = {}
    le = LabelEncoder()
    df["location"] = le.fit_transform(df["location"].astype(str))
    encoders["location"] = le

    X = df[FEATURES].copy()
    y = df[TARGET].copy()
    return X, y, encoders


# ── Training ───────────────────────────────────────────────────────────────────

def train(
    X: pd.DataFrame,
    y: pd.Series,
) -> Tuple[GradientBoostingRegressor, StandardScaler, Dict[str, float]]:
    """Trains the Gradient Boosting Regressor and returns metrics.

    Args:
        X: Feature matrix.
        y: Target series.

    Returns:
        Tuple of (model, scaler, metrics dict).
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = GradientBoostingRegressor(**GBR_PARAMS)
    logger.info("Training GradientBoostingRegressor …")
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    metrics = {
        "r2_score": float(r2_score(y_test, y_pred)),
        "mae": float(mean_absolute_error(y_test, y_pred)),
        "mse": float(mean_squared_error(y_test, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
    }
    logger.info("  R²  = %.4f", metrics["r2_score"])
    logger.info("  MAE = %.0f INR", metrics["mae"])
    logger.info("  RMSE= %.0f INR", metrics["rmse"])

    return model, scaler, metrics


# ── Persistence ────────────────────────────────────────────────────────────────

def save_artifacts(
    model: GradientBoostingRegressor,
    scaler: StandardScaler,
    encoders: Dict[str, LabelEncoder],
    metrics: Dict[str, float],
    feature_names: list,
    locations: list,
) -> None:
    """Saves all model artifacts to MODEL_DIR."""

    def _save(obj: Any, filename: str) -> None:
        path = os.path.join(MODEL_DIR, filename)
        with open(path, "wb") as f:
            pickle.dump(obj, f)
        logger.info("Saved: %s", path)

    _save(model, "model.pkl")
    _save(scaler, "scaler.pkl")
    _save(encoders, "encoders.pkl")

    # Save metadata as JSON for the API
    metadata = {
        "features": feature_names,
        "target": TARGET,
        "metrics": metrics,
        "locations": locations,
        "feature_importance": [
            {"name": name, "importance": float(imp)}
            for name, imp in zip(feature_names, model.feature_importances_)
        ],
        "model_name": "GradientBoostingRegressor",
        "model_params": GBR_PARAMS,
    }
    meta_path = os.path.join(MODEL_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Saved: %s", meta_path)


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    """Entry point."""
    if not os.path.exists(RAW_CSV):
        logger.error("Raw CSV not found at: %s", RAW_CSV)
        sys.exit(1)

    df = load_and_clean(RAW_CSV)
    locations_list = sorted(df["location"].dropna().unique().tolist())
    logger.info("Unique locations: %s", locations_list)

    X, y, encoders = build_features(df)
    model, scaler, metrics = train(X, y)
    save_artifacts(model, scaler, encoders, metrics, FEATURES, locations_list)

    logger.info("✓ All artifacts saved. Training complete.")


if __name__ == "__main__":
    main()
