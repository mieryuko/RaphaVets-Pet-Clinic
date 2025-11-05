import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../template/Header";
import Sidebar from "../template/SideBar";
import PetInfo from "../components/home/PetInfo";
import AddPetModal from "../components/home/AddPetModal";
import FloatingChatBox from "../components/FloatingChatBox";
import Booking from "./Booking";

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Appointment");
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPet, setNewPet] = useState({ photo: null, name: "", breed: "", age: "", gender: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [chatType, setChatType] = useState(null);
  const [isExpandedChat, setIsExpandedChat] = useState(false);

  const navigate = useNavigate();

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleAddPet = () => {
    if (!newPet.name || !newPet.photo) return;
    setPets([...pets, newPet]);
    setNewPet({ photo: null, name: "", breed: "", age: "", gender: "" });
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPet({ ...newPet, photo: e.target.result });
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div
      className={`font-sansation min-h-screen relative ${
        darkMode ? "bg-[#1E1E1E] text-white" : "bg-[#FBFBFB]"
      } ${isChatOpen ? "overflow-hidden" : ""}`}
    >
      {/* HEADER */}
      <Header darkMode={darkMode} setDarkMode={setDarkMode} setIsMenuOpen={setIsMenuOpen} />

      {/* MAIN LAYOUT */}
      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp">
        {/* SIDEBAR */}
        <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          pets={pets}
          setShowModal={setShowModal}
        />

        {/* MAIN CONTENT */}
        <div
          className={`transition-all duration-500 ease-in-out flex flex-col gap-7 rounded-xl p-5 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"
          }`}
        >
          {/* PET INFO SECTION */}
          <PetInfo
            pets={pets}
            setShowModal={setShowModal}
            currentPetIndex={currentPetIndex}
            setCurrentPetIndex={setCurrentPetIndex}
          />

          {/* Appointment Section */}
          <div className="px-6 py-4 text-[12px] rounded-2xl bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] flex flex-col h-[300px]">
            <div className="font-[700] flex flex-row gap-5">
              {["Appointment", "Medical Reports", "Reminders", "Lab Records"].map((tab) => (
                <span
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeTab === tab
                      ? "text-[#5EE6FE] border-b-2 border-[#5EE6FE]"
                      : "hover:text-[#5EE6FE] text-gray-700"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="mt-2 text-[13px] flex flex-row justify-end items-center pr-5">
                <button 
                  onClick={() => navigate("/booking")}
                  className="bg-[#d9d9d9] py-1 px-3 rounded-lg flex flex-row items-center gap-2 hover:bg-[#5EE6FE] hover:text-white transition-all duration-300 active:scale-95">
                  <i className="fa-solid fa-calendar-days"></i>
                  <span>Book</span>
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center h-full">
                <span className="text-gray-500 text-sm font-medium">
                  No incoming appointments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 sm:bottom-12 sm:right-20 bg-[#5EE6FE] text-white text-2xl w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-[#3ecbe0] transition-all duration-300 z-50"
      >
        <i className="fa-regular fa-comment"></i>
      </button>

      {/* Chat Menu */}
      {isChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-fadeIn"
            onClick={() => setIsChatOpen(false)}
          ></div>
          <div className="fixed bottom-32 right-8 sm:right-20 bg-white rounded-2xl shadow-xl p-4 z-50 w-52 flex flex-col gap-3 animate-popUp">
            <button
              className="bg-[#5EE6FE] text-white font-semibold py-2 rounded-lg hover:bg-[#3ecbe0] transition-all"
              onClick={() => {
                setIsExpandedChat(true);
                setChatType("ai");
                setIsChatOpen(false);
              }}
            >
              Chat with AI
            </button>
            <button
              className="bg-[#EEF4F5] text-gray-700 font-semibold py-2 rounded-lg hover:bg-[#d9d9d9] transition-all"
              onClick={() => {
                setIsExpandedChat(true);
                setChatType("pro");
                setIsChatOpen(false);
              }}
            >
              Chat with Professional
            </button>
          </div>

        </>
      )}

      {/* Floating Chat Box */}
      {chatType && (
        <FloatingChatBox
          type={chatType}
          onClose={() => setChatType(null)}
        />
      )}


      {/* ADD PET MODAL 
      {showModal && (
        <AddPetModal
          newPet={newPet}
          setNewPet={setNewPet}
          handleAddPet={handleAddPet}
          showPhotoOptions={showPhotoOptions}
          setShowPhotoOptions={setShowPhotoOptions}
          handlePhotoChange={handlePhotoChange}
          setShowModal={setShowModal}
        />
      )}*/}

      {/* SUCCESS MESSAGE */}
      {showSuccess && (
        <div className="fixed top-[80px] right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 w-[300px] overflow-hidden">
          <span className="font-semibold">Pet added successfully!</span>
          <div className="mt-2 h-1 w-full bg-green-400 relative overflow-hidden rounded">
            <div className="absolute top-0 left-0 h-full bg-white animate-progress"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
