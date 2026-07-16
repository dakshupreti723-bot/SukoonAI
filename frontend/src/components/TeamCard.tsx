import React from "react";
import { Linkedin, Github, Mail } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";

interface TeamCardProps {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
  delay?: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  name,
  role,
  bio,
  imageUrl,
  githubUrl = "https://github.com",
  linkedinUrl = "https://linkedin.com",
  email = "mailto:info@sukoonai.com",
  delay = 0,
}) => {
  return (
    <GlassCard 
      delay={delay}
      hoverGlow 
      className="p-7 flex flex-col items-center text-center justify-between"
    >
      <div className="flex flex-col items-center">
        {/* Profile Photo Placeholder Wrapper */}
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 group bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-blue-500/15 via-cyan-500/5 to-emerald-500/15 flex items-center justify-center text-blue-600 font-extrabold text-3xl group-hover:scale-105 transition-transform duration-500">
              {name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Name and Designation */}
        <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">{name}</h4>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/80 border border-emerald-100 px-3 py-1 rounded-xl mt-2 uppercase tracking-wider block">
          {role}
        </span>

        {/* Structured Bio */}
        <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-xs">
          {bio}
        </p>
      </div>

      {/* Divider & Socials */}
      <div className="w-full mt-6">
        <div className="w-16 h-[1.5px] bg-slate-200/40 mx-auto mb-5" />

        {/* Social Connection Icons */}
        <div className="flex items-center justify-center gap-3">
          <a 
            href={linkedinUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-blue-100 shadow-sm hover:shadow-md"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a 
            href={githubUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a 
            href={email} 
            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer border border-transparent hover:border-emerald-100 shadow-sm hover:shadow-md"
            title="Email contact"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </GlassCard>
  );
};
