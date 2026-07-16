import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, HeartPulse, ShieldCheck, ArrowRight } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Home", path: "/" },
    { label: "About Clinic", path: "/about" },
    { label: "Contact Care", path: "/contact" },
  ];

  return (
    <motion.nav
      id="global-navbar"
      animate={{
        paddingTop: isScrolled ? "10px" : "20px",
        paddingBottom: isScrolled ? "10px" : "20px",
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0)",
        backdropFilter: isScrolled ? "blur(24px)" : "blur(0px)",
        borderColor: isScrolled ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0)",
        boxShadow: isScrolled ? "0 10px 30px -10px rgba(15, 23, 42, 0.05)" : "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full border-b transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo Brand Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-100"
            >
              <HeartPulse className="w-5.5 h-5.5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">
                Sukoon<span className="text-blue-600">AI</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">
                Clinical Diagnostics
              </span>
            </div>
          </Link>

          {/* Center navigation links with fluid floating indicators */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-200/20 p-1 rounded-2xl border border-white/40 backdrop-blur-md">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                >
                  {isActive && (
                    <motion.span
                      layoutId="navActiveBubble"
                      className="absolute inset-0 bg-white/80 rounded-xl shadow-sm border border-slate-100/50 z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-300 ${isActive ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Assessment Button trigger with beautiful glowing sheen */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/questionnaire"
                className="relative overflow-hidden group flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-blue-100 transition-all cursor-pointer"
              >
                {/* Glowing Glossy Sheen Overlay */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                
                <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                <span>Start Free Diagnosis</span>
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.nav>
  );
};
