import React, { ReactNode } from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  id,
  hoverGlow = false,
  onClick,
  delay = 0,
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        hoverGlow || onClick
          ? {
              y: -6,
              boxShadow: "0 30px 60px -15px rgba(59, 130, 246, 0.14), 0 0 30px 4px rgba(14, 165, 233, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
              borderColor: "rgba(59, 130, 246, 0.35)",
            }
          : undefined
      }
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[32px] border border-white/60 
        bg-white/45 backdrop-blur-[24px] shadow-2xl shadow-slate-200/40 
        transition-all duration-300 ${onClick ? "cursor-pointer" : ""} 
        ${className}
      `}
    >
      {/* Glossy Reflective Sweep Overlay Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none opacity-50" />

      {/* Ultra-crisp top gloss highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-20" />
      
      {/* Soft bottom frame edge line */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200/25 to-transparent pointer-events-none z-20" />
      
      {/* Internal Content Frame */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
};
