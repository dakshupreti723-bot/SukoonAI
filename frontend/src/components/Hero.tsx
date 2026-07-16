import React from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck, Activity, BrainCircuit } from "lucide-react";

export const Hero: React.FC = () => {
  // Staggered text animations config
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="relative py-12 md:py-20 overflow-hidden" id="landing-hero-banner">
      
      {/* 1. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-8 text-left"
          >
            
            {/* Clinically Validated Premium badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2.5 bg-blue-50/70 border border-blue-200/50 text-blue-700 px-4.5 py-2 rounded-full text-xs font-bold shadow-sm shadow-blue-50/50 backdrop-blur-md"
            >
              <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="uppercase tracking-wider text-[10px]">Multi-Modal Predictive Health Systems v3.0</span>
            </motion.div>

            {/* Premium Display Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            >
              Your Clinical Sanctuary <br />
              for{" "}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500">
                AI-Driven Mental Wellness
                {/* Elegant underline gradient highlight */}
                <span className="absolute bottom-1 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500/30 to-emerald-400/30 rounded-full" />
              </span>
            </motion.h1>

            {/* Soft description subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-sm md:text-base text-slate-500 leading-relaxed max-w-xl"
            >
              SukoonAI correlates three independent clinical predictive models—psychometrics, conversational sentiment NLP, and audio vocal acoustics—to map deep stress-fatigue indicators and deliver objective wellness intelligence.
            </motion.p>

            {/* Custom Interactive Floating Badges Row (Model Highlights) */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center gap-2.5 pt-1"
            >
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50/80 px-3.5 py-1.5 rounded-xl border border-blue-100">Model-1: PHQ-9</span>
              <span className="text-[10px] font-extrabold text-cyan-600 bg-cyan-50/80 px-3.5 py-1.5 rounded-xl border border-cyan-100">Model-2: Sentiment NLP</span>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50/80 px-3.5 py-1.5 rounded-xl border border-emerald-100">Model-3: Voice Biometrics</span>
            </motion.div>

            {/* Call to Actions with Glass finishes */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 pt-3"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/questionnaire"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4.5 px-8 rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300/40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Begin Free Screening</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/about"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md hover:bg-white text-slate-700 font-bold py-4.5 px-8 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 transition-all"
                >
                  <span>Model Specifications</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* HIPAA compliance badge */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-3"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
              <span>Sovereign care, fully HIPAA-secure. Zero permanent medical logs cached on-cloud.</span>
            </motion.div>

          </motion.div>

          {/* Right Vector Illustration Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end py-6"
          >
            {/* Ambient Background Radial Glow behind the illustration */}
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-blue-200/20 via-cyan-200/10 to-transparent blur-3xl -z-10 animate-pulse" style={{ animationDuration: "10s" }} />

            {/* Glassmorphic Multi-model Core Wave Illustration Container */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-80 h-80 md:w-96 md:h-96 rounded-[40px] border border-white/60 bg-white/35 backdrop-blur-[24px] shadow-2xl p-8 flex flex-col justify-between overflow-hidden"
            >
              {/* Glossy top reflections */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/12 pointer-events-none" />
              
              {/* Card Title Header */}
              <div className="flex items-center justify-between border-b border-white/30 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">Tri-Modal Correlator</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Decorative Audio/Sentiment Pulse Wave Simulation */}
              <div className="flex-grow flex items-center justify-center relative my-4">
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 100">
                  {/* Model 1: Wave */}
                  <motion.path
                    d="M 0 50 Q 50 10, 100 50 T 200 50 T 300 50 T 400 50"
                    fill="transparent"
                    stroke="url(#blueGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    animate={{
                      d: [
                        "M 0 50 Q 50 10, 100 50 T 200 50 T 300 50 T 400 50",
                        "M 0 50 Q 50 85, 100 50 T 200 50 T 300 50 T 400 50",
                        "M 0 50 Q 50 10, 100 50 T 200 50 T 300 50 T 400 50"
                      ]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Model 2: Wave */}
                  <motion.path
                    d="M 0 50 Q 60 85, 120 50 T 240 50 T 360 50 T 400 50"
                    fill="transparent"
                    stroke="url(#emeraldGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    animate={{
                      d: [
                        "M 0 50 Q 60 85, 120 50 T 240 50 T 360 50 T 400 50",
                        "M 0 50 Q 60 15, 120 50 T 240 50 T 360 50 T 400 50",
                        "M 0 50 Q 60 85, 120 50 T 240 50 T 360 50 T 400 50"
                      ]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />
                  {/* Model 3: Wave */}
                  <motion.path
                    d="M 0 50 Q 70 30, 140 50 T 280 50 T 400 50"
                    fill="transparent"
                    stroke="url(#cyanGrad)"
                    strokeWidth="1.5"
                    animate={{
                      d: [
                        "M 0 50 Q 70 30, 140 50 T 280 50 T 400 50",
                        "M 0 50 Q 70 70, 140 50 T 280 50 T 400 50",
                        "M 0 50 Q 70 30, 140 50 T 280 50 T 400 50"
                      ]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0891B2" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Concentric central pulse rings */}
                <div className="absolute w-12 h-12 rounded-full border border-blue-500/10 bg-blue-500/5 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute w-20 h-20 rounded-full border border-cyan-500/10 bg-cyan-500/5 animate-ping" style={{ animationDuration: "5s" }} />
              </div>

              {/* Card Footer rows with metrics */}
              <div className="space-y-2 border-t border-white/30 pt-4 relative z-10">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <span>Diagnostic Feed Rate</span>
                  <span className="text-emerald-600 font-bold">94.2% Convergence</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "94.2%" }}
                    transition={{ duration: 2.5, ease: "easeOut", delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-400" 
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

    </div>
  );
};
