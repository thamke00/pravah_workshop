"use client";

import { useState, useEffect } from "react";
import { Building2, Github, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <footer className="mt-20 border-t border-white/5 bg-navy-950/80 backdrop-blur-md pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center">
                            <Building2 className="text-navy-950 w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold font-outfit">
                            PRAVAH<span className="text-teal-400">HOMES</span>
                        </span>
                    </Link>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
                        Democratizing real estate data in Navi Mumbai. Our advanced ML model
                        analyzes over 2,500 data points to give you the most accurate valuation.
                    </p>
                    <div className="flex gap-4">
                        {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-teal-500 hover:text-teal-400 transition-all group">
                                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-white tracking-wide uppercase text-xs">Platform</h4>
                    <ul className="space-y-4 text-sm text-slate-400">
                        <li><Link href="/" className="hover:text-teal-400 transition-colors">Home</Link></li>
                        <li><Link href="/predict" className="hover:text-teal-400 transition-colors">Price Predictor</Link></li>
                        <li><Link href="/insights" className="hover:text-teal-400 transition-colors">Market Insights</Link></li>
                        <li><Link href="#" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-white tracking-wide uppercase text-xs">Resources</h4>
                    <ul className="space-y-4 text-sm text-slate-400">
                        <li><Link href="#" className="hover:text-teal-400 transition-colors">Documentation</Link></li>
                        <li><Link href="#" className="hover:text-teal-400 transition-colors">API Reference</Link></li>
                        <li><Link href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-white tracking-wide uppercase text-xs">Newsletter</h4>
                    <p className="text-xs text-slate-500 mb-4">Get the latest market trends delivered weekly.</p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Email address"
                            className="bg-navy-900 border border-white/10 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-teal-500/50 text-sm"
                            suppressHydrationWarning
                        />
                        <button
                            className="absolute right-2 top-2 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-md transition-all"
                            suppressHydrationWarning
                        >
                            Join
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-slate-500 text-[10px] uppercase tracking-[2px]">
                    © 2026 PRAVAH AI REAL ESTATE. DATA SCIENCE FOR THE MODERN CITY.
                </p>
                <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <a href="#" className="hover:text-white">India</a>
                    <a href="#" className="hover:text-white">UK</a>
                    <a href="#" className="hover:text-white">USA</a>
                </div>
            </div>
        </footer>
    );
}
