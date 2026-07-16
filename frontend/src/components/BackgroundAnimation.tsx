import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export const BackgroundAnimation: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 90 };
  const parallaxX = useSpring(mouseX, springConfig);
  const parallaxY = useSpring(mouseY, springConfig);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse positions to slightly tilt elements (approx -30px to 30px parallax range)
      const { clientX, clientY } = event;
      const x = (clientX / window.innerWidth - 0.5) * 35;
      const y = (clientY / window.innerHeight - 0.5) * 35;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Premium, ultra-soft node particle network system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const nodesCount = 38;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulseSpeed: number;
      pulseOffset: number;
    }> = [];

    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18, // Extra slow and elegant drift
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 2 + 1,
        pulseSpeed: 0.01 + Math.random() * 0.01,
        pulseOffset: Math.random() * Math.PI,
      });
    }

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      // Draw connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodesCount; i++) {
        const nodeA = nodes[i];

        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;

        // Bounce back from margins gracefully
        if (nodeA.x < 0 || nodeA.x > width) nodeA.vx *= -1;
        if (nodeA.y < 0 || nodeA.y > height) nodeA.vy *= -1;

        // Render point with subtle breathing glow
        const currentPulse = Math.sin(time * 2 + nodeA.pulseOffset) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, nodeA.radius * (0.8 + currentPulse * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.08 * currentPulse})`;
        ctx.fill();

        for (let j = i + 1; j < nodesCount; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connection limit
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            // Multi-color fade transition between cyan and blue elements
            const opacity = (1 - dist / 160) * 0.05 * currentPulse;
            ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Slate-to-Teal ambient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/25 via-slate-50/60 to-slate-100/40" />

      {/* Floating Organic Morphing Blobs */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Model-1: Indigo/Blue Warm Diagnostic Blob */}
        <motion.div
          animate={{
            scale: [1, 1.25, 0.9, 1],
            rotate: [0, 120, 240, 360],
            x: [0, 40, -30, 0],
            y: [0, -50, 20, 0],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[5%] left-[5%] w-[50vw] h-[50vw] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] bg-gradient-to-tr from-blue-300/12 via-indigo-200/8 to-violet-300/5 blur-[130px]"
        />

        {/* Model-2: Cyan/Emerald Sentiment Ambient Blob */}
        <motion.div
          animate={{
            scale: [1.15, 0.85, 1.25, 1.15],
            rotate: [360, 240, 120, 0],
            x: [0, -40, 50, 0],
            y: [0, 60, -40, 0],
          }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[5%] right-[2%] w-[55vw] h-[55vw] rounded-[60%_40%_30%_70%_/_50%_30%_70%_50%] bg-gradient-to-br from-emerald-100/12 via-cyan-200/10 to-teal-300/8 blur-[150px]"
        />

        {/* Model-3: Cyan/Slate Deep Vocal Resonance Blob */}
        <motion.div
          animate={{
            scale: [0.9, 1.15, 1, 0.9],
            x: [30, -30, 15, 30],
            y: [-20, 30, -10, -20],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[35%] right-[20%] w-[42vw] h-[42vw] rounded-[50%_50%_30%_70%_/_50%_60%_40%_60%] bg-gradient-to-l from-cyan-200/8 via-blue-200/5 to-transparent blur-[110px]"
        />
      </motion.div>

      {/* Floating Glassmorphic Ambient Spheres */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-0"
      >
        <div className="absolute top-[18%] left-[12%] w-32 h-32 rounded-full border border-white/25 bg-gradient-to-tr from-white/10 to-white/5 backdrop-blur-md shadow-[inset_0_4px_12px_rgba(255,255,255,0.4),_0_20px_40px_rgba(15,23,42,0.03)]" />
        <div className="absolute bottom-[20%] right-[15%] w-44 h-44 rounded-full border border-white/30 bg-gradient-to-br from-white/12 to-white/3 backdrop-blur-lg shadow-[inset_0_6px_20px_rgba(255,255,255,0.45),_0_25px_50px_rgba(15,23,42,0.04)]" />
        <div className="absolute top-[55%] left-[8%] w-20 h-20 rounded-full border border-white/15 bg-white/3 backdrop-blur-sm shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)]" />
      </motion.div>

      {/* Floating Clinical, AI, and Wellness Icons with Premium Low Opacity (5-12%) */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        {/* 1. Floating Brain Icon (AI/Mind) */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0.06, 0.12, 0.06]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "15%", left: "22%" }}
          className="absolute w-12 h-12 text-blue-600/10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 6a6 6 0 0 0-6 6c0 1.5.5 3 1.5 4"/>
            <path d="M12 6a6 6 0 0 1 6 6c0 1.5-.5 3-1.5 4"/>
            <path d="M12 18v-4"/>
            <path d="M9 12h6"/>
          </svg>
        </motion.div>

        {/* 2. Floating Heart (Care & Empathy) */}
        <motion.div
          animate={{
            y: [0, 35, 0],
            x: [0, -20, 0],
            rotate: [0, -10, 10, 0],
            opacity: [0.04, 0.09, 0.04]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ bottom: "25%", left: "10%" }}
          className="absolute w-14 h-14 text-rose-500/8"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </motion.div>

        {/* 3. Floating Medical Cross (Trustworthy Clinical Shield) */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, -15, 0],
            rotate: [0, 360],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ top: "30%", right: "12%" }}
          className="absolute w-10 h-10 text-emerald-500/10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.div>

        {/* 4. Floating Mindfulness Lotus/Radiant Rings (Serenity) */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -20, 20, 0],
            opacity: [0.04, 0.08, 0.04]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ bottom: "15%", right: "25%" }}
          className="absolute w-16 h-16 text-cyan-500/8"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </motion.div>

        {/* 5. Floating Sparkling / Mental Wellness Indicator */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            x: [0, 25, 0],
            opacity: [0.03, 0.07, 0.03]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{ top: "50%", left: "45%" }}
          className="absolute w-12 h-12 text-indigo-500/8"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        </motion.div>
      </div>

      {/* Exquisite Neural Particles System */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
