import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Header from "../template/Header";
import SideBar from "../template/SideBar";

// sections
import AccountInformation from "../components/profile/AccountInformation";
import NotificationSettings from "../components/profile/NotificationSettings";
import SecurityPrivacy from "../components/profile/SecurityPrivacy";
import ConnectedDevices from "../components/profile/ConnectedDevices";
import DeleteAccount from "../components/profile/DeleteAccount";
import ActivityLog from "../components/profile/ActivityLog";

function Profile() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
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

        const res = await api.get(`/users/${userId}`);
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

  return (
    <div className="font-sansation min-h-screen bg-[#FBFBFB] relative">
      {/* HEADER */}
      <Header setIsMenuOpen={setIsMenuOpen} />

      {/* MAIN LAYOUT */}
      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp">
        {/* SIDEBAR */}
        <SideBar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          pets={pets}
          setShowModal={setShowModal}
        />

        {/* PAGE CONTENT */}
        <div
          className={`transition-all duration-500 ease-in-out flex flex-col gap-7 rounded-xl p-5 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"
          }`}
        >
          <div className="p-6 bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.15)]">
            {/* MOBILE */}
            {isMobile && showContent ? (
              <div>
                <button
                  onClick={() => setShowContent(false)}
                  className="text-[#5EE6FE] font-semibold mb-4 flex items-center gap-2"
                >
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <div>{sections[activeSection]}</div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                {/* LEFT OPTIONS PANEL */}
                <div className="w-full md:w-1/4 border-r border-gray-200 pr-4 flex flex-col gap-2">
                  {Object.keys(sections).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveSection(key);
                        if (isMobile) setShowContent(true); 
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeSection === key
                          ? key === "Delete Account"
                            ? "bg-[#d93025] text-white"
                            : "bg-[#5EE6FE] text-white"
                          : key === "Delete Account"
                          ? "text-[#d93025] hover:bg-red-50"
                          : "hover:bg-[#EAFBFD] text-gray-700"
                      }`}
                    >
                      <span>{key}</span>
                      <i className="fa-solid fa-chevron-right md:hidden text-sm opacity-70"></i>
                    </button>
                  ))}
                </div>

                {/* RIGHT CONTENT PANEL */}
                <div className="flex-1 pl-0 md:pl-6 hidden md:block">
                  {sections[activeSection]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
