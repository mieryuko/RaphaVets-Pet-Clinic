import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function FloatingChatBox({ type, onClose }) {
  const [messages, setMessages] = useState([
    { from: "system", text: `👋 Hi! This is the ${type === "ai" ? "AI Assistant" : "Professional Support"}. How can I help you today?` },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim() && !image) return;
    const newMessage = { from: "user", text: input, image };
    setMessages([...messages, newMessage]);
    setInput("");
    setImage(null);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {/* When Expanded, dark overlay behind chat */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[59]"
        ></motion.div>
      )}

      {/* CHAT WINDOW */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        className={`fixed ${
          isExpanded
            ? "inset-0 m-auto w-[90%] md:w-[800px] h-[90%] z-[60]"
            : "bottom-0 right-4 w-[320px] h-[420px] z-[60]"
        } bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#E8F7FA]`}
      >
        {/* HEADER */}
        <div className="bg-[#5EE6FE] text-white py-3 px-4 flex justify-between items-center">
          <h3 className="font-semibold text-base">
            {type === "ai" ? "Chat with AI Assistant" : "Chat with Professional"}
          </h3>
          <div className="flex items-center gap-2">
            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:text-gray-200 transition"
              title={isExpanded ? "Collapse chat" : "Expand chat"}
            >
              <i
                className={`fa-solid ${
                  isExpanded
                    ? "fa-down-left-and-up-right-to-center"
                    : "fa-up-right-and-down-left-from-center"
                } text-lg`}
              ></i>
            </button>

            {/* Close */}
            <button onClick={onClose} className="hover:text-gray-200 transition">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* CHAT MESSAGES */}
        <div
          className={`flex-1 overflow-y-auto px-4 py-3 ${
            isExpanded ? "bg-[#F2FDFE]" : "bg-[#F9FBFB]"
          } space-y-3`}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm break-words ${
                  msg.from === "user"
                    ? "bg-[#5EE6FE] text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="uploaded"
                    className="rounded-lg mb-2 max-w-[200px]"
                  />
                )}
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT AREA */}
        <div className="border-t border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
          {/* Upload Button (only for Professional chat) */}
          {type === "pro" && (
            <>
              <label className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg bg-[#EEF4F5] hover:bg-[#5EE6FE] hover:text-white transition-all">
                <i className="fa-solid fa-plus text-base"></i>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              {image && (
                <img
                  src={image}
                  alt="preview"
                  className="w-8 h-8 rounded-md object-cover border border-gray-300"
                />
              )}
            </>
          )}

          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5EE6FE]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-[#5EE6FE] text-white p-2 rounded-lg hover:bg-[#3ecbe0] transition-all"
          >
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FloatingChatBox;
