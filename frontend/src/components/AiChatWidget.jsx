import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../config/Api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const AiChatWidget = ({ chatOpen, setChatOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLogin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  // AI chat storage
  const storageKey =
    user && isLogin
      ? `healthup-ai-chat-${user._id}` // user specific
      : "healthup-ai-chat-guest"; // guest specific

  // Load chat history from storage
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([]);
    }
  }, [storageKey]);

  /* Save chat history */
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Welcome message when first opened
  useEffect(() => {
    if (!chatOpen) return;

    if (messages.length === 0) {
      const welcome = [
        {
          role: "ai",
          text: "Hi, I'm FitAI. Ask me about health queries..",
        },
      ];

      setMessages(welcome);
      sessionStorage.setItem(storageKey, JSON.stringify(welcome));
    }
  }, [chatOpen]);

  const detectType = (text) => {
    if (text.includes("workout")) return "WORKOUT_PLAN";
    if (text.includes("diet")) return "DIET_PLAN";
    if (text.includes("protein")) return "PROTEIN_RECOMMENDATION";
    return "PROGRESS_ANALYSIS";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageText = input;
    const requestType = detectType(input);

    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setInput("");
    setTyping(true);

    try {
      const endpoint = user && isLogin ? "/user/chat" : "/public/chat";

      const res = await api.post(endpoint, {
        type: requestType,
        userProfile: {
          age: user?.age,
          weight: user?.weight,
          height: user?.height,
          goal: user?.goal,
          experienceLevel: user?.experienceLevel,
        },
        message: messageText,
      });

      setMessages((prev) => [...prev, { role: "ai", text: res.data.reply }]);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 403) {
        if (user && isLogin) {
          toast.error(
            "Your free AI service for today is completed. Please upgrade.",
          );
        } else {
          toast.error("Please login or signup to access more.");
          setTimeout(() => navigate("/login"), 1200);
        }
        return;
      }
      toast.error("Something went wrong.");
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => {
    setChatOpen(false);
  }, [location, setChatOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        disabled={chatOpen}
        className={`fixed bottom-6 right-4 md:bottom-4 md:right-6 z-50 bg-linear-to-r from-blue-500 to-blue-400 backdrop-blur-xl border border-white/10 text-white px-3 py-2 rounded-full shadow-2xltransition-all duration-300  ${chatOpen ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        Ask FitAI
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-16 right-6 w-80 h-100 bg-[#020617]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between">
            <h3 className="text-white font-semibold">Chat with FitAI</h3>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white cursor-pointer hover:text-red-500"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3  no-scrollbar ">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 ml-auto text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {typing && <p className="text-gray-400 text-sm">AI is typing...</p>}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about health..."
              className="flex-1 bg-[#0f172a] text-white px-6 py-2 rounded-full outline-none"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="bg-linear-to-r from-purple-500 to-purple-600 cursor-pointer px-4 rounded-full text-white"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
