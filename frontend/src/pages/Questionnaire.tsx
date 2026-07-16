import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { ProgressBar } from "../components/ProgressBar";
import { QuestionCard } from "../components/QuestionCard";
import { GlassCard } from "../components/GlassCard";
import { submitQuestionnaire } from "../services/questionnaireAPI";
import { ClipboardList, Sparkles, UserCheck } from "lucide-react";

export const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { 
    userName, 
    setUserName, 
    userAge, 
    setUserAge, 
    questionnaireAnswers, 
    setQuestionnaireAnswers, 
    setQuestionnaireResult 
  } = useUser();

  const [activeQIndex, setActiveQIndex] = useState(0);
  const [showProfileIntake, setShowProfileIntake] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const phq9Questions = [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling or staying asleep, or sleeping too much?",
    "Feeling tired or having little energy?",
    "Poor appetite or overeating?",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
    "Trouble concentrating on things, such as reading the newspaper or watching television?",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
    "Thoughts that you would be better off dead or of hurting yourself in some way?"
  ];

  const handleSelectScore = (score: number) => {
    const qKey = `q${activeQIndex + 1}` as keyof typeof questionnaireAnswers;
    setQuestionnaireAnswers({
      ...questionnaireAnswers,
      [qKey]: score
    });
  };

  const handleNext = async () => {
    if (activeQIndex < phq9Questions.length - 1) {
      setActiveQIndex((prev) => prev + 1);
    } else {
      // Last question completed, submit to questionnaire API
      setIsLoading(true);
      try {
        const result = await submitQuestionnaire(questionnaireAnswers);
        setQuestionnaireResult(result);
        navigate("/chat-assessment");
      } catch (err) {
        console.error("Failed to submit questionnaire answers", err);
        // Fallback progress
        navigate("/chat-assessment");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (activeQIndex > 0) {
      setActiveQIndex((prev) => prev - 1);
    }
  };

  const handleStartQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setShowProfileIntake(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="questionnaire-page-root">
      
      {/* 1. Global Interactive Progress Step Tracker */}
      <ProgressBar currentStep="questionnaire" />

      {showProfileIntake ? (
        /* Profile Intake Form card */
        <GlassCard className="p-8 max-w-lg mx-auto" hoverGlow>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Clinical Intake</h3>
            <p className="text-xs text-slate-500 mt-1">Please provide introductory details before starting.</p>
          </div>

          <form onSubmit={handleStartQuestions} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter patient full name..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
                placeholder="Enter patient age..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-100 mt-6"
            >
              Start Clinical Screen
            </button>
          </form>
        </GlassCard>
      ) : (
        /* Active PHQ-9 Question Card inside a Glossy container */
        <GlassCard className="p-8 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-600">Structuring screener results...</p>
            </div>
          ) : (
            <QuestionCard
              questionNumber={activeQIndex + 1}
              questionText={phq9Questions[activeQIndex]}
              selectedValue={(questionnaireAnswers as any)[`q${activeQIndex + 1}`]}
              onSelectValue={handleSelectScore}
              onNext={handleNext}
              onPrev={handlePrev}
              isFirst={activeQIndex === 0}
              isLast={activeQIndex === phq9Questions.length - 1}
            />
          )}
        </GlassCard>
      )}

    </div>
  );
};
