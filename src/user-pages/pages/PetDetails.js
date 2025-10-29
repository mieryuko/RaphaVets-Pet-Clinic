import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../template/Header";
import SideBar from "../template/SideBar";
import DietFeedingSection from "../components/pet-details/DietFeedingSection";
import HealthTrackerSection from "../components/pet-details/HealthTracker";
import BehaviorNotesSection from "../components/pet-details/BehaviorNote";

function PetDetails() {
  const { state } = useLocation();
  const pet = state?.pet || {
    name: "Unknown Pet",
    breed: "Unknown Breed",
    age: "N/A",
    gender: "N/A",
    photo: "https://via.placeholder.com/150",
    lastCheck: "N/A",
    health: "N/A",
  };

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Appointments");
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);


  const tabs = ["Appointments", "Medical Records", "Diet & Feeding", "Health Tracker", "Behavior Notes"];

  return (
    <div className="font-sansation min-h-screen bg-[#FBFBFB] relative">
      {/* HEADER */}
      <Header setIsMenuOpen={setIsMenuOpen}/>

      {/* MAIN LAYOUT */}
      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp">
        {/* SIDEBAR */}
        <SideBar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          pets={[pet]}
          setShowModal={() => {}}
        />

        {/* PAGE CONTENT */}
        <div
          className={`transition-all duration-500 ease-in-out flex flex-col gap-7 rounded-xl p-5 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"
          }`}
        >
          {/* PET HEADER SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl shadow-[0_0_15px_rgba(0,0,0,0.15)] backdrop-blur-md bg-white/30 border border-white/40"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5 p-6">
              <div className="flex items-center gap-5">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#5EE6FE]">
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{pet.name}</h2>
                  <p className="text-gray-500 text-sm">
                    {pet.breed} • {pet.gender} • {pet.age}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm">
                <div className="px-4 py-2 bg-white/60 border border-white/50 rounded-xl shadow-sm text-gray-700">
                  <i className="fa-solid fa-heartbeat text-[#5EE6FE] mr-2"></i>
                  {pet.health || "Healthy"}
                </div>
                <div className="px-4 py-2 bg-white/60 border border-white/50 rounded-xl shadow-sm text-gray-700">
                  <i className="fa-solid fa-calendar-check text-[#5EE6FE] mr-2"></i>
                  Last Check: {pet.lastCheck || "N/A"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* TABS */}
          <div className="bg-white rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.1)]">
            <div className="flex flex-wrap gap-6 px-6 py-3 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-2 transition-all font-semibold ${
                    activeTab === tab
                      ? "text-[#5EE6FE] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#5EE6FE]"
                      : "text-gray-500 hover:text-[#5EE6FE]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>


            {/* TAB CONTENT */}
<motion.div
  key={activeTab}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="p-6 min-h-[350px] relative"
>
  {/* APPOINTMENTS */}
  {activeTab === "Appointments" && (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-2xl bg-[#EAFBFD] shadow-sm flex justify-between items-center">
        <span className="text-gray-700 font-medium">No upcoming appointments.</span>
        <button className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg hover:bg-[#3ecbe0] transition-all">
          Book Appointment
        </button>
      </div>
    </div>
  )}

  {/* DIET & FEEDING */}
  {activeTab === "Diet & Feeding" && (
    <DietFeedingSection />
  )}

  {/* HEALTH TRACKER */}
  {activeTab === "Health Tracker" && (
    <HealthTrackerSection />
  )}

  {/* BEHAVIOR NOTES */}
  {activeTab === "Behavior Notes" && (
    <BehaviorNotesSection />
  )}
</motion.div>


          </div>

          {/* FLOATING ACTION BUTTONS */}
          <div className="fixed bottom-14 right-14 flex flex-col items-end gap-3 z-50">
            {/* Add Menu Buttons */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-end gap-3"
              >
                <button
                  onClick={() => setShowHealthModal(true)}
                  className="relative bg-white text-[#5EE6FE] border border-[#5EE6FE] p-4 rounded-full shadow-lg hover:bg-[#5EE6FE] hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <i className="fa-solid fa-stethoscope"></i>
                  <span className="absolute right-full mr-3 bg-[#5EE6FE] text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                    Health Check
                  </span>
                </button>

                <button
                  onClick={() => setShowEditModal(true)}
                  className="relative bg-white text-[#5EE6FE] border border-[#5EE6FE] p-4 rounded-full shadow-lg hover:bg-[#5EE6FE] hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
              </motion.div>
            )}

            {/* Main + Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`bg-[#5EE6FE] text-white p-5 rounded-full shadow-xl hover:bg-[#3ecbe0] transition-all duration-300 transform ${
                showMenu ? "rotate-45" : "rotate-0"
              }`}
            >
              <i className="fa-solid fa-plus text-lg"></i>
            </button>
          </div>

          {/* Edit Pet Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Pet Information</h3>
                <input type="text" defaultValue={pet.name} className="w-full border border-gray-300 rounded-lg p-2 mb-3" />
                <input type="text" defaultValue={pet.breed} className="w-full border border-gray-300 rounded-lg p-2 mb-3" />
                <button className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0] transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Health Overview Modal */}
          {showHealthModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative">
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Health Summary</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Weight: 6.5 kg</li>
                  <li>• Last Vet Check: {pet.lastCheck || "2 months ago"}</li>
                  <li>• Vaccination: Up to Date</li>
                  <li>• Notes: No known allergies</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default PetDetails;
