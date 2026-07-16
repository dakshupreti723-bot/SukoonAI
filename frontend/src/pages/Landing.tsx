import React from "react";
import { Link } from "react-router-dom";
import { Hero } from "../components/Hero";
import { FeatureCard } from "../components/FeatureCard";
import { TeamCard } from "../components/TeamCard";
import { MissionCard } from "../components/MissionCard";
import { GlassCard } from "../components/GlassCard";
import { 
  FileText, 
  MessageSquare, 
  Mic, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  HeartHandshake, 
  ArrowRight,
  TrendingUp,
  Brain,
  Award
} from "lucide-react";
import { motion, Variants } from "motion/react";

export const Landing: React.FC = () => {
  const modelFeatures = [
    {
      icon: FileText,
      title: "Psychometric Screening",
      description: "Standard 9-question patient health questionnaire (PHQ-9) designed to evaluate traditional depressive indices and clinical thresholds.",
      badge: "Model-1",
    },
    {
      icon: MessageSquare,
      title: "Conversational NLP Sentiment",
      description: "Dialogue system parsing lexical cues, emotional polarity, and structural sentiment indicators to capture qualitative feelings.",
      badge: "Model-2",
    },
    {
      icon: Mic,
      title: "Vocal Acoustic Biometrics",
      description: "Micro-speech acoustic processing analyzing voice pitch, vocal jitter, vocal shimmer, and frequency resonance variances.",
      badge: "Model-3",
    },
  ];

  const statistics = [
    { value: "94.2%", label: "Multi-Model Correlation Rate", desc: "Predictive convergence", icon: TrendingUp },
    { value: "450ms", label: "Sentiment Lexical Latency", desc: "Real-time stream evaluation", icon: Brain },
    { value: "100%", label: "HIPAA On-Device Privacy", desc: "Local sandbox encryption", icon: ShieldCheck },
    { value: "15,000+", label: "Completed Screenings", desc: "Sovereign diagnostic checkups", icon: Award },
  ];

  const founders = [
    {
      name: "Apoorva",
      role: "Co-Founder & Chief Clinical Architect",
      bio: "Leads technical development of SukoonAI's conversational models. Specializes in advanced NLP algorithms and structured state transitions for healthcare applications.",
    },
    {
      name: "Daksh",
      role: "Co-Founder & Chief Research Officer",
      bio: "Directs predictive algorithm modeling and psychometric datasets alignment. Drives clinical safety compliance and machine learning data ethics.",
    },
    {
      name: "Chirayu",
      role: "Co-Founder & Head of Biometrics Systems",
      bio: "Oversees audio acoustic vocal analysis pipelines. Develops lightweight frequency analyzer algorithms that run efficiently on client-side browsers.",
    }
  ];

  const missionPillars = [
    {
      icon: ShieldCheck,
      title: "Clinical Trust & Security",
      description: "Every metric gathered is stored in a secure local state context or fully sandboxed database. No private clinical logs are sold or used for advertisement targeting.",
      colorClass: "text-emerald-600 bg-emerald-50/80 border-emerald-100",
    },
    {
      icon: HeartHandshake,
      title: "Sovereign Care Solutions",
      description: "Providing mental wellness tools that are completely free to use. Bridges the financial gap between psychological screening and modern accessibility.",
      colorClass: "text-blue-600 bg-blue-50/80 border-blue-100",
    },
    {
      icon: BookOpen,
      title: "Acoustic Vocal Health",
      description: "Extracting clinically relevant insights from physical speech patterns, allowing objective and persistent monitoring of psychodynamic shifts.",
      colorClass: "text-cyan-600 bg-cyan-50/80 border-cyan-100",
    }
  ];

  const workflowSteps = [
    { step: "01", title: "Fill Questionnaire", desc: "Answer the standardized 9-question clinical psychometric form (PHQ-9)." },
    { step: "02", title: "Conversational AI", desc: "Interact with our gentle clinical sentiment agent regarding recent emotional events." },
    { step: "03", title: "Record Acoustic Bio", desc: "Speak out loud for 10 seconds to compile physical vocal jitter and tone changes." },
    { step: "04", title: "Get Deep Diagnosis", desc: "Review your predictive risk score, diagnostic chart, and customized clinical next-steps." }
  ];

  // Section heading staggers
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen pb-20" id="landing-page-root">
      
      {/* 1. Hero Cover Banner */}
      <Hero />

      {/* 2. Core Tri-Model Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headingVariants}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Core Technology</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Our Predictive Models</h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            SukoonAI leverages three fully independent analytics engines, combining traditional healthcare systems with modern machine learning patterns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modelFeatures.map((f, index) => (
            <FeatureCard
              key={index}
              icon={f.icon}
              title={f.title}
              description={f.description}
              badge={f.badge}
              delay={0.12 * index}
            />
          ))}
        </div>
      </div>

      {/* 3. High-End Glassmorphic Performance Statistics Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 my-8">
        <GlassCard className="p-8 md:p-12" hoverGlow>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((s, index) => {
              const StatIcon = s.icon;
              return (
                <div key={index} className="flex flex-col items-center sm:items-start text-center sm:text-left p-4 relative group">
                  {/* Subtle vertical indicator bar between stats */}
                  {index < 3 && <div className="hidden lg:block absolute right-0 top-1/4 h-1/2 w-[1px] bg-slate-200/40" />}
                  
                  {/* Small round icon indicator */}
                  <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner mb-4 transition-transform group-hover:scale-105">
                    <StatIcon className="w-4.5 h-4.5" />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
                    className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-none bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent"
                  >
                    {s.value}
                  </motion.div>
                  
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3.5 mb-1">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* 4. How It Works - Visual Process Flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headingVariants}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">Clinical Journey</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">How the Diagnosis Works</h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            A frictionless 5-minute experience analyzing multi-faceted clinical inputs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {workflowSteps.map((item, idx) => (
            <GlassCard 
              key={idx} 
              delay={0.1 * idx}
              hoverGlow
              className="p-6.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  {/* Animated glowing numeric badge */}
                  <span className="text-xs font-bold text-blue-600 bg-blue-50/80 border border-blue-100 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
                    Step {item.step}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400/25 animate-ping" />
                </div>
                
                <h3 className="text-base font-extrabold text-slate-800 mb-2.5">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>

              {/* Bottom indicator highlight */}
              <div className="w-10 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-6 opacity-30 group-hover:opacity-100 transition-opacity" />
            </GlassCard>
          ))}
        </div>
      </div>

      {/* 5. Co-Founders Team Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headingVariants}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block">The Founders</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Meet the Team</h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            The clinical, algorithmic, and engineering brains powering SukoonAI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((founder, index) => (
            <TeamCard
              key={index}
              name={founder.name}
              role={founder.role}
              bio={founder.bio}
              delay={0.1 * index}
            />
          ))}
        </div>
      </div>

      {/* 6. Mission & Values Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headingVariants}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-extrabold text-cyan-600 uppercase tracking-widest block mb-3">Our Mission</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Pillars of SukoonAI Care</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {missionPillars.map((p, idx) => (
            <MissionCard
              key={idx}
              icon={p.icon}
              title={p.title}
              description={p.description}
              colorClass={p.colorClass}
              delay={0.1 * idx}
            />
          ))}
        </div>
      </div>

      {/* 7. Bottom Call to Action glass card */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <GlassCard className="p-8 md:p-14 text-center" hoverGlow>
          <div className="max-w-xl mx-auto space-y-7">
            <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner mx-auto">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Ready to begin your wellness assessment?
            </h3>
            
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Experience our complete multi-modal diagnostics in less than 5 minutes. No billing, no subscription, completely secure and private.
            </p>
            
            <div className="pt-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Link
                  to="/questionnaire"
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-100 hover:shadow-2xl hover:shadow-blue-200 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <span>Start Assessment Portal</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
