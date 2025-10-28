import React, { useState, useEffect, useRef } from "react";

function ExpandedChat({ type, onClose }) {
  const [messages, setMessages] = useState([
    { from: "system", text: `👋 Welcome to ${type === "ai" ? "AI Assistant" : "Professional Support"} Chat!` },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim() && !image) return;
    setMessages([...messages, { from: "user", text: input, image }]);
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
    <div className="w-full h-[calc(100vh-80px)] bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] flex flex-col animate-fadeSlideUp">
      {/* HEADER */}
      <div className="bg-[#5EE6FE] text-white py-4 px-6 flex justify-between items-center rounded-t-2xl">
        <h2 className="text-lg font-semibold">
          {type === "ai" ? "AI Assistant" : "Professional Support"}
        </h2>
        <button
          onClick={onClose}
          className="bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFB] space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] ${
                msg.from === "user"
                  ? "bg-[#5EE6FE] text-white rounded-br-none"
                  : "bg-white border border-gray-200 rounded-bl-none text-gray-700"
              }`}
            >
              {msg.image && <img src={msg.image} alt="uploaded" className="rounded-lg mb-2 max-w-[200px]" />}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* INPUT */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
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
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#5EE6FE]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-[#5EE6FE] text-white p-2 rounded-lg hover:bg-[#3ecbe0]"
        >
          <i className="fa-solid fa-paper-plane text-sm"></i>
        </button>
      </div>
    </div>
  );
}

export default ExpandedChat;
