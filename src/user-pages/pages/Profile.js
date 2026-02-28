import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import ClientLayout from "../ClientLayout";

// sections
import AccountInformation from "../components/profile/AccountInformation";
import NotificationSettings from "../components/profile/NotificationSettings";
import SecurityPrivacy from "../components/profile/SecurityPrivacy";
// import ConnectedDevices from "../components/profile/ConnectedDevices"; // removed per request
//import DeleteAccount from "../components/profile/DeleteAccount";
import ActivityLog from "../components/profile/ActivityLog";

function Profile() {
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("Account Information");
  const [showContent, setShowContent] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) return;

        const res = await api.get(`/users/${userId}/profile`);
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const sections = {
    "Account Information": <AccountInformation userData={userData} setUserData={setUserData} />,
    "Notification Settings": <NotificationSettings />,
    "Security & Privacy": <SecurityPrivacy />,
    // "Connected Devices": <ConnectedDevices />,
    "Activity Log": <ActivityLog />,
    //"Delete Account": <DeleteAccount />,
  };

  // Handle back button
  const handleBack = () => {
    setShowContent(false);
  };

  // Handle section click
  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setShowContent(true);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const mobileContentVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.15)] min-h-[calc(100vh-120px)]"
      >
        {/* MOBILE VIEW */}
        {isMobile ? (
          showContent ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                variants={mobileContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                <motion.button
                  onClick={handleBack}
                  className="text-[#5EE6FE] font-semibold mb-4 flex items-center gap-2 hover:bg-[#EAFBFD] px-3 py-2 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fa-solid fa-arrow-left"></i> Back to Menu
                </motion.button>
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="pb-4"
                >
                  {sections[activeSection]}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col gap-4 h-full">
              {/* mobile menu only - no extra blank area */}
              <div className="w-full flex flex-col gap-2">
                {Object.keys(sections).map((key, index) => (
                  <motion.button
                    key={key}
                    variants={buttonVariants}
                    onClick={() => handleSectionClick(key)}
                    className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
                      activeSection === key
                        ? key === "Delete Account"
                          ? "bg-[#d93025] text-white"
                          : "bg-[#5EE6FE] text-white"
                        : key === "Delete Account"
                        ? "text-[#d93025] hover:bg-red-50"
                        : "hover:bg-[#EAFBFD] text-gray-700"
                    }`}
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: index * 0.05 }}
                  >
                    <span>{key}</span>
                    <i className="fa-solid fa-chevron-right text-sm opacity-70"></i>
                  </motion.button>
                ))}
              </div>
            </div>
          )
        ) : (
          /* DESKTOP VIEW & MOBILE MENU */
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-4 md:gap-6 h-full"
          >
            {/* LEFT OPTIONS PANEL */}
            <div 
              className={`w-full md:w-1/4 ${!isMobile ? 'border-r border-gray-200 pr-4' : ''} flex flex-col gap-2`}
            >
              <h2 className="text-lg font-semibold text-[#5EE6FE] mb-2 md:hidden">Profile Menu</h2>
              {Object.keys(sections).map((key, index) => (
                <motion.button
                  key={key}
                  variants={buttonVariants}
                  onClick={() => handleSectionClick(key)}
                  className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
                    activeSection === key && (!isMobile || !showContent)
                      ? key === "Delete Account"
                        ? "bg-[#d93025] text-white"
                        : "bg-[#5EE6FE] text-white"
                      : key === "Delete Account"
                      ? "text-[#d93025] hover:bg-red-50"
                      : "hover:bg-[#EAFBFD] text-gray-700"
                  }`}
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ delay: index * 0.05 }}
                >
                  <span>{key}</span>
                  {isMobile && (
                    <i className="fa-solid fa-chevron-right text-sm opacity-70"></i>
                  )}
                </motion.button>
              ))}
            </div>

            {/* RIGHT CONTENT PANEL - Desktop only */}
            {!isMobile && (
              <motion.div 
                className="flex-1 pl-0 md:pl-6 overflow-y-auto"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="pb-4"
                  >
                    {sections[activeSection]}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </ClientLayout>
  );
}

export default Profile;