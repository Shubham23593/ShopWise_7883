import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // Create session
  useEffect(() => {
    if (isOpen && !sessionId) initSession();
  }, [isOpen]);

  const initSession = async () => {
    const { data } = await axios.post(`${API_URL}/chat/session`);
    setSessionId(data.data.sessionId);

    setMessages([
      {
        role: "assistant",
        content:
          "👋 Hi! I'm ShopWise AI Assistant. How can I help you today?\n\nI can help you with:\n• Finding products\n• Order tracking\n• Shipping information\n• Returns & refunds\n• Account assistance",
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const msg = inputMessage.trim();
    setInputMessage("");

    // Push user message
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/chat/message`, {
        sessionId,
        message: msg,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.data.response,
          timestamp: data.data.timestamp,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I'm having trouble connecting. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#3B2F2F] text-white rounded-full shadow-2xl hover:scale-110 hover:bg-[#4D3F3F] transition-all duration-300 flex items-center justify-center z-[1000]"
        >
          <FaRobot className="text-3xl" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-[20px] shadow-2xl flex flex-col animate-fade-in z-[1001]">
          
          {/* HEADER */}
          <div className="bg-[#3B2F2F] p-6 rounded-t-[20px] flex justify-between items-center border-b border-white/10">
            <div className="flex gap-3.5 items-center">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                <FaRobot className="text-[28px] text-[#3B2F2F]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">ShopWise AI</h3>
                <div className="flex items-center gap-1.5 text-[13px] text-white/80">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></span>
                  <span>Online • Instant Reply</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all"
            >
              <FaTimes className="text-white" />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] space-y-5 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-slide-up`}>
                <div className={`w-9 h-9 flex-shrink-0 rounded-[10px] flex items-center justify-center ${
                  msg.role === "assistant" ? "bg-[#3B2F2F]" : "bg-gray-300"
                }`}>
                  {msg.role === "assistant" ? (
                    <FaRobot className="text-white text-lg" />
                  ) : (
                    <FaUser className="text-gray-600 text-lg" />
                  )}
                </div>

                <div className="max-w-[75%] flex flex-col gap-1.5">
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed text-[14.5px] shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#3B2F2F] text-white rounded-br-[4px]"
                        : "bg-white text-[#3B2F2F] rounded-bl-[4px]"
                    }`}
                  >
                    {msg.content.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < msg.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className={`text-[11px] opacity-60 px-2 ${msg.role === "user" ? "text-right" : ""}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-start animate-slide-up">
                <div className="w-9 h-9 bg-[#3B2F2F] rounded-[10px] flex items-center justify-center">
                  <FaRobot className="text-white text-lg" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-[4px] shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#3B2F2F] rounded-full animate-typing"></div>
                    <div className="w-2 h-2 bg-[#3B2F2F] rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#3B2F2F] rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-5 bg-white border-t border-gray-200 rounded-b-[20px]">
            <div className="flex items-center gap-3 bg-[#FAFAFA] border-2 border-gray-200 rounded-[14px] p-1 pl-4 transition-all focus-within:border-[#3B2F2F] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,47,47,0.1)]">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1 bg-transparent border-none outline-none text-[14.5px] text-[#3B2F2F] py-2 placeholder:text-gray-400"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="w-11 h-11 bg-[#3B2F2F] hover:bg-[#4D3F3F] disabled:opacity-50 disabled:cursor-not-allowed rounded-[10px] flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
              >
                <FaPaperPlane className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { 
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-pulse-slow {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-typing {
          animation: typing 1.4s infinite;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4D4D4;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A3A3A3;
        }

        @media (max-width: 480px) {
          .fixed.bottom-6.right-6.w-\\[420px\\] {
            width: calc(100vw - 32px);
            height: calc(100vh - 32px);
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
