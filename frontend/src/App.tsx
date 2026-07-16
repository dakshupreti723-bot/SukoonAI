import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { MainLayout } from "./layouts/MainLayout";
import { Landing } from "./pages/Landing";
import { Questionnaire } from "./pages/Questionnaire";
import { ChatAssessment } from "./pages/ChatAssessment";
import { VoiceAssessment } from "./pages/VoiceAssessment";
import { Result } from "./pages/Result";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";

// Helper component to scroll window to top upon route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ScrollToTop />
        <MainLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/chat-assessment" element={<ChatAssessment />} />
            <Route path="/voice-assessment" element={<VoiceAssessment />} />
            <Route path="/result" element={<Result />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </MainLayout>
      </UserProvider>
    </BrowserRouter>
  );
}
