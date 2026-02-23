"use client";

import Hero from "@/components/Hero";
import { motion } from "framer-motion";
import { Building2, Search, Zap, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Real-time Valuations",
      desc: "Instant estimates based on local market dynamics and historical data trends.",
      icon: <Zap className="w-6 h-6 text-teal-400" />,
      delay: 0.1
    },
    {
      title: "Deep ML Architecture",
      desc: "Gradient Boosting model optimized for accuracy and outlier detection in residential data.",
      icon: <Building2 className="w-6 h-6 text-gold-400" />,
      delay: 0.2
    },
    {
      title: "Verified Source Data",
      desc: "Dataset sourced from 2,500+ verified listings across all major sectors of Navi Mumbai.",
      icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
      delay: 0.3
    }
  ];

  return (
    <div className="relative">
      <Hero />

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-base font-black text-teal-400 uppercase tracking-[4px] mb-4">Core Technology</h2>
              <h3 className="text-4xl md:text-5xl font-black font-outfit text-white">Advanced Real Estate Intelligence.</h3>
            </div>
            <p className="text-slate-400 max-w-sm mb-2 font-medium">
              We bridge the gap between complex data science and everyday home buying decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                className="glass p-10 card-hover group"
              >
                <div className="w-14 h-14 rounded-2xl bg-navy-900 border border-white/5 flex items-center justify-center mb-8 group-hover:bg-teal-500 group-hover:text-navy-950 transition-colors shadow-lg">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black mb-4 text-white font-outfit">{feature.title}</h4>
                <p className="text-slate-400 leading-relaxed text-sm mb-8">{feature.desc}</p>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="h-full bg-teal-500/30"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="glass p-1 flex flex-col lg:flex-row overflow-hidden border border-white/5">
            <div className="lg:w-1/2 relative min-h-[400px]">
              <Image src="/hero2.png" alt="Modern Building" fill className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950 to-transparent" />
              <div className="absolute inset-0 p-16 flex flex-col justify-center">
                <div className="w-16 h-1 bg-teal-500 mb-8" />
                <h3 className="text-4xl font-black font-outfit text-white mb-6">Designed for <br />Transparency.</h3>
                <p className="text-slate-300 max-w-sm leading-relaxed mb-8 font-medium">
                  No more guesswork. Get factual prices based on current market trends and property specifics.
                </p>
              </div>
            </div>

            <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center bg-navy-900/60 backdrop-blur-xl">
              <div className="max-w-md">
                <h4 className="text-2xl font-black font-outfit text-white mb-6">Ready to see what your home is worth?</h4>
                <p className="text-slate-400 mb-10 leading-relaxed italic">
                  "Pravah has transformed how we view property values in Navi Mumbai. The accuracy is stunningly close to the final registry prices."
                </p>
                <Link href="/predict" className="inline-flex items-center gap-4 text-teal-400 font-black tracking-widest uppercase hover:text-teal-300 group">
                  Launch Predictor <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
