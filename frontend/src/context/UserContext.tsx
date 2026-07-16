import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  QuestionnaireAnswers, 
  QuestionnaireResult, 
  Message, 
  SentimentResult, 
  VoiceResult, 
  FinalReportResult 
} from "../types";

interface UserContextType {
  // User Profile Basic Info
  userName: string;
  setUserName: (name: string) => void;
  userAge: string;
  setUserAge: (age: string) => void;
  
  // Step Navigation
  currentStep: "intro" | "questionnaire" | "chat" | "voice" | "loading" | "result";
  setCurrentStep: (step: "intro" | "questionnaire" | "chat" | "voice" | "loading" | "result") => void;

  // Step 1: Questionnaire
  questionnaireAnswers: QuestionnaireAnswers;
  setQuestionnaireAnswers: (answers: QuestionnaireAnswers) => void;
  questionnaireResult: QuestionnaireResult | null;
  setQuestionnaireResult: (res: QuestionnaireResult | null) => void;

  // Step 2: Sentiment Chat
  chatMessages: Message[];
  setChatMessages: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  sentimentResult: SentimentResult | null;
  setSentimentResult: (res: SentimentResult | null) => void;

  // Step 3: Voice Analysis
  recordedBlob: Blob | null;
  setRecordedBlob: (blob: Blob | null) => void;
  voiceResult: VoiceResult | null;
  setVoiceResult: (res: VoiceResult | null) => void;

  // Final Composite Output
  finalReport: FinalReportResult | null;
  setFinalReport: (res: FinalReportResult | null) => void;

  // Reset State
  resetAssessment: () => void;
}

const defaultAnswers: QuestionnaireAnswers = {
  q1: 0,
  q2: 0,
  q3: 0,
  q4: 0,
  q5: 0,
  q6: 0,
  q7: 0,
  q8: 0,
  q9: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>("");
  const [userAge, setUserAge] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<"intro" | "questionnaire" | "chat" | "voice" | "loading" | "result">("intro");
  
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswers>(defaultAnswers);
  const [questionnaireResult, setQuestionnaireResult] = useState<QuestionnaireResult | null>(null);

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am SukoonAI's conversational clinical system. How have you been feeling over the last two weeks? Please feel free to share whatever is on your mind.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);

  const [finalReport, setFinalReport] = useState<FinalReportResult | null>(null);

  const resetAssessment = () => {
    setQuestionnaireAnswers(defaultAnswers);
    setQuestionnaireResult(null);
    setChatMessages([
      {
        sender: "ai",
        text: "Hello! I am SukoonAI's conversational clinical system. How have you been feeling over the last two weeks? Please feel free to share whatever is on your mind.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSentimentResult(null);
    setRecordedBlob(null);
    setVoiceResult(null);
    setFinalReport(null);
    setCurrentStep("intro");
  };

  return (
    <UserContext.Provider value={{
      userName,
      setUserName,
      userAge,
      setUserAge,
      currentStep,
      setCurrentStep,
      questionnaireAnswers,
      setQuestionnaireAnswers,
      questionnaireResult,
      setQuestionnaireResult,
      chatMessages,
      setChatMessages,
      sentimentResult,
      setSentimentResult,
      recordedBlob,
      setRecordedBlob,
      voiceResult,
      setVoiceResult,
      finalReport,
      setFinalReport,
      resetAssessment,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
