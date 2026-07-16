import React from "react";
import { Link } from "react-router-dom";
import { HeartPulse, Heart, ShieldAlert } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 z-10 relative" id="global-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <HeartPulse className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">
                Sukoon<span className="text-blue-500">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An advanced, tri-modal predictive clinical diagnostic system, correlating psychometric screening, conversational sentiment analysis, and audio vocal acoustics to identify mental wellness risk signals.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Diagnostic Portal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/questionnaire" className="hover:text-white transition-colors">Start Screening</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Clinical Contact</Link>
              </li>
            </ul>
          </div>

          {/* Privacy disclaimer */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Security & Privacy</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              We process data using on-device sandboxed models. HIPAA guidelines and clinical security mechanisms are maintained to protect patient records.
            </p>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/80 my-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} SukoonAI Health. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Co-founded with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by Apoorva, Daksh & Chirayu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
