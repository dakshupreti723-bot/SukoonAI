import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  badge,
  delay = 0,
}) => {
  return (
    <GlassCard 
      delay={delay}
      hoverGlow 
      className="p-7 flex flex-col justify-between h-full"
    >
      <div>
        {/* Card Header row with Icon and Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <Icon className="w-5.5 h-5.5" />
          </div>
          {badge && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/80 border border-emerald-100 px-3 py-1 rounded-xl uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>

        {/* Feature title */}
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight mb-3">
          {title}
        </h3>

        {/* Description body */}
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorative link indicator */}
      <div className="mt-8 flex items-center gap-2 text-xs font-bold text-blue-600 group cursor-pointer w-fit">
        <span>Clinical Blueprint</span>
        <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
      </div>
    </GlassCard>
  );
};
