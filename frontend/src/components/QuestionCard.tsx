import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number; // 1 to 9
  questionText: string;
  selectedValue: number;
  onSelectValue: (val: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  questionText,
  selectedValue,
  onSelectValue,
  onNext,
  onPrev,
  isFirst,
  isLast,
}) => {
  const choices = [
    { value: 0, label: "Not at all", color: "hover:bg-emerald-50/50 hover:text-emerald-700 hover:border-emerald-300/60", activeBg: "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-xl shadow-emerald-100" },
    { value: 1, label: "Several days", color: "hover:bg-blue-50/50 hover:text-blue-700 hover:border-blue-300/60", activeBg: "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-xl shadow-blue-100" },
    { value: 2, label: "More than half the days", color: "hover:bg-amber-50/50 hover:text-amber-700 hover:border-amber-300/60", activeBg: "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white shadow-xl shadow-amber-100" },
    { value: 3, label: "Nearly every day", color: "hover:bg-rose-50/50 hover:text-rose-700 hover:border-rose-300/60", activeBg: "bg-gradient-to-r from-rose-500 to-red-500 border-rose-500 text-white shadow-xl shadow-rose-100" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-1" id={`phq9-question-card-${questionNumber}`}>
      {/* Top indicator index */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PHQ-9 Clinical Screen</span>
        <span className="text-xs font-bold text-slate-500 bg-slate-100/70 border border-slate-200/40 px-3.5 py-1.5 rounded-xl">
          Question <b className="text-blue-600 font-extrabold">{questionNumber}</b> of 9
        </span>
      </div>

      {/* Progress small bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
          initial={{ width: "0%" }}
          animate={{ width: `${(questionNumber / 9) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Animated Question Text Container with Slide/Fade entry */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionNumber}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="min-h-[100px] flex items-center"
        >
          <h2 className="text-lg md:text-xl font-extrabold text-slate-800 leading-snug tracking-tight">
            {questionText}
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* Choices Grid */}
      <div className="space-y-3 pt-6 mb-8">
        {choices.map((c) => {
          const isSelected = selectedValue === c.value;
          return (
            <motion.button
              key={c.value}
              whileHover={{ scale: isSelected ? 1.01 : 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => onSelectValue(c.value)}
              className={`
                w-full text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex justify-between items-center group
                ${isSelected 
                  ? `${c.activeBg} font-bold scale-[1.01]` 
                  : `bg-white/40 backdrop-blur-md border-white/50 text-slate-600 ${c.color}`
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span 
                  className={`
                    w-8 h-8 rounded-full border flex items-center justify-center font-extrabold text-sm transition-colors
                    ${isSelected 
                      ? "bg-white/25 border-white/20 text-white" 
                      : "bg-slate-50/50 border-slate-200 text-slate-500 group-hover:bg-white"
                    }
                  `}
                >
                  {c.value}
                </span>
                <span className="text-xs md:text-sm font-semibold tracking-tight">{c.label}</span>
              </div>
              
              <div 
                className={`
                  w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors
                  ${isSelected ? "border-white bg-white" : "border-slate-300 group-hover:border-slate-400"}
                `}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200/30 pt-6">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer py-2 px-3 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4.5 h-4.5" /> Back
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs md:text-sm font-bold py-3.5 px-6.5 rounded-2xl shadow-lg shadow-blue-100 transition-all cursor-pointer"
        >
          {isLast ? "Proceed to Chat" : "Continue"} <ChevronRight className="w-4.5 h-4.5" />
        </motion.button>
      </div>
    </div>
  );
};
