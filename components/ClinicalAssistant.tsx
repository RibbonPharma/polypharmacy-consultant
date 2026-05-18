
import React, { useState } from 'react';
import { BrainCircuit, Send, Loader2, ShieldCheck, HelpCircle, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { askClinicalAi } from '../services/geminiService';
import { Patient, AnalysisResult, FeedbackRating } from '../types';
import { submitFeedback } from '../services/feedbackService';

interface ClinicalAssistantProps {
  patient: Patient;
  analysis: AnalysisResult | null;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    feedback?: FeedbackRating;
}

const ClinicalAssistant: React.FC<ClinicalAssistantProps> = ({ patient, analysis }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;

    const userMsgText = query.trim();
    const tempId = Date.now().toString();
    
    setQuery('');
    setHistory(prev => [...prev, { id: tempId, role: 'user', text: userMsgText }]);
    setIsLoading(true);

    try {
      const response = await askClinicalAi(userMsgText, patient, analysis);
      const aiMsgId = (Date.now() + 1).toString();
      setHistory(prev => [...prev, { id: aiMsgId, role: 'ai', text: response }]);
    } catch (e) {
      setHistory(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "오류가 발생했습니다." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (msgId: string, rating: FeedbackRating) => {
    const msgIndex = history.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    // Update local state immediately
    const updatedHistory = [...history];
    updatedHistory[msgIndex].feedback = rating;
    setHistory(updatedHistory);

    // Submit to service
    await submitFeedback({
        targetId: msgId, // In real app, this would be a message UUID
        category: 'CHAT',
        rating: rating,
        comment: '', // Optional: Add comment modal later if needed
        timestamp: new Date().toISOString()
    });
  };

  // Helper function to render text with clickable links
  const renderMessageWithLinks = (text: string) => {
    // Regex to match URLs (http or https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mb-4 max-h-[400px]" aria-labelledby="assistant-title">
      <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
        <h3 id="assistant-title" className="text-sm font-bold text-indigo-900 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" aria-hidden="true" />
          임상 AI 어시스턴트
        </h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-full border border-indigo-200">
          <ShieldCheck className="w-3 h-3 text-indigo-600" aria-hidden="true" />
          <span className="text-[10px] font-bold text-indigo-700">개인정보 비식별화됨</span>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 hide-scrollbar min-h-[150px]" 
        aria-live="polite"
      >
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center py-4">
             <HelpCircle className="w-8 h-8 mb-2" aria-hidden="true" />
             <p className="text-xs font-medium">환자의 임상 상태나 약물에 대해<br/>무엇이든 물어보세요.</p>
          </div>
        ) : (
          history.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[90%] p-3 rounded-2xl text-xs sm:text-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none font-sans' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm font-mono whitespace-pre-wrap leading-relaxed'
                }`}
                aria-label={msg.role === 'user' ? "사용자 메시지" : "AI 답변"}
              >
                {renderMessageWithLinks(msg.text)}
              </div>
              
              {/* Feedback Controls for AI messages */}
              {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mt-1 ml-1">
                      {msg.feedback ? (
                          <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                             <Check className="w-3 h-3" /> Feedback sent
                          </span>
                      ) : (
                          <>
                            <button 
                                onClick={() => handleFeedback(msg.id, 'POSITIVE')}
                                className="p-1 text-slate-300 hover:text-teal-600 hover:bg-white rounded transition-colors"
                                title="유용함"
                            >
                                <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={() => handleFeedback(msg.id, 'NEGATIVE')}
                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-white rounded transition-colors"
                                title="부정확함"
                            >
                                <ThumbsDown className="w-3 h-3" />
                            </button>
                          </>
                      )}
                  </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm" aria-label="답변 생성 중">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" aria-hidden="true" />
             </div>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="예: 어지러움 증상이 있는데 약 때문일까?"
            className="w-full pl-3 pr-10 py-2.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            aria-label="임상 질문 입력"
          />
          <button 
            onClick={handleSend}
            disabled={!query.trim() || isLoading}
            className="absolute right-1.5 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-30 focus:ring-2 focus:ring-indigo-500 outline-none"
            aria-label="질문 보내기"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClinicalAssistant;
