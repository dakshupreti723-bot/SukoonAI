import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "./GlassCard";

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isAnalyzing: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isAnalyzing }) => {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested quick prompts to support rapid testing
  const suggestions = [
    "I've been feeling extremely exhausted and burnt out at work.",
    "Lately, I feel anxious and find it difficult to fall asleep.",
    "Actually, I've had a peaceful and balanced week with family.",
    "I feel overwhelmed with sadness but cannot point out why."
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const selectSuggestion = (text: string) => {
    onSendMessage(text);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  return (
    <div className="flex flex-col h-[520px] rounded-[28px] border border-white/60 bg-white/25 backdrop-blur-xl overflow-hidden shadow-2xl shadow-slate-100" id="sentiment-conversational-chatbox">
      
      {/* Mini Clinical Chat Header */}
      <div className="bg-white/50 border-b border-white/30 py-3.5 px-5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Clinical Sentiment Analysis Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50/80 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Model NLP v2.1</span>
        </div>
      </div>

      {/* Message List area */}
      <div className="flex-grow overflow-y-auto p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((m, index) => {
            const isUser = m.sender === "user";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex items-start gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {/* AI Icon Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                )}

                <div 
                  className={`
                    max-w-[80%] rounded-2xl px-4.5 py-3.5 text-xs md:text-sm shadow-md leading-relaxed
                    ${isUser 
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-100" 
                      : "bg-white/80 border border-white/50 text-slate-800 rounded-tl-none"
                    }
                  `}
                >
                  <p>{m.text}</p>
                  <span className={`block text-[9px] mt-2 text-right ${isUser ? "text-blue-200/80" : "text-slate-400"}`}>
                    {m.timestamp}
                  </span>
                </div>

                {/* User Icon Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md shadow-blue-100">
                    <User className="w-4.5 h-4.5" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              
              <div className="bg-slate-50/80 border border-slate-200/40 rounded-2xl px-4.5 py-3 text-xs text-slate-500 flex items-center gap-2 rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="font-medium">Analyzing diagnostic sentiments...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && !isAnalyzing && (
        <div className="bg-white/40 px-5 py-3.5 border-t border-white/30 backdrop-blur-md">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">Suggested clinical prompts:</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(s)}
                className="text-xs bg-white/70 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-xl border border-slate-200/50 cursor-pointer transition-colors shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Footer */}
      <form onSubmit={handleSend} className="bg-white/50 border-t border-white/30 p-4.5 flex gap-3 items-center backdrop-blur-md">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isAnalyzing}
          placeholder="Type how you are feeling internally right now..."
          className="flex-grow px-4.5 py-3.5 rounded-2xl border border-slate-200/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs md:text-sm bg-white/80 disabled:opacity-60"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isAnalyzing || !inputText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl p-3.5 shadow-lg shadow-blue-100 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>
    </div>
  );
};
