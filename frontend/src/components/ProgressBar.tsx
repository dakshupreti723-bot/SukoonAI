import React from "react";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: "intro" | "questionnaire" | "chat" | "voice" | "loading" | "result";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { key: "intro", label: "Intake", index: 0 },
    { key: "questionnaire", label: "Questionnaire", index: 1 },
    { key: "chat", label: "Conversational AI", index: 2 },
    { key: "voice", label: "Voice Acoustics", index: 3 },
    { key: "result", label: "Composite Report", index: 4 },
  ];

  const getStepIndex = (step: typeof currentStep) => {
    if (step === "loading") return 3.5;
    const match = steps.find((s) => s.key === step);
    return match ? match.index : 0;
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="assessment-progress-stepper">
      {/* Visual Line Connectors and Nodes */}
      <div className="relative flex items-center justify-between">
        {/* Progress bar line backer */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200/80 -translate-y-1/2 z-0" />
        
        {/* Dynamic active line */}
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 -translate-y-1/2 transition-all duration-700 ease-out z-0"
          style={{ width: `${(currentIndex / 4) * 100}%` }}
        />

        {steps.map((s) => {
          const isCompleted = currentIndex > s.index;
          const isActive = s.key === currentStep || (currentStep === "loading" && s.key === "result");
          
          return (
            <div key={s.key} className="relative z-10 flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-500
                  ${isCompleted 
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105" 
                    : isActive 
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-lg shadow-blue-100" 
                      : "bg-white text-slate-400 border-2 border-slate-200"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                ) : (
                  <span>{s.index + 1}</span>
                )}
              </div>
              
              <span 
                className={`
                  absolute top-12 whitespace-nowrap text-xs font-medium transition-colors duration-300
                  ${isActive ? "text-blue-600 font-semibold" : isCompleted ? "text-slate-600" : "text-slate-400"}
                `}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-10" /> {/* Safe spacer for step labels */}
    </div>
  );
};
