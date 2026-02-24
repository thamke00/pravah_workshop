"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, LineChart, Home, Menu, X } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted) return null;

    const navLinks = [
        { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
        { name: "Predict", path: "/predict", icon: <Building2 className="w-4 h-4" /> },
        { name: "Insights", path: "/insights", icon: <LineChart className="w-4 h-4" /> },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? "py-4 glass border-b border-teal-500/20 px-6 backdrop-blur-xl shadow-2xl"
                : "py-6 bg-transparent px-8"
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center pulse-ring">
                        <Building2 className="text-navy-950 w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight font-outfit">
                        PRAVAH<span className="text-teal-400 group-hover:text-teal-300 transition-colors">HOMES</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.path}
                            className="px-5 py-2 rounded-full text-sm font-medium hover:bg-teal-500/10 hover:text-teal-400 transition-all flex items-center gap-2 group relative"
                        >
                            {link.icon}
                            {link.name}
                            <motion.div
                                className="absolute bottom-0 left-4 right-4 h-0.5 bg-teal-400 opacity-0 group-hover:opacity-100"
                                layoutId="nav-underline"
                            />
                        </Link>
                    ))}
                    <Link
                        href="/predict"
                        className="ml-4 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-navy-950 rounded-full font-bold text-sm tracking-wide transition-all scale-hover shadow-lg hover:shadow-teal-500/20 active:scale-95"
                    >
                        Start Valuation
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-200"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 glass-light border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-500/10"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
