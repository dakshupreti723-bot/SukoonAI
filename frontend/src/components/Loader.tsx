import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Brain, Cpu, Database, BarChart3 } from "lucide-react";
import { GlassCard } from "./GlassCard";

export const Loader: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    { text: "Aggregating PHQ-9 Questionnaire responses...", icon: Database },
    { text: "Running NLP Emotional Sentiment parsing on chat text...", icon: Brain },
    { text: "Extracting acoustic jitter, shimmer, and vocal pitch indices...", icon: Cpu },
    { text: "Running predictive multi-modal clinical validation algorithms...", icon: BarChart3 },
    { text: "Compiling consolidated medical recommendations...", icon: Sparkles },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-xl mx-auto text-center" id="multi-model-diagnostic-loader">
      {/* Outer spinning ring */}
      <div className="relative w-28 h-28 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 border-r-emerald-400"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-dashed border-slate-200 border-t-cyan-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>

      {/* Main progress headline */}
      <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
        Consolidating Diagnostic Outputs
      </h3>
      <p className="text-xs text-slate-500 max-w-md mb-8">
        Please wait while SukoonAI correlates indicators from three independent mental health predictive models.
      </p>

      {/* Segmented step list inside GlassCard */}
      <GlassCard className="w-full text-left p-6.5 space-y-4">
        {stages.map((stage, idx) => {
          const StageIcon = stage.icon;
          const isDone = idx < activeStage;
          const isActive = idx === activeStage;

          return (
            <div 
              key={idx} 
              className={`flex items-center gap-3.5 transition-all duration-300 ${
                isDone ? "opacity-40" : isActive ? "opacity-100 scale-[1.01]" : "opacity-20"
              }`}
            >
              <div 
                className={`p-2 rounded-xl border transition-all duration-300 ${
                  isDone 
                    ? "bg-emerald-50 text-emerald-500 border-emerald-100" 
                    : isActive 
                      ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" 
                      : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}
              >
                <StageIcon className="w-4 h-4" />
              </div>
              
              <div className="flex-grow">
                <span className={`text-xs font-semibold ${isActive ? "text-slate-800" : "text-slate-600"}`}>
                  {stage.text}
                </span>
              </div>

              {isDone && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              )}
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
};
