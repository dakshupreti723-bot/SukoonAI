from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import sys
from pathlib import Path

# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from models.sentiment.inference import predict_sentiment

router = APIRouter()


class MessageSchema(BaseModel):
    sender: str
    text: str
    timestamp: str


class ChatPayloadSchema(BaseModel):
    messages: List[MessageSchema]


@router.post("/sentiment")
async def evaluate_sentiment(payload: ChatPayloadSchema):

    # Combine all user messages into one journal
    journal_text = "\n".join(
        m.text for m in payload.messages if m.sender == "user"
    )

    result = predict_sentiment(journal_text)

    prediction = result["prediction"]
    confidence = result["confidence"]
    probabilities = result["probabilities"]

    positivity = probabilities.get("Normal", 0.0)

    anxiety = max(
        probabilities.get("Anxiety", 0.0),
        probabilities.get("Stress", 0.0)
    )

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": probabilities,

        # Backward-compatible fields
        "dominantEmotion": prediction,
        "positivityScore": positivity,
        "anxietyScore": anxiety,

        "summary": f"Journal classified as {prediction} ({confidence:.2f} confidence).",

        "indicators": [
            "Transformer-based mental health classifier.",
            "Prediction generated from journal text."
        ]
    }