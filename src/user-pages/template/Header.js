import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Header({ darkMode, setDarkMode, setIsMenuOpen }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: "laboratory",
        title: "Lab Results Available",
        message: "Dr. Ano name has uploaded lab records for Bogart's blood test",
        time: "5 min ago",
        read: false,
        icon: "fa-file-medical",
        color: "text-red-500"
      },
      {
        id: 2,
        type: "lost_pet",
        title: "Lost Pet Alert",
        message: "Mark Mapili posted a lost Golden Retriever near Central Park",
        time: "15 min ago",
        read: false,
        icon: "fa-paw",
        color: "text-amber-500"
      },
      {
        id: 3,
        type: "care_tip",
        title: "New Pet Care Tip",
        message: "Learn about seasonal allergies in dogs and how to manage them",
        time: "1 hour ago",
        read: true,
        icon: "fa-lightbulb",
        color: "text-emerald-500"
      },
      {
        id: 4,
        type: "video",
        title: "New Educational Video",
        message: "Watch our latest video on dental care for senior pets",
        time: "2 hours ago",
        read: true,
        icon: "fa-film",
        color: "text-blue-500"
      },
      {
        id: 5,
        type: "appointment",
        title: "Appointment Reminder",
        message: "Bogart's consultation is scheduled for tomorrow at 3:00 PM",
        time: "3 hours ago",
        read: true,
        icon: "fa-calendar-check",
        color: "text-purple-500"
      },
      {
        id: 6,
        type: "medical",
        title: "Medical History Update",
        message: "Dr. jhd updated Bogart's vaccination records",
        time: "5 hours ago",
        read: true,
        icon: "fa-file-medical",
        color: "text-cyan-500"
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationItemClick = (notification) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notification.id ? { ...notif, read: true } : notif
      )
    );

    switch (notification.type) {
      case "medical":
        navigate("/medical-records");
        break;
      case "lost_pet":
        navigate("/lost-pets");
        break;
      case "care_tip":
        navigate("/pet-tips");
        break;
      case "video":
        navigate("/videos");
        break;
      case "appointment":
        navigate("/appointments");
        break;
      case "forum":
        navigate("/forum");
        break;
      default:
        break;
    }
    
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="pt-5 pb-2 px-4 sm:px-6 md:px-10 flex flex-row justify-between items-center relative z-40 fixed top-0 left-0 right-0 bg-transparent">
      {/* Left side - Menu, Logo */}
      <div className="flex flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
        <motion.button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="text-2xl sm:text-3xl text-gray-700 focus:outline-none flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          ☰
        </motion.button>
        <img
          src="/images/logo.png"
          className="w-[30px] sm:w-[40px] md:w-[60px] lg:w-[80px] flex-shrink-0"
          alt="Logo"
        />
        <div className="flex flex-col flex-shrink-0">
          <div className="font-baloo text-lg sm:text-xl md:text-2xl leading-none">
            <span className="text-[#000000]">RV</span>
            <span className="text-[#5EE6FE]">Care</span>
          </div>
          {/*<span className="font-sansation text-xs sm:text-sm">Pet Clinic</span>*/}
        </div>
      </div>

      {/* RIGHT SIDE - NOTIF + FORUM + MODE TOGGLE */}
      <div className="flex flex-row justify-end items-center gap-3 sm:gap-5 md:gap-8 text-g y-700 flex-shrink-0">
        {/* Notification */}
        <div className="relative" ref={notificationRef}>
          <div
            onClick={handleNotificationClick}
            className="relative text-xl sm:text-2xl cursor-pointer text-gray-700"
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notification Dropdown*/}
          {showNotifications && (
            <div className="fixed right-2 sm:right-4 top-16 sm:top-20 w-[calc(100vw-1rem)] sm:w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
              {/* Header */}
              <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-[#5EE6FE] hover:text-[#3ecbe0] font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-64 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationItemClick(notification)}
                      className={`p-3 sm:p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? "bg-blue-50 border-l-4 border-l-blue-400" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                          notification.read ? "bg-gray-100" : "bg-blue-100"
                        }`}>
                          <i className={`fa-solid ${notification.icon} ${notification.color} text-sm sm:text-base md:text-lg`}></i>
                        </div>
                        
                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-semibold text-xs sm:text-sm ${
                              notification.read ? "text-gray-600" : "text-gray-900"
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] sm:text-xs text-gray-400 ml-2 flex-shrink-0">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5EE6FE] rounded-full flex-shrink-0 mt-1 sm:mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 sm:p-8 text-center">
                    <i className="fa-solid fa-bell-slash text-2xl sm:text-3xl md:text-4xl text-gray-300 mb-2 sm:mb-3"></i>
                    <p className="text-gray-500 text-xs sm:text-sm">No notifications yet</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs mt-1">We'll notify you when something new arrives</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Forum Button */}
        <div
          onClick={() => navigate("/forum")}
          className="flex items-center gap-1 sm:gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-paw text-lg sm:text-xl"></i>
          <span className="font-semibold text-sm sm:text-base hidden sm:inline">Lost Pets</span>
        </div>

        {/* Mode Toggle - Hide text only on small screens 
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Mode</span>
          <div
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-5 sm:w-12 sm:h-6 flex items-center rounded-full p-[2px] cursor-pointer ${
              darkMode ? "bg-[#5EE6FE]" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md ${
                darkMode ? "translate-x-5 sm:translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>*/}
      </div>
    </div>
  );
}

export default Header;