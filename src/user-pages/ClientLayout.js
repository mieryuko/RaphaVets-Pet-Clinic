import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./template/Header";
import Sidebar from "./template/SideBar";
import FloatingChatBox from "./components/FloatingChatBox";

function ClientLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [sidebarAnimate, setSidebarAnimate] = useState(true); // controls sidebar + content transition
  const [shouldAnimateIcon, setShouldAnimateIcon] = useState(false); // header hamburger animation flag
  const [darkMode, setDarkMode] = useState(false);
  const [chatType, setChatType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    if (window.innerWidth >= 768) {
      setIsMenuOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (window.innerWidth >= 768 && !isMenuOpen) {
        setIsMenuOpen(true);
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

  // called from Header when hamburger is clicked
  const handleToggleMenu = () => {
    setShouldAnimateIcon(true); // allow icon to rotate

    // give the icon a moment to start its rotation before updating layout
    const nextState = !isMenuOpen;
    setTimeout(() => {
      setSidebarAnimate(true);    // enable animation for sidebar & content
      setIsMenuOpen(nextState);
    }, 100); // 100ms delay keeps motion feeling sequential
  };

  // used when a sidebar link is clicked (or other programmatic closes)
  // animations are suppressed so that the menu disappears immediately
  const closeMenuImmediate = () => {
    setSidebarAnimate(false);
    setShouldAnimateIcon(false); // icon should not animate when closing this way
    setIsMenuOpen(false);
    // re-enable animation state for future toggles
    setTimeout(() => setSidebarAnimate(true), 0);
  };

  return (
    <div className={`font-sansation min-h-screen relative bg-[#FBFBFB] text-gray-800 dark:bg-[#0B0F15] dark:text-gray-100`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        toggleMenu={handleToggleMenu}
        isMenuOpen={isMenuOpen}
        animateIcon={shouldAnimateIcon}
      />
      
      {/* Main content with sidebar */}
      <div className="flex flex-col md:flex-row gap-0 px-0 md:px-5 lg:px-12">
        {/* Sidebar */}
        <Sidebar
          isMenuOpen={isMenuOpen}
          closeMenuImmediate={closeMenuImmediate}
          animationEnabled={sidebarAnimate}
        />
        
        {/* Main content area */}
        <div className={`
          flex flex-col gap-5 rounded-none md:rounded-xl p-4 sm:p-5 w-full
          ${sidebarAnimate ? 'transition-all duration-300' : ''}
          ${isMenuOpen ? 'md:w-[calc(100%-250px)]' : 'md:w-full'}
          ${isMenuOpen ? 'opacity-50 md:opacity-100 pointer-events-none md:pointer-events-auto' : ''}
        `}>
          {children}
        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setChatType("ai")} 
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 md:bottom-12 md:right-20 bg-[#5EE6FE] text-white text-xl sm:text-2xl w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        <i className="fa-regular fa-comment"></i>
      </button>

      {chatType && <FloatingChatBox type={chatType} onClose={() => setChatType(null)} />}
      
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