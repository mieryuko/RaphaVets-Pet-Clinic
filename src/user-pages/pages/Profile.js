import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import ClientLayout from "../ClientLayout";

// sections
import AccountInformation from "../components/profile/AccountInformation";
import NotificationSettings from "../components/profile/NotificationSettings";
import SecurityPrivacy from "../components/profile/SecurityPrivacy";
import ConnectedDevices from "../components/profile/ConnectedDevices";
import DeleteAccount from "../components/profile/DeleteAccount";
import ActivityLog from "../components/profile/ActivityLog";

function Profile() {
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("Account Information");
  const [showContent, setShowContent] = useState(false); 
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) return;

        const res = await api.get(`/users/${userId}/profile`);
        setUserData(res.data);
      } catch (error) {
        // handle error (optional): setUserData(null) or show UI feedback
      }
    };

    fetchUserProfile();
  }, []);

  const sections = {
    "Account Information": <AccountInformation userData={userData} setUserData={setUserData} />,
    "Notification Settings": <NotificationSettings />,
    "Security & Privacy": <SecurityPrivacy />,
    "Activity Log": <ActivityLog />,
    "Delete Account": <DeleteAccount />,
  };

  const isMobile = window.innerWidth < 768;

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
        className="p-6 bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.15)]"
      >
        {/* MOBILE */}
        {isMobile && showContent ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={mobileContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                onClick={() => setShowContent(false)}
                className="text-[#5EE6FE] font-semibold mb-4 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fa-solid fa-arrow-left"></i> Back
              </motion.button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {sections[activeSection]}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-6"
          >
            {/* LEFT OPTIONS PANEL */}
            <motion.div 
              variants={containerVariants}
              className="w-full md:w-1/4 border-r border-gray-200 pr-4 flex flex-col gap-2"
            >
              {Object.keys(sections).map((key, index) => (
                <motion.button
                  key={key}
                  variants={buttonVariants}
                  onClick={() => {
                    setActiveSection(key);
                    if (isMobile) setShowContent(true); 
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium ${
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
                  transition={{ delay: index * 0.1 }}
                >
                  <span>{key}</span>
                  <i className="fa-solid fa-chevron-right md:hidden text-sm opacity-70"></i>
                </motion.button>
              ))}
            </motion.div>

            {/* RIGHT CONTENT PANEL */}
            <motion.div 
              className="flex-1 pl-0 md:pl-6 hidden md:block"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {sections[activeSection]}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </ClientLayout>
  );
}

export default Profile;