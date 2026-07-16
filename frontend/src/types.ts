// Frontend type contracts. These mirror the real Python backend responses
// (backend/routes/*.py and models/fusion/fusion_engine.py).

export interface QuestionnaireAnswers {
  q1: number; // Little interest or pleasure in doing things
  q2: number; // Feeling down, depressed, or hopeless
  q3: number; // Trouble falling or staying asleep, or sleeping too much
  q4: number; // Feeling tired or having little energy
  q5: number; // Poor appetite or overeating
  q6: number; // Feeling bad about yourself
  q7: number; // Trouble concentrating on things
  q8: number; // Moving/speaking slowly or being restless
  q9: number; // Thoughts that you would be better off dead
}

// ---- Per-step endpoint responses ----------------------------------------

export interface QuestionnaireResult {
  score: number;
  severity: "Minimal" | "Mild" | "Moderate" | "Moderately Severe" | "Severe";
  recommendations: string[];
}

export interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

// POST /api/sentiment
export interface SentimentResult {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  // Backward-compatible convenience fields returned by the route:
  dominantEmotion: string;
  positivityScore: number;
  anxietyScore: number;
  summary: string;
  indicators: string[];
}

// POST /api/voice
export interface VoiceResult {
  emotion: string;
  confidence: number; // percent, 0-100
  riskScore: number; // 0-100
  topPredictions: { emotion: string; probability: number }[];
  probabilities: Record<string, number>;
  analysis: string;
}

// ---- Consolidated POST /api/final contract ------------------------------

export interface TextPrediction {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface VoicePrediction {
  emotion: string;
  confidence: number; // 0-1
  top_k: { emotion: string; probability: number }[];
  probabilities: Record<string, number>;
  transcript_prediction?: string;
}

export interface Phq9Block {
  total: number;
  severity: string;
  normalized: number; // 0-1
  item9_flag: boolean;
}

export interface FusionBlock {
  fused_score: number; // 0-1
  risk_level: "Low" | "Medium" | "High";
  overridden: boolean;
  override_reason: string | null;
  breakdown: Record<string, any>;
  recommendation: string;
  helpline: { name: string; number: string } | null;
}

export interface GeminiBlock {
  message: string;
  summary: string;
  recommendations: string[];
  coping: string[];
  lifestyle: string[];
  daily_habits: string[];
  sleep: string[];
  mindfulness: string[];
  when_to_seek_help: string;
  professional_help: boolean;
  emergency: boolean;
  emergency_guidance: string;
  disclaimer: string;
}

export interface FinalReportResult {
  text_prediction: TextPrediction;
  voice_prediction: VoicePrediction;
  phq9: Phq9Block;
  face_prediction: unknown | null;
  fusion: FusionBlock;
  gemini: GeminiBlock;
}
