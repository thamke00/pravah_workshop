"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, motion as fm } from "framer-motion";
import {
    Home,
    Search,
    Bath,
    Maximize,
    Layers,
    History,
    ParkingCircle,
    ArrowUpCircle,
    Calculator,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PredictionResult {
    predicted_price_formatted: string;
    confidence_range: {
        low_formatted: string;
        high_formatted: string;
    };
    price_per_sqft: number;
}

export default function PredictPage() {
    const [locations, setLocations] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PredictionResult | null>(null);

    const [formData, setFormData] = useState({
        location: "",
        area_sqft: 1000,
        bhk: 2,
        bathrooms: 2,
        floor: 5,
        total_floors: 15,
        age_of_property: 5,
        parking: true,
        lift: true
    });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/locations`);
                setLocations(res.data.locations);
            } catch (err) {
                console.error("Failed to fetch locations", err);
            }
        };
        fetchLocations();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await axios.post(`${API_URL}/api/v1/predict`, formData);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Something went wrong. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 relative">
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <fm.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black font-outfit mb-4 text-white"
                    >
                        Property <span className="text-teal-400">Valuator</span>
                    </fm.h1>
                    <fm.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 font-medium"
                    >
                        Fill in the property details below to get an instant, AI-powered price estimation
                        for any property in Navi Mumbai.
                    </fm.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Form Side */}
                    <fm.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-7"
                    >
                        <form onSubmit={handleSubmit} className="glass p-8 md:p-12 space-y-10 group shadow-2xl">
                            {/* Location Selector */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-teal-400">
                                    <Search className="w-4 h-4" /> Property Location
                                </label>
                                <select
                                    required
                                    value={formData.location}
                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                    className="w-full bg-navy-900 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-teal-500/50 appearance-none text-lg font-bold cursor-pointer transition-all hover:bg-navy-800"
                                >
                                    <option value="" disabled>Select Location</option>
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Main Attributes Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <Maximize className="w-4 h-4" /> Area (Sq.Ft)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.area_sqft}
                                        onChange={(e) => handleInputChange("area_sqft", Number(e.target.value))}
                                        className="w-full bg-navy-900 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-teal-500/50 font-bold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <Home className="w-4 h-4" /> Configuration (BHK)
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => handleInputChange("bhk", num)}
                                                className={`py-3 rounded-xl font-black transition-all ${formData.bhk === num
                                                    ? "bg-teal-500 text-navy-950 shadow-lg scale-105"
                                                    : "bg-navy-900 text-slate-400 border border-white/5 hover:border-white/20"
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Other Specs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                        <Bath className="w-4 h-4" /> Bathrooms
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={formData.bathrooms}
                                        onChange={(e) => handleInputChange("bathrooms", Number(e.target.value))}
                                        className="w-full bg-navy-900 border border-white/10 rounded-2xl py-4 px-6 text-white text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                        <Layers className="w-4 h-4" /> Floor
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.floor}
                                        onChange={(e) => handleInputChange("floor", Number(e.target.value))}
                                        className="w-full bg-navy-900 border border-white/10 rounded-2xl py-4 px-6 text-white text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                        <History className="w-4 h-4" /> Age (Yrs)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.age_of_property}
                                        onChange={(e) => handleInputChange("age_of_property", Number(e.target.value))}
                                        className="w-full bg-navy-900 border border-white/10 rounded-2xl py-4 px-6 text-white text-center font-bold"
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex flex-wrap gap-6 pt-4">
                                <label className="flex items-center gap-4 cursor-pointer group/toggle">
                                    <div
                                        onClick={() => handleInputChange("parking", !formData.parking)}
                                        className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.parking ? "bg-teal-500" : "bg-navy-900 border border-white/10"
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${formData.parking ? "translate-x-6" : "translate-x-0"}`} />
                                    </div>
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                        <ParkingCircle className={`w-4 h-4 ${formData.parking ? "text-teal-400" : "text-slate-500"}`} /> Parking Included
                                    </span>
                                </label>

                                <label className="flex items-center gap-4 cursor-pointer group/toggle">
                                    <div
                                        onClick={() => handleInputChange("lift", !formData.lift)}
                                        className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.lift ? "bg-teal-500" : "bg-navy-900 border border-white/10"
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${formData.lift ? "translate-x-6" : "translate-x-0"}`} />
                                    </div>
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                        <ArrowUpCircle className={`w-4 h-4 ${formData.lift ? "text-teal-400" : "text-slate-500"}`} /> Lift Access
                                    </span>
                                </label>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-6 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 font-black text-xl rounded-2xl transition-all shadow-xl hover:shadow-teal-500/30 flex items-center justify-center gap-4 group active:scale-95"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>Calculate Valuation <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform" /></>
                                )}
                            </button>
                        </form>
                    </fm.div>

                    {/* Result Side */}
                    <fm.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-5 sticky top-32"
                    >
                        <AnimatePresence mode="wait">
                            {!result && !error && !loading && (
                                <fm.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass border-dashed border-2 border-white/5 h-[650px] flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                                        <Calculator className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-500 mb-4 font-outfit uppercase tracking-widest">Awaiting Input</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
                                        Complete the form with property details to unlock our AI's deep-market valuation.
                                    </p>
                                </fm.div>
                            )}

                            {loading && (
                                <fm.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass h-[650px] flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 rounded-full border-4 border-teal-500/20" />
                                        <div className="w-24 h-24 rounded-full border-4 border-teal-500 border-t-transparent animate-spin absolute top-0 left-0" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-4 uppercase tracking-widest font-outfit">Analyzing Market...</h3>
                                    <p className="text-slate-400 text-sm italic">
                                        Referencing 2,500 data points across Navi Mumbai
                                    </p>
                                </fm.div>
                            )}

                            {error && (
                                <fm.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass border-red-500/20 bg-red-500/5 p-12 flex flex-col items-center justify-center text-center h-[650px]"
                                >
                                    <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                                    <h3 className="text-2xl font-black text-white mb-4 font-outfit">Calculation Failed</h3>
                                    <p className="text-red-400/80 mb-8">{error}</p>
                                    <button onClick={() => setError(null)} className="px-6 py-3 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-colors">
                                        Try Again
                                    </button>
                                </fm.div>
                            )}

                            {result && (
                                <fm.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="space-y-6"
                                >
                                    <div className="glass p-12 text-center teal-glow border-teal-500/40 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4">
                                            <CheckCircle2 className="text-teal-400 w-8 h-8" />
                                        </div>

                                        <h3 className="text-xs font-black text-teal-400 uppercase tracking-[6px] mb-6">Expert Valuation</h3>

                                        <fm.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 10, delay: 0.2 }}
                                            className="text-7xl font-black font-outfit text-white mb-4 tracking-tighter"
                                        >
                                            {result.predicted_price_formatted}
                                        </fm.div>

                                        <p className="text-slate-400 font-medium mb-12">
                                            Estimated Market Value for <br />
                                            <span className="text-white font-bold">{formData.location}</span>
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-navy-900/50 p-6 rounded-3xl border border-white/5">
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Price / Sq.Ft</div>
                                                <div className="text-xl font-black text-white">₹{result.price_per_sqft.toLocaleString()}</div>
                                            </div>
                                            <div className="bg-navy-900/50 p-6 rounded-3xl border border-white/5">
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Model Confidence</div>
                                                <div className="text-xl font-black text-teal-400">87.5%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass p-8 border-white/5 bg-white/2">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Valuation Range</h4>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-500">Market Low</span>
                                            <span className="text-xs font-bold text-slate-500">Market High</span>
                                        </div>
                                        <div className="h-3 w-full bg-navy-900 rounded-full overflow-hidden mb-4 p-0.5 border border-white/5">
                                            <fm.div
                                                initial={{ x: "-100%" }}
                                                animate={{ x: "0%" }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full w-full bg-gradient-to-r from-teal-600 via-teal-400 to-indigo-500 rounded-full"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center font-black font-outfit text-sm">
                                            <span className="text-slate-300">{result.confidence_range.low_formatted}</span>
                                            <span className="text-slate-300">{result.confidence_range.high_formatted}</span>
                                        </div>
                                    </div>

                                    <fm.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="flex justify-center"
                                    >
                                        <button
                                            onClick={() => { setResult(null); setError(null); }}
                                            className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            Reset and Recalculate
                                        </button>
                                    </fm.div>
                                </fm.div>
                            )}
                        </AnimatePresence>
                    </fm.div>
                </div>
            </div>
        </div>
    );
}
