import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

function FloatingChatBox({ type, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // 1️⃣ Fetch history once when chat opens
  useEffect(() => {

    const convertTimestamps = (msgs) =>
    msgs.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : null,
    }));

    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/chatbot/history");
        if (data.length > 0) {
          setMessages(convertTimestamps(data));
        } else {
          setMessages([
            {
              from: "system",
              text: "👋 Hello! I'm Rapha. I can help you with pet care advice, appointment scheduling, medical questions, and general pet health information. How can I assist you today?",
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([
          {
            from: "system",
            text: "👋 Hello! I'm Rapha. I can help you with pet care advice, appointments, and health info.",
            timestamp: new Date(),
          },
        ]);
      }
    };

    fetchHistory();
  }, []); // run only once when component mounts

  // 2️⃣ Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 3️⃣ Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const { data } = await api.post("/chatbot/chat", { message: input }); // token auto-attached

      const aiMessage = { from: "system", text: data.reply, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "system",
          text: "❌ Error sending message. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();

    // Check if same day
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); 
      // e.g., "Jan 30"
    }
  };


  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-800 z-[59]"
          onClick={() => setIsExpanded(false)}
        ></motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-[60] ${
          isExpanded
            ? "inset-4 md:inset-auto md:bottom-4 md:right-4 md:left-auto md:top-auto w-auto md:w-[600px] h-auto md:h-[80vh] max-h-[800px]"
            : "bottom-2 right-4 w-[380px] h-[500px]"
        }`}
      >
        {/* HEADER */}
        <div className="bg-[#5EE6FE] text-white py-4 px-6 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-robot text-lg"></i>
            </div>
            <div>
              <h3 className="font-semibold text-base">Rapha</h3>
              <p className="text-xs text-white/80">Online • Always available</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose} 
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.from === "user" ? "ml-auto" : ""}`}>
                <div className={`px-4 py-3 rounded-2xl ${msg.from === "user" ? "bg-[#5EE6FE] text-white rounded-br-md shadow-md" : "bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm"}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} mt-1`}>
                  <span className="text-xs text-gray-500 px-2">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#5EE6FE] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#5EE6FE] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-[#5EE6FE] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
                <div className="flex justify-start mt-1">
                  <span className="text-xs text-gray-500 px-2">Rapha is typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask about pet care, appointments, or health questions..."
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-[#5EE6FE] transition-all duration-200"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-3 rounded-xl transition-all duration-200 ${input.trim() ? "bg-[#5EE6FE] text-white shadow-md hover:bg-[#3ecbe0] hover:shadow-lg hover:scale-105" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {["Pet care tips", "Schedule appointment", "Health questions", "Emergency help"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-[#5EE6FE] hover:text-white text-gray-600 rounded-lg transition-all duration-200 border border-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FloatingChatBox;
