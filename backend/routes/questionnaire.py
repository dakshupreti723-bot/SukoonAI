# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

class QuestionnaireAnswersSchema(BaseModel):
    q1: int = Field(..., ge=0, le=3, description="Anhedonia rating")
    q2: int = Field(..., ge=0, le=3, description="Depressive mood rating")
    q3: int = Field(..., ge=0, le=3, description="Insomnia or sleep disruption rating")
    q4: int = Field(..., ge=0, le=3, description="Somatic fatigue rating")
    q5: int = Field(..., ge=0, le=3, description="Appetite deviation rating")
    q6: int = Field(..., ge=0, le=3, description="Negative self-image rating")
    q7: int = Field(..., ge=0, le=3, description="Concentration rating")
    q8: int = Field(..., ge=0, le=3, description="Psychomotor change rating")
    q9: int = Field(..., ge=0, le=3, description="Self-harm thoughts rating")

@router.post("/questionnaire")
async def evaluate_questionnaire(payload: QuestionnaireAnswersSchema):
    # Sum the clinical metrics from 0 to 27
    total_score = sum([
        payload.q1, payload.q2, payload.q3, payload.q4,
        payload.q5, payload.q6, payload.q7, payload.q8, payload.q9
    ])
    
    severity = "Minimal"
    recommendations = ["Continue standard wellness patterns."]
    
    if total_score >= 20:
        severity = "Severe"
        recommendations = [
            "Initiate immediate clinical safety consultation.",
            "Contact your nearest psychiatric advisor or clinical care emergency."
        ]
    elif total_score >= 15:
        severity = "Moderately Severe"
        recommendations = [
            "We strongly suggest consulting a licensed therapist.",
            "Downscale non-essential commitments."
        ]
    elif total_score >= 10:
        severity = "Moderate"
        recommendations = [
            "Initiate daily breathing and emotional check-in modules.",
            "Consult with supportive peer groups."
        ]
    elif total_score >= 5:
        severity = "Mild"
        recommendations = [
            "Maintain sleep diaries and wellness checkups.",
            "Introduce low-impact daily aerobic walks."
        ]
        
    return {
        "score": total_score,
        "severity": severity,
        "recommendations": recommendations
    }
