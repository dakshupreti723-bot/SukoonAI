import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { ProgressBar } from "../components/ProgressBar";
import { GlassCard } from "../components/GlassCard";
import { ChatBox } from "../components/ChatBox";
import { submitSentimentChat } from "../services/sentimentAPI";
import { Sparkles, ArrowRight, MessageSquare, Info } from "lucide-react";
import { motion } from "motion/react";

export const ChatAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { chatMessages, setChatMessages, setSentimentResult } = useUser();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto therapeutic prompts matching classic cognitive-behavioral clinical dialogue
  const clinicalResponses = [
    "I appreciate you sharing that with me. It takes strength to verbalize these emotions. Tell me, how has this been impacting your daily energy levels?",
    "Thank you for being open. How long have you felt this way, and do you feel you have a support system around you?",
    "I understand completely. We are recording these lexical indicators to compile your acoustic and sentiment profile. Shall we proceed to the voice biometrics step next?"
  ];

  const handleSendMessage = async (userText: string) => {
    // 1. Add user message
    const userMsg = {
      sender: "user" as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setIsAnalyzing(true);

    // 2. Simulate professional diagnostic clinical feedback
    setTimeout(() => {
      const stage = Math.min(
        Math.floor((chatMessages.length) / 2),
        clinicalResponses.length - 1
      );
      
      const aiResponse = {
        sender: "ai" as const,
        text: clinicalResponses[stage],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleFinishChat = async () => {
    setIsAnalyzing(true);
    try {
      const result = await submitSentimentChat(chatMessages);
      setSentimentResult(result);
      navigate("/voice-assessment");
    } catch (err) {
      console.error("Failed to compile sentiment metrics", err);
      navigate("/voice-assessment");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Require at least 2 user messages before allowing submission for robust data compilation
  const userMessageCount = chatMessages.filter(m => m.sender === "user").length;
  const isSubmissionAllowed = userMessageCount >= 2;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="chat-assessment-page">
      
      {/* 1. Stepper Header */}
      <ProgressBar currentStep="chat" />

      {/* 2. Side Information Banner & Core Chatbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side Clinical Context */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2.5 text-blue-600 mb-4">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Sentiment NLP</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              This model evaluates qualitative emotional responses. It screens for markers of cognitive distortions, emotional flatness, or somatic fatigue through written lexical patterns.
            </p>

            <div className="bg-blue-50/50 p-4.5 rounded-2xl border border-blue-100 flex gap-2.5">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Please exchange <b>at least 2 messages</b> with our conversational clinical assistant. When finished, click the proceed button on the bottom right.
              </p>
            </div>
          </GlassCard>

          {/* Proceed Trigger Button */}
          {isSubmissionAllowed && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <button
                onClick={handleFinishChat}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all cursor-pointer scale-100 hover:scale-[1.01]"
              >
                <span>Compile & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Side Main Chat Workspace */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <ChatBox
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isAnalyzing={isAnalyzing}
            />
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
