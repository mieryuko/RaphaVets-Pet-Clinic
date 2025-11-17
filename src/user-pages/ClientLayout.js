import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./template/Header";
import Sidebar from "./template/SideBar";
import FloatingChatBox from "./components/FloatingChatBox";

function ClientLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [chatType, setChatType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className={`font-sansation min-h-screen relative ${darkMode ? "bg-[#1E1E1E] text-white" : "bg-[#FBFBFB]"}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} setIsMenuOpen={setIsMenuOpen} />
      
      <div className="flex flex-row gap-5 px-5 sm:px-12">
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        
        <div className={`flex flex-col gap-5 rounded-xl p-5 w-full ${!isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"}`}>
          {children}
        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setChatType("ai")} 
        className="fixed bottom-8 right-8 sm:bottom-12 sm:right-20 bg-[#5EE6FE] text-white text-2xl w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <i className="fa-regular fa-comment"></i>
      </button>

      {chatType && <FloatingChatBox type={chatType} onClose={() => setChatType(null)} />}
    </div>
  );
}

export default ClientLayout;