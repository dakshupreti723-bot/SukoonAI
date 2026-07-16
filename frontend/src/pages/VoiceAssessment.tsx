import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { ProgressBar } from "../components/ProgressBar";
import { GlassCard } from "../components/GlassCard";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { Loader } from "../components/Loader";
import { submitVoiceAudio } from "../services/voiceAPI";
import { submitFinalConsolidation } from "../services/finalAPI";
import { Mic, ArrowRight, ShieldCheck } from "lucide-react";

export const VoiceAssessment: React.FC = () => {
  const navigate = useNavigate();

  const {
    questionnaireAnswers,
    chatMessages,
    setVoiceResult,
    setFinalReport,
  } = useUser();

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  const handleResetRecording = () => {
    setRecordedBlob(null);
  };

  const handleFinalSubmit = async () => {
    if (!recordedBlob) return;

    setIsCompiling(true);

    try {
      // Step 1: Voice Emotion Model
      const voiceRes = await submitVoiceAudio(recordedBlob);
      setVoiceResult(voiceRes);

      // Step 2: Final Fusion Engine
      const finalRes = await submitFinalConsolidation({
        phq9Responses: [
          questionnaireAnswers.q1,
          questionnaireAnswers.q2,
          questionnaireAnswers.q3,
          questionnaireAnswers.q4,
          questionnaireAnswers.q5,
          questionnaireAnswers.q6,
          questionnaireAnswers.q7,
          questionnaireAnswers.q8,
          questionnaireAnswers.q9,
        ],

        journalText: chatMessages
          .filter((msg) => msg.sender === "user")
          .map((msg) => msg.text)
          .join("\n"),

        voiceBlob: recordedBlob,
      });

      setFinalReport(finalRes);

      setTimeout(() => {
        navigate("/result");
      }, 1500);

    } catch (err) {
      console.error("Aggregation failed:", err);
      navigate("/result");
    }
  };

  if (isCompiling) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-8"
      id="voice-assessment-page"
    >
      <ProgressBar currentStep="voice" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Panel */}
        <div className="space-y-6">

          <GlassCard className="p-6">

            <div className="flex items-center gap-2.5 text-blue-600 mb-4">
              <Mic className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Acoustic Biometrics
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Our acoustic biometrics engine analyses vocal characteristics
              such as pitch, resonance, shimmer and jitter to identify
              emotional indicators associated with stress and depression.
            </p>

            <div className="border border-slate-100 p-4 rounded-2xl bg-white/50">
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Prompt ideas
              </h4>

              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                Talk naturally for around 10 seconds. You may describe your
                week, explain how you usually deal with stress, or simply
                read a peaceful paragraph.
              </p>
            </div>

          </GlassCard>

          {recordedBlob && (
            <button
              onClick={handleFinalSubmit}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
            >
              <span>Compile Composite Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* Right Panel */}

        <div className="md:col-span-2">

          <GlassCard className="p-8 flex flex-col items-center">

            <div className="text-center max-w-sm mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Record Your Voice
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Please record approximately 10 seconds of speech for
                acoustic emotion analysis.
              </p>
            </div>

            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onReset={handleResetRecording}
            />

            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-6 border-t border-slate-100 pt-4 w-full justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                Your voice recording is processed securely and deleted after
                analysis.
              </span>
            </div>

          </GlassCard>

        </div>

      </div>
    </div>
  );
};