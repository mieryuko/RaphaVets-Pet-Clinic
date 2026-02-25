import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./template/Header";
import Sidebar from "./template/SideBar";
import FloatingChatBox from "./components/FloatingChatBox";

function ClientLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Changed to false by default on mobile
  const [darkMode, setDarkMode] = useState(false);
  const [chatType, setChatType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    // Handle window resize to auto-close sidebar on mobile
    const handleResize = () => {
      if (window.innerWidth < 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className={`font-sansation min-h-screen relative bg-[#FBFBFB] text-gray-800 dark:bg-[#0B0F15] dark:text-gray-100`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} setIsMenuOpen={setIsMenuOpen} />
      
      {/* Main content with sidebar */}
      <div className="flex flex-col md:flex-row gap-0 px-0 md:px-5 lg:px-12">
        {/* Sidebar - hidden on mobile by default, shown when menu is open */}
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        
        {/* Main content area - full width on mobile, adjusts when sidebar is open on desktop */}
        <div className={`
          flex flex-col gap-5 rounded-none md:rounded-xl p-4 sm:p-5 w-full transition-all duration-300
          ${isMenuOpen ? 'md:w-[calc(100%-250px)]' : 'md:w-full'}
          ${isMenuOpen ? 'opacity-50 md:opacity-100 pointer-events-none md:pointer-events-auto' : ''}
        `}>
          {children}
        </div>
      </div>

      {/* Floating Chat Button - adjusted for mobile */}
      <button 
        onClick={() => setChatType("ai")} 
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 md:bottom-12 md:right-20 bg-[#5EE6FE] text-white text-xl sm:text-2xl w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        <i className="fa-regular fa-comment"></i>
      </button>

      {chatType && <FloatingChatBox type={chatType} onClose={() => setChatType(null)} />}
      
      {/* Mobile overlay to close sidebar when clicking outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default ClientLayout;