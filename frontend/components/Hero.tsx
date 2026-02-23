"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, MapPin, TrendingUp } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen pt-32 pb-20 px-6 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full dot-grid pointer-events-none opacity-40" />
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-light border border-teal-500/30 text-teal-400 text-xs font-bold mb-8 uppercase tracking-widest leading-none">
                        <Sparkles className="w-3 h-3" />
                        Empowering Navi Mumbai Real Estate
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black font-outfit mb-8 tracking-tighter leading-[0.9]">
                        AI Data for <br />
                        <span className="gradient-text">Your Dream Home.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl font-medium">
                        Accurately predict property values in Kharghar, Nerul, Ulwe and beyond.
                        Powered by a Gradient Boosting model with <span className="text-teal-400 font-bold">87% accuracy</span>
                        across 2,500+ records.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link
                            href="/predict"
                            className="px-10 py-5 bg-teal-500 hover:bg-teal-400 text-navy-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all teal-glow group scale-hover active:scale-95"
                        >
                            Get Evaluation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/insights"
                            className="px-10 py-5 glass border border-white/10 hover:border-teal-500/50 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-white/5 active:scale-95"
                        >
                            Market Insights
                        </Link>
                    </div>

                    <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-10">
                        <div>
                            <div className="text-3xl font-black font-outfit text-white mb-1">2.5k+</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verified Listings</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black font-outfit text-teal-400 mb-1">87.5%</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Accuracy Rate</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black font-outfit text-white mb-1">15+</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Localities</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="relative"
                >
                    {/* Main Hero Image */}
                    <div className="relative z-10 w-full aspect-[4/5] md:aspect-[5/6] rounded-[2.5rem] overflow-hidden border border-white/10 float-anim">
                        <Image
                            src="/hero1.png"
                            alt="Navi Mumbai Skyline"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-[2s]"
                            priority
                        />
                        <div className="absolute inset-0 hero-gradient" />

                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                            <div className="glass-light p-4 rounded-2xl backdrop-blur-2xl border border-white/20">
                                <div className="text-[10px] text-teal-400 font-black uppercase mb-1 tracking-wider">Premium Listing</div>
                                <div className="text-sm font-bold text-white mb-1">Skyline Towers, Kharghar</div>
                                <div className="text-lg font-black text-white">₹1.85 Cr</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-teal-500/20">
                                <TrendingUp className="text-navy-950 w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Floaters */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 -right-10 z-20 glass p-5 rounded-3xl border border-white/20 shadow-2xl flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center">
                            <MapPin className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Hot Location</div>
                            <div className="text-sm font-black text-white">Ulwe Sector 19</div>
                        </div>
                    </motion.div>

                    <div className="absolute -bottom-12 -left-12 z-0 w-64 h-64 rounded-[3rem] overflow-hidden border border-white/10 rotate-12 opacity-80 transition-transform group-hover:rotate-6">
                        <Image src="/hero2.png" alt="Building Detail" fill className="object-cover" />
                        <div className="absolute inset-0 bg-navy-950/20" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
