import React from "react";
import { motion } from "motion/react";

interface RiskMeterProps {
  score: number; // 0 to 100
  title: string;
  subtitle?: string;
  riskLevel: "Low" | "Moderate" | "High";
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, title, subtitle, riskLevel }) => {
  // Map risk level to premium aesthetic color schemes
  const colorMap = {
    Low: {
      accent: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    Moderate: {
      accent: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    High: {
      accent: "from-rose-400 to-red-500",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
  };

  const activeColors = colorMap[riskLevel] || colorMap.Low;

  // Circular gauge config
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // We only show a semi-circle (half gauge = 180 degrees) or full circle. Let's make a beautiful 3/4 circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center" id="clinical-risk-meter">
      <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">{title}</h3>
      
      {/* Circle Gauge Container */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Shadow glow indicator behind circle */}
        <div className={`absolute w-36 h-36 rounded-full blur-2xl opacity-10 bg-gradient-to-r ${activeColors.accent}`} />
        
        <svg className="w-full h-full -rotate-90">
          {/* Base circle */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Active progress circle */}
          <motion.circle
            cx="88"
            cy="88"
            r={radius}
            fill="transparent"
            stroke="url(#riskGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
          
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text displaying Score */}
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-4xl font-extrabold text-slate-800"
          >
            {score}
            <span className="text-lg text-slate-400 font-medium">/100</span>
          </motion.span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold mt-1.5 border ${activeColors.bg} ${activeColors.text} ${activeColors.border}`}>
            {riskLevel} Risk
          </span>
        </div>
      </div>

      {subtitle && (
        <p className="mt-4 text-xs font-medium text-slate-500 max-w-xs">
          {subtitle}
        </p>
      )}
    </div>
  );
};
