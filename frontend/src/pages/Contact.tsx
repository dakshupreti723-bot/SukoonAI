import React, { useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { Mail, Phone, MapPin, Send, ShieldAlert, HeartPulse } from "lucide-react";
import { motion } from "motion/react";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", email: "", msg: "" });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setFormData({ name: "", email: "", msg: "" });
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" id="contact-clinical-support-page">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block">Clinical Care Support</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Contact Clinical Coordination
        </h2>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
          Need technical support or want to integrate our tri-modal predictive engines into your hospital EHR systems? Our clinical coordinators are here to assist.
        </p>
      </div>

      {/* Emergency Red Warning Banner */}
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500 text-white rounded-2xl flex-shrink-0 animate-pulse">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-rose-900 font-bold text-sm">Need Immediate Psychiatric Support?</h4>
            <p className="text-xs text-rose-700 leading-relaxed mt-1">
              If you are in distress or experiencing thoughts of self-harm, please connect with live support. Help is completely anonymous, free, and available 24/7.
            </p>
          </div>
        </div>

        <a 
          href="tel:988" 
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-200 transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4" /> Call Or Text 988
        </a>
      </div>

      {/* Main Form & Contacts details layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left column contacts & cofounders */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-5">Primary Office Coordinates</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 text-xs text-slate-600">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-bold">SukoonAI Clinical HQ</p>
                  <p className="text-slate-500 mt-1">Delhi Technological University (DTU), Rohini, New Delhi, India</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs text-slate-600">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-bold">Academic & Clinical Queries</p>
                  <a href="mailto:apoorvakumarjha_cse_25a01051@dtu.ac.in" className="text-blue-600 mt-1 block">apoorvakumarjha_cse_25a01051@dtu.ac.in</a>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 uppercase tracking-wider text-slate-500">Security Inquiries</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              For patient data purge requests under HIPAA sovereign compliance, please contact our privacy compliance desk. Data purges are handled programmatically within 2 hours.
            </p>
          </GlassCard>
        </div>

        {/* Right column support message form */}
        <GlassCard className="p-8">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-2">Message Center</h3>
          <p className="text-xs text-slate-500 mb-6">Send an encrypted dispatch to the clinic administrators.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email ID</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Details / Inquiry</label>
              <textarea 
                rows={4}
                required
                value={formData.msg}
                onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                placeholder="Describe your request..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              {isSent ? "Message Dispatched Securely" : (
                <>
                  <Send className="w-4 h-4" /> Send Secure Dispatch
                </>
              )}
            </button>
          </form>
        </GlassCard>

      </div>

    </div>
  );
};
