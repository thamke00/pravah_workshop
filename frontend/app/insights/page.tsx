"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area
} from "recharts";
import {
    BarChart3,
    PieChart as PieIcon,
    Target,
    Activity,
    TrendingUp,
    Info,
    ChevronRight,
    MapPin,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function InsightsPage() {
    const [modelInfo, setModelInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/model-info`);
                setModelInfo(res.data);
            } catch (err) {
                console.error("Failed to fetch model info", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 text-teal-400 font-black uppercase tracking-[4px] text-xs mb-4"
                    >
                        <Activity className="w-4 h-4" /> System Analytics
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black font-outfit text-white mb-6"
                    >
                        Model <span className="gradient-text">Intelligence.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-2xl font-medium leading-relaxed"
                    >
                        Transparency is at the core of Pravah. Explore how our Gradient Boosting
                        regressor weights parameters to deliver valuations with an 87.5% R² score.
                    </motion.p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {[
                        { label: "Accuracy (R²)", val: `${(modelInfo?.r2_score * 100).toFixed(1)}%`, icon: <Target className="text-teal-400" />, desc: "Model reliability" },
                        { label: "Avg Error (MAE)", val: `₹${(modelInfo?.mae / 100000).toFixed(1)}L`, icon: <TrendingUp className="text-gold-400" />, desc: "Mean Absolute Error" },
                        { label: "Stability (RMSE)", val: "High", icon: <ShieldCheck className="text-teal-400" />, desc: "Predictive stability" },
                        { label: "Algorithm", val: "GBR", icon: <BarChart3 className="text-indigo-400" />, desc: "Gradient Boosting" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="glass p-8 border-white/5 card-hover"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold">
                                    {stat.icon}
                                </div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
                            </div>
                            <div className="text-3xl font-black font-outfit text-white mb-1">{stat.val}</div>
                            <div className="text-xs text-slate-500 font-medium">{stat.desc}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Feature Importance Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="lg:col-span-8 glass p-10 border-white/5 h-[500px]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black font-outfit text-white flex items-center gap-3">
                                <BarChart3 className="text-teal-400 w-6 h-6" /> Feature Contribution
                            </h3>
                            <div className="p-2 glass-light rounded-lg cursor-help group relative">
                                <Info className="w-4 h-4 text-slate-500" />
                                <div className="absolute bottom-full right-0 mb-2 w-48 glass p-3 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Shows which factors influence the finally predicted house price the most.
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={modelInfo?.feature_importances || []} margin={{ top: 0, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.replace("_", " ").toUpperCase()}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ backgroundColor: '#0a1628', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="importance" radius={[6, 6, 0, 0]}>
                                    {(modelInfo?.feature_importances || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? "#2dd4bf" : "#2dd4bf50"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Model Health / Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        <div className="glass p-8 border-white/5 flex flex-col justify-between h-[234px]">
                            <div>
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Current Focus</h4>
                                <h3 className="text-2xl font-black font-outfit text-white mb-2">Area Dominance.</h3>
                                <p className="text-sm text-slate-400 font-medium">
                                    Square footage accounts for 64% of the price prediction variance.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-widest">
                                View Data Specs <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="glass p-8 border-white/5 bg-teal-500/5 h-[234px]">
                            <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-6">Location Coverage</h4>
                            <div className="space-y-4">
                                {["Kharghar", "Nerul", "Ulwe", "Panvel"].map(loc => (
                                    <div key={loc} className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-teal-500" /> {loc}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-black">ACTIVE</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
