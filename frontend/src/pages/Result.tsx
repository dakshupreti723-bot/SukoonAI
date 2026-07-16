import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { ProgressBar } from "../components/ProgressBar";
import { GlassCard } from "../components/GlassCard";
import { RiskMeter } from "../components/RiskMeter";
import {
  FileText,
  MessageSquare,
  Mic,
  Sparkles,
  RotateCcw,
  Download,
  CheckCircle2,
  Activity,
  Clock,
  Heart,
  Phone,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";

// fusion risk_level (Low/Medium/High) -> RiskMeter level (Low/Moderate/High)
const RISK_LEVEL_MAP: Record<string, "Low" | "Moderate" | "High"> = {
  Low: "Low",
  Medium: "Moderate",
  High: "High",
};

const pct = (v: number) => Math.round((v || 0) * 100);

const topProbabilities = (probs: Record<string, number> = {}, n = 3) =>
  Object.entries(probs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

export const Result: React.FC = () => {
  const { userName, finalReport, resetAssessment } = useUser();

  // No fabricated clinical data: if the assessment wasn't completed, guide
  // the user to complete it rather than showing fake results.
  if (!finalReport) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <GlassCard className="p-10">
          <Heart className="w-10 h-10 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No assessment yet</h2>
          <p className="text-sm text-slate-500 mb-6">
            Complete the questionnaire, chat, and voice steps to generate your
            personalized wellness report.
          </p>
          <Link
            to="/questionnaire"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Start Assessment
          </Link>
        </GlassCard>
      </div>
    );
  }

  const { text_prediction, voice_prediction, phq9, fusion, gemini } = finalReport;
  const riskLevel = RISK_LEVEL_MAP[fusion.risk_level] || "Low";
  const overallScore = pct(fusion.fused_score);
  const timestamp = new Date().toLocaleString();

  // Authoritative acute-risk decision comes from the FUSION ENGINE, not from a
  // single model or Gemini's discretion: High risk, a self-harm/suicidal safety
  // override, or the PHQ-9 self-harm item. This mirrors backend is_emergency()
  // and drives which card is shown. Low/Moderate => recommendations only.
  const isEmergency =
    fusion.risk_level === "High" || fusion.overridden || phq9.item9_flag;

  const handlePrint = () => window.print();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" id="diagnostic-result-dashboard">
      <ProgressBar currentStep="result" />

      {/* Welcome / actions */}
      <GlassCard className="p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Wellness Assessment Report</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Summary for: <span className="text-blue-600">{userName || "You"}</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Compiled {timestamp}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold py-3 px-5 rounded-xl border border-slate-200 transition-colors cursor-pointer text-xs md:text-sm"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={resetAssessment}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl transition-colors cursor-pointer text-xs md:text-sm"
            >
              <RotateCcw className="w-4 h-4" /> New Assessment
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Risk meter + Gemini compassionate summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <GlassCard className="p-6 md:col-span-1 flex flex-col items-center justify-center">
          <RiskMeter
            score={overallScore}
            title="Overall Wellness Signal"
            subtitle="Composite of PHQ-9, text sentiment, and voice emotion signals."
            riskLevel={riskLevel}
          />
        </GlassCard>

        <GlassCard className="p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Your Sukoon AI Companion
            </span>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-4 font-medium">
              {gemini.message}
            </p>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80">
              {gemini.summary}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Three model signal cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* PHQ-9 */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-3">
            <FileText className="w-4.5 h-4.5" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">Questionnaire</h4>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">PHQ-9 Score</span>
              <span className="font-mono font-bold text-slate-800">{phq9.total} / 27</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Severity</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md text-[10px] uppercase">
                {phq9.severity}
              </span>
            </div>
            {phq9.item9_flag && (
              <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-2">
                Self-harm item endorsed — safety guidance included above.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Text sentiment */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4.5 h-4.5" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">Text Sentiment</h4>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Prediction</span>
              <span className="font-bold text-slate-800">{text_prediction.prediction}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Confidence</span>
              <span className="font-mono text-slate-700 font-semibold">{pct(text_prediction.confidence)}%</span>
            </div>
            <div className="pt-1 space-y-1.5">
              {topProbabilities(text_prediction.probabilities).map(([label, p]) => (
                <div key={label}>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>{label}</span>
                    <span>{pct(p)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${pct(p)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Voice emotion */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-3">
            <Mic className="w-4.5 h-4.5" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">Voice Emotion</h4>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Emotion</span>
              <span className="font-bold text-slate-800 capitalize">{voice_prediction.emotion}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Confidence</span>
              <span className="font-mono text-slate-700 font-semibold">{pct(voice_prediction.confidence)}%</span>
            </div>
            <div className="pt-1 space-y-1.5">
              {(voice_prediction.top_k || []).slice(0, 3).map((t) => (
                <div key={t.emotion}>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span className="capitalize">{t.emotion}</span>
                    <span>{pct(t.probability)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: `${pct(t.probability)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Fusion-driven switch:
          HIGH / self-harm override  -> Emergency Support Card + crisis guidance
          LOW / MODERATE             -> personalized Gemini recommendations   */}
      {isEmergency ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-8 border-2 border-rose-200 bg-rose-50/60">
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="w-7 h-7 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-rose-700 mb-1">Please reach out for support now</h3>
                <p className="text-sm text-rose-700/90 leading-relaxed">
                  {gemini.emergency_guidance ||
                    "Some of your responses suggest you may be going through a very hard time. Please reach out for immediate support."}
                </p>
              </div>
            </div>

            {fusion.helpline && (
              <a
                href={`tel:${fusion.helpline.number}`}
                className="inline-flex items-center gap-2 text-base font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors px-5 py-3 rounded-xl mb-6"
              >
                <Phone className="w-5 h-5" />
                Call {fusion.helpline.name}: {fusion.helpline.number}
              </a>
            )}

            {/* Gentle grounding while help is reached */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {gemini.coping?.length > 0 && (
                <RecommendationCard title="Grounding right now" icon={<Activity className="w-5 h-5 text-rose-600" />} items={gemini.coping} />
              )}
              {gemini.mindfulness?.length > 0 && (
                <RecommendationCard title="Breathing & Mindfulness" icon={<Heart className="w-5 h-5 text-rose-600" />} items={gemini.mindfulness} />
              )}
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <>
          {/* Professional help callout */}
          {gemini.professional_help && gemini.when_to_seek_help && (
            <GlassCard className="p-6 mb-8">
              <div className="flex items-start gap-3">
                <Stethoscope className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">When to consider professional support</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{gemini.when_to_seek_help}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Personalized recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <RecommendationCard title="Recommendations" icon={<Sparkles className="w-5 h-5 text-blue-600" />} items={gemini.recommendations} />
            <RecommendationCard title="Coping Strategies" icon={<Activity className="w-5 h-5 text-teal-600" />} items={gemini.coping} />
            <RecommendationCard title="Lifestyle" icon={<Heart className="w-5 h-5 text-emerald-600" />} items={gemini.lifestyle} />
            <RecommendationCard title="Daily Habits" icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />} items={gemini.daily_habits} />
            <RecommendationCard title="Sleep" icon={<Clock className="w-5 h-5 text-indigo-600" />} items={gemini.sleep} />
            <RecommendationCard title="Breathing & Mindfulness" icon={<Sparkles className="w-5 h-5 text-teal-600" />} items={gemini.mindfulness} />
          </div>
        </>
      )}

      {/* Disclaimer */}
      <GlassCard className="p-6">
        <p className="text-[11px] text-slate-400 leading-relaxed">{gemini.disclaimer}</p>
      </GlassCard>
    </div>
  );
};

const RecommendationCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
}> = ({ title, icon, items }) => {
  if (!items || items.length === 0) return null;
  return (
  <GlassCard className="p-6">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">{title}</h3>
    </div>
    <ul className="space-y-2.5">
      {(items || []).map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </GlassCard>
  );
};
