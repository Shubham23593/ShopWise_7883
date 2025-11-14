import React, { useState, useEffect, useRef } from "react";
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && user && !sessionId) {
      initializeChat();
    }
  }, [isOpen, user]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      console.log('🔑 Initializing chat...');
      console.log('Token exists:', !!token);
      console.log('User:', user?.name);

      if (!token) {
        toast.error("Please login to use chat");
        setIsOpen(false);
        return;
      }

      const { data } = await axios.post(
        "http://localhost:5000/api/chat/session",
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('✅ Chat initialized:', data);

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setMessages(data.data.messages || []);
        toast.success("Chat started! 💬");
      }
    } catch (error) {
      console.error("❌ Error initializing chat:", error);
      console.error("Response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || "Failed to start chat. Please try again.";
      toast.error(errorMessage);
      
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) {
      toast.warn("Please enter a message");
      return;
    }

    if (!sessionId) {
      toast.error("Chat session not active. Please reopen chat.");
      setIsOpen(false);
      return;
    }

    const userMessage = {
      sender: "user",
      message: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");

      console.log('📨 Sending message...');
      console.log('Session ID:', sessionId);
      console.log('Message:', messageText);

      const { data } = await axios.post(
        "http://localhost:5000/api/chat/message",
        {
          sessionId,
          message: messageText,
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('✅ Response received:', data);

      if (data.success && data.data.botMessage) {
        setTimeout(() => {
          setMessages((prev) => [...prev, data.data.botMessage]);
          setIsTyping(false);
        }, 500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      console.error("Error response:", error.response?.data);
      
      setIsTyping(false);
      
      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1));
      
      const errorMessage = error.response?.data?.message || "Failed to send message. Please try again.";
      toast.error(errorMessage);
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message: "Sorry, I'm having trouble right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-110 ${
          isOpen ? "hidden" : "block"
        }`}
      >
        <FaComments className="text-2xl" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <FaRobot className="text-blue-600 text-xl" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold">ShopWise Assistant</h3>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-2" />
                  <p className="text-gray-600">Starting chat...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <FaRobot className="text-6xl mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Say hi! 👋</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index}>
                  <div
                    className={`flex gap-2 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender !== "user" && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaRobot className="text-white text-sm" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none shadow"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-white text-sm" />
                      </div>
                    )}
                  </div>

                  {/* Quick Replies */}
                  {msg.metadata?.quickReplies && msg.metadata.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-10">
                      {msg.metadata.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          className="bg-white border-2 border-blue-600 text-blue-600 px-3 py-1 rounded-full text-xs hover:bg-blue-600 hover:text-white transition"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaRobot className="text-white text-sm" />
                </div>
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none shadow px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || !sessionId}
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading || !sessionId}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => sendMessage("Track my order")}
                disabled={isLoading || !sessionId}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
              >
                📦 Track Order
              </button>
              <button
                onClick={() => sendMessage("Show me products")}
                disabled={isLoading || !sessionId}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
              >
                🛍️ Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;