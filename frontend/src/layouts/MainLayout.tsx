import React, { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BackgroundAnimation } from "../components/BackgroundAnimation";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-screen text-slate-800 antialiased font-sans flex flex-col justify-between">
      
      {/* 1. Global Premium Animated Background Layer */}
      <BackgroundAnimation />

      {/* 2. Sticky Navbar */}
      <Navbar />

      {/* 3. Core Page router view wrapped in Framer Motion fade-ins */}
      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Healthcare Clinical Footer */}
      <Footer />
      
    </div>
  );
};
