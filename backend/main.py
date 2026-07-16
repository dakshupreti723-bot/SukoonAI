# -*- coding: utf-8 -*-
"""
SukoonAI Python FastAPI Mock Backend Service
This file provides the production-ready structure for integrating AI models
later, while exposing mock endpoints that return realistic analytical payloads.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

app = FastAPI(
    title="SukoonAI Mental Wellness API",
    description="FastAPI service for Questionnaire analysis, Conversational Sentiment, and Voice Emotion processing",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define schemas for input payloads
class QuestionnairePayload(BaseModel):
    answers: Dict[str, int]

class ChatMessage(BaseModel):
    sender: str  # "user" or "ai"
    text: str

class SentimentPayload(BaseModel):
    chatHistory: List[ChatMessage]

class VoicePayload(BaseModel):
    audioData: Optional[str] = None  # Base64 string
    durationSeconds: Optional[float] = 12.5

class FinalReportPayload(BaseModel):
    questionnaireScore: int
    sentimentResults: Dict[str, Any]
    voiceResults: Dict[str, Any]

@app.get("/")
def read_root():
    return {
        "app": "SukoonAI API",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

# 1. Questionnaire Scoring Endpoint
@app.post("/questionnaire")
async def analyze_questionnaire(payload: QuestionnairePayload):
    total_score = sum(payload.answers.values())
    
    if total_score < 5:
        severity = "Minimal"
        description = "Your responses suggest standard daily emotional fluctuations with minimal indicators of clinical distress."
        advice = [
            "Maintain your active sleep hygiene and positive daily routines.",
            "Check in with yourself weekly using our self-reflection tools."
        ]
    elif total_score < 10:
        severity = "Mild"
        description = "Your responses indicate mild emotional fatigue or temporary stress levels. This is quite common and often responds well to self-care."
        advice = [
            "Incorporate daily 10-minute mindfulness or structured breathing intervals.",
            "Consider logging your sleep and activity levels in a structured journal."
        ]
    elif total_score < 15:
        severity = "Moderate"
        description = "Your answers suggest moderate emotional fatigue or persistent anxiety traits. It could be beneficial to explore guided clinical support."
        advice = [
            "Engage in supportive, structured conversations with close confidants or peer networks.",
            "Practice daily clinical breathing protocols (such as box breathing).",
            "Consider scheduling a brief introductory consultation with a licensed counselor."
        ]
    elif total_score < 20:
        severity = "Moderately Severe"
        description = "Your responses reflect significant distress, consistent with moderately severe emotional pressure or burnout."
        advice = [
            "We highly recommend speaking with a qualified mental health practitioner for a personalized assessment.",
            "Focus on core physical wellbeing pillars: solid sleep, consistent meals, and gentle movement.",
            "Utilize supportive resources, helplines, or primary care providers."
        ]
    else:
        severity = "Severe"
        description = "Your responses indicate severe emotional overwhelm. Immediate proactive support and consultation are strongly advised."
        advice = [
            "Please connect with a trusted healthcare professional or emergency wellness coordinator immediately.",
            "Avoid self-isolation; share your feelings with immediate family or verified support helplines.",
            "Seek a professional clinical diagnostic evaluation."
        ]

    return {
        "status": "success",
        "score": total_score,
        "maxScore": 27,
        "severity": severity,
        "description": description,
        "actionableAdvice": advice,
        "assessedAt": datetime.utcnow().isoformat(),
        "recommendations": {
            "therapyRecommended": total_score >= 10,
            "suggestedFrequency": "Weekly" if total_score >= 15 else "Bi-weekly",
            "selfCareModules": ["Mindful Breathing", "Cognitive Reframing", "Sleep Tracking"]
        }
    }

# 2. Sentiment/AI Conversation Analysis Endpoint
@app.post("/sentiment")
async def analyze_sentiment(payload: SentimentPayload):
    word_count = 0
    anxiety_weight = 0
    cognitive_distortions = []

    for msg in payload.chatHistory:
        if msg.sender == "user":
            text_lower = msg.text.lower()
            word_count += len(text_lower.split())
            
            if "tired" in text_lower or "sleep" in text_lower or "exhausted" in text_lower:
                anxiety_weight += 2
            if "worry" in text_lower or "anxious" in text_lower or "stress" in text_lower or "panic" in text_lower:
                anxiety_weight += 3
            if "always" in text_lower or "never" in text_lower or "cannot" in text_lower:
                cognitive_distortions.append("All-or-Nothing Thinking")
            if "guilty" in text_lower or "fault" in text_lower or "blame" in text_lower:
                cognitive_distortions.append("Personalization")

    if word_count < 10:
        anxiety_weight = 3

    emotions = [
        {"name": "Calm", "percentage": max(10, 80 - anxiety_weight * 10)},
        {"name": "Anxious", "percentage": min(60, 15 + anxiety_weight * 12)},
        {"name": "Fatigued", "percentage": min(50, 10 + anxiety_weight * 8)},
        {"name": "Hopeful", "percentage": max(15, 45 - anxiety_weight * 5)}
    ]
    emotions.sort(key=lambda x: x["percentage"], reverse=True)

    distortions = list(set(cognitive_distortions))
    if not distortions:
        distortions = ["Overgeneralization (Subtle traces)"]

    return {
        "status": "success",
        "analysisSummary": "The conversation reveals moderate cognitive pressure with prominent markers of stress-induced fatigue. Overall communicative flow shows active, healthy introspective capacity.",
        "primaryEmotions": emotions,
        "linguisticIndicators": {
            "expressiveness": "High" if word_count > 100 else "Moderate" if word_count > 30 else "Reserved",
            "cognitiveLoadIndex": min(10.0, 2.0 + (anxiety_weight / 2.0)),
            "pacing": "Evenly distributed with subtle reflective pauses"
        },
        "cognitiveDistortions": distortions,
        "keyThemes": ["Academic/Work Demands", "Sleep Disturbance", "Self-Expectation Cycles"],
        "analyzedAt": datetime.utcnow().isoformat()
    }

# 3. Voice Emotion Analysis Endpoint
@app.post("/voice")
async def analyze_voice(payload: VoicePayload):
    # Simulated prosody & acoustic extraction
    duration = payload.durationSeconds or 12.5
    
    voice_emotions = [
        {"tone": "Warm/Empathetic", "confidence": 0.72},
        {"tone": "Fatigued/Low Energy", "confidence": 0.65},
        {"tone": "Tense/Anxious", "confidence": 0.38},
        {"tone": "Assertive/Determined", "confidence": 0.44}
    ]
    voice_emotions.sort(key=lambda x: x["confidence"], reverse=True)

    return {
        "status": "success",
        "acousticMetrics": {
            "durationSeconds": duration,
            "speechRateWPM": 124,
            "fundamentalFrequencyHz": 198.5,
            "stabilityScore": 84.5,
            "microTremorsDetected": False
        },
        "voiceEmotions": voice_emotions,
        "clinicalIndicators": {
            "vocalPacing": "Consistent, indicating structured cognitive control.",
            "hesitationIndex": "Mild. Saccadic pause intervals detected near transitions.",
            "energyLevel": "Slightly diminished, coinciding with cognitive exhaustion indicators."
        },
        "analyzedAt": datetime.utcnow().isoformat()
    }

# 4. Final Comprehensive Report Synthesis
@app.post("/final")
async def generate_final_report(payload: FinalReportPayload):
    q_score = payload.questionnaireScore
    
    sentiment_results = payload.sentimentResults
    primary_emotion = "Anxious"
    if sentiment_results and "primaryEmotions" in sentiment_results:
        primary_emotion = sentiment_results["primaryEmotions"][0]["name"]

    voice_results = payload.voiceResults
    voice_tone = "Warm/Empathetic"
    if voice_results and "voiceEmotions" in voice_results:
        voice_tone = voice_results["voiceEmotions"][0]["tone"]

    # Formulate a Mindset Index (0-100 where 100 is optimal calm wellness, 0 is severe distress)
    q_weight = (1.0 - (min(27.0, float(q_score)) / 27.0)) * 50.0  # Max 50 pts
    sentiment_weight = 30.0 if primary_emotion in ["Calm", "Hopeful"] else 15.0  # Max 30 pts
    voice_weight = 20.0 if "Warm" in voice_tone or "Assertive" in voice_tone else 10.0  # Max 20 pts
    
    mindset_index = int(round(q_weight + sentiment_weight + voice_weight))

    summary_category = "Slightly Unbalanced"
    coping_recommendations = [
        "Guided box breathing intervals: 4s inhale, 4s hold, 4s exhale, 4s hold, twice daily.",
        "Incorporate structured sleep timings: aim to retire by 11:00 PM for optimal deep sleep cycles.",
        "Journaling: Write down 3 micro-successes before rest to combat personalization trends."
    ]

    if mindset_index >= 85:
        summary_category = "Resilient & Stable"
        coping_recommendations = [
            "Continue tracking positive daily habits.",
            "Share your stress management practices with peer groups."
        ]
    elif mindset_index >= 60:
        summary_category = "Optimized under Tension"
        coping_recommendations = [
            "Incorporate micro-breaks during long study/work periods.",
            "Engage in a creative or athletic outlet once every two days."
        ]
    elif mindset_index < 45:
        summary_category = "Heavily Overburdened"
        coping_recommendations = [
            "Seek a professional therapeutic consultation.",
            "Significantly downscale current commitments to protect mental reserves.",
            "Initiate grounding audio sensory meditations twice daily."
        ]

    return {
        "status": "success",
        "overallReport": {
            "mindsetIndex": mindset_index,
            "statusLabel": summary_category,
            "timestamp": datetime.utcnow().isoformat(),
            "clinicalDisclaimers": "This report provides analytical insights for personal self-awareness, emotional tracking, and reflection. It is NOT a professional psychiatric diagnosis, clinical evaluation, or treatment prescription. If you are experiencing acute distress, please contact licensed medical practitioners or local safety resources immediately.",
            "crossModuleSynergy": "We notice a convergence between your physical fatigue indices (moderate PHQ score) and conversational tone (reserved pace). Vocal characteristics confirm a calmer physical presence, suggesting excellent adaptive capacity to emotional stress."
        },
        "copingStrategy": {
            "immediateActions": coping_recommendations,
            "longTermStrategy": "Adopt cognitive behavioral journaling techniques paired with paced cardiac-coherence vocal exercises to build resilience.",
            "suggestedModules": ["Sleep Restoration", "Vocal Coaching for Anxiety", "Mindfulness Foundations"]
        },
        "therapistReferral": {
            "tier": "Recommended" if q_score >= 12 else "Optional Reference",
            "focusAreas": ["Stress Management", "Cognitive Distortion Balancing", "Somatic Grounding"],
            "contacts": [
                { "name": "Dr. Rachel Sterling, Psy.D", "specialty": "Anxiety & Cognitive Therapy", "email": "sterling.wellness@clinical.org" },
                { "name": "Prof. Kenneth Mercer", "specialty": "Stress Management & Young Adult Counselling", "email": "k.mercer@wellnesscare.net" }
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
