import React from "react";
import { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface MissionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass?: string;
  delay?: number;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  icon: Icon,
  title,
  description,
  colorClass = "text-blue-600 bg-blue-50/80 border-blue-100",
  delay = 0,
}) => {
  return (
    <GlassCard 
      delay={delay}
      hoverGlow 
      className="p-6.5 flex gap-4.5"
    >
      {/* Icon Frame */}
      <div className={`p-3.5 rounded-2xl flex-shrink-0 h-13 w-13 flex items-center justify-center border shadow-inner ${colorClass}`}>
        <Icon className="w-5.5 h-5.5" />
      </div>

      {/* Text block */}
      <div>
        <h4 className="text-base font-extrabold text-slate-800 tracking-tight mb-2">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </GlassCard>
  );
};
