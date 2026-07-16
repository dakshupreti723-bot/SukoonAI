import React from "react";
import { GlassCard } from "../components/GlassCard";
import { FileText, MessageSquare, Mic, Sparkles, ShieldAlert, Award, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";

export const About: React.FC = () => {
  const deepModels = [
    {
      icon: FileText,
      title: "Model-1: PHQ-9 Clinical Psychometrics",
      description: "Uses the standard 9-item Patient Health Questionnaire, mapping frequency thresholds of interest, depressive patterns, sleep disturbances, fatigue, and cognitive-somatic indications over a 14-day cycle.",
      weight: "35% Consolidated Weight",
    },
    {
      icon: MessageSquare,
      title: "Model-2: Conversational Sentiment NLP",
      description: "Parses written narrative responses to isolate positive and anxious lexicon ratios, tracking lexical density, syntactic length, word complexity, and cognitive distortion indicators.",
      weight: "35% Consolidated Weight",
    },
    {
      icon: Mic,
      title: "Model-3: Voice Biometrics & Acoustics",
      description: "Measures acoustical pitch variations, speech pauses, amplitude Shimmer, and fundamental frequency Jitter. Constricted pitch ranges often indicate physiological signs of exhaustion.",
      weight: "30% Consolidated Weight",
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" id="about-methodology-page">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Scientific Framework</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
          How SukoonAI Diagnostics Works
        </h2>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
          SukoonAI leverages a modern, tri-modal clinical correlation paradigm. By aggregating subjective questionnaires, semantic speech patterns, and physical acoustic waves, the system creates a multi-dimensional health overview.
        </p>
      </div>

      {/* Model Weighting Circle Graphic & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
        
        {/* Left Graphics */}
        <div className="relative flex justify-center py-6">
          <div className="absolute w-60 h-60 rounded-full bg-blue-100/30 blur-2xl -z-10" />
          
          <div className="w-56 h-56 rounded-full border border-slate-200/50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center shadow-lg shadow-slate-100">
            <BrainCircuit className="w-10 h-10 text-blue-600 mb-3" />
            <span className="text-3xl font-extrabold text-slate-800">100%</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Modal Alignment</span>
          </div>
        </div>

        {/* Right Info */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Our Weighted Diagnostic Alignment</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Standard psychiatric diagnoses often depend heavily on subjective patient reports. Our technology aims to bridge this gap by correlating subjective psychometrics with vocal and semantic biosignals.
          </p>
          
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/50 text-xs text-slate-600 font-semibold">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
              <span>Psychometric Questionnaire: 35% Weight</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/50 text-xs text-slate-600 font-semibold">
              <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
              <span>Lexical Semantic Sentiment: 35% Weight</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/50 text-xs text-slate-600 font-semibold">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span>Voice Acoustic Biometrics: 30% Weight</span>
            </div>
          </div>
        </div>

      </div>

      {/* Model Cards Grid */}
      <div className="space-y-8 mb-16">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight text-center md:text-left">Granular Model Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deepModels.map((m, idx) => {
            const Icon = m.icon;
            return (
              <GlassCard key={idx} className="p-6.5 space-y-4" hoverGlow>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                
                <h4 className="font-bold text-sm text-slate-800 tracking-tight">{m.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{m.description}</p>
                
                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit uppercase tracking-widest">
                  {m.weight}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* HIPAA Compliance statement */}
      <GlassCard className="p-8 border-dashed border-slate-200/80 bg-slate-50/40 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-2">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Sovereign Medical Privacy Certified</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            SukoonAI adheres to the highest level of cryptographic anonymity. No recordings, chats, or psychometric outputs are cached persistently on public cloud nodes. They exist temporarily in secure application memory and expire automatically upon session closure.
          </p>
        </div>
      </GlassCard>

    </div>
  );
};
