# -*- coding: utf-8 -*-
"""
SukoonAI Configuration Settings
"""

class Config:
    PROJECT_NAME: str = "SukoonAI"
    API_VERSION: str = "3.0.0"
    
    # Storage structures
    UPLOAD_DIR: str = "uploads"
    VOICE_UPLOAD_DIR: str = "uploads/voice"
    CHAT_UPLOAD_DIR: str = "uploads/chat"
    
    # Safety thresholds
    MAX_AUDIO_SIZE_BYTES: int = 15 * 1024 * 1024  # 15MB max
    
    # Model Weights configuration
    MODEL_WEIGHT_QUESTIONNAIRE: float = 0.35
    MODEL_WEIGHT_SENTIMENT: float = 0.35
    MODEL_WEIGHT_VOICE: float = 0.30
