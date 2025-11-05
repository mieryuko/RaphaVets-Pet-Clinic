import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../template/Header";
import SideBar from "../template/SideBar";
import DietFeedingSection from "../components/pet-details/DietFeedingSection";
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

  const [appointmentFilter, setAppointmentFilter] = useState("Upcoming");

  const [appointments, setAppointments] = useState([
    { id: 1, petName: pet.name, type: "Grooming Session", date: "July 19 - 10:00 AM", status: "Upcoming" },
    { id: 2, petName: pet.name, type: "Vet Checkup", date: "August 1 - 2:00 PM", status: "Pending" },
    { id: 3, petName: pet.name, type: "Vaccination", date: "September 10 - 11:00 AM", status: "Done" },
  ]);

  const filteredAppointments = appointments.filter(appt => 
    appointmentFilter === "All" ? true : appt.status === appointmentFilter
  );

  const handleViewDetails = (appt) => {
    alert(`Viewing details for ${appt.type} on ${appt.date}`);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Appointments");
  const [showEditModal, setShowEditModal] = useState(false);

  const tabs = ["Appointments", "Medical History", "Diet & Feeding", "Behavior Notes"];

  return (
    <div className="font-sansation min-h-screen bg-gradient-to-b from-[#FDFBFB] to-[#EBEDEE] relative">
      <Header setIsMenuOpen={setIsMenuOpen} />

      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp">
        <SideBar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          pets={[pet]}
          setShowModal={() => {}}
        />

        {/* PAGE CONTENT */}
        <div
          className={`transition-all duration-500 ease-in-out flex flex-col gap-6 rounded-xl p-5 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"
          }`}
        >
          {/* 🐶 PET HEADER SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between px-6 py-5"
          >
            {/* Left side: Photo and Details */}
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#00B8D4] bg-gray-200 flex items-center justify-center">
                  <img
                    src={pet?.photo || "/images/dog-profile.png"}
                    alt={pet?.name || "Pet Name"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Pet Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {pet?.name || "Pet Name"}
                  {/* Edit Icon */}
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-gray-400 hover:text-[#00B8D4] transition-all"
                  >
                    <i className="fa-solid fa-pen text-base"></i>
                  </button>
                </h2>
                <p className="text-gray-500 text-sm">
                  {pet?.breed || "Chow Chow"} • {pet?.gender || "Male"} • {pet?.age || "2 years old"}
                </p>
              </div>
            </div>

            {/* Right side: Status Cards */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm mt-4 sm:mt-0">

              <div className="px-4 py-2 bg-[#FFF7E6] rounded-xl shadow-sm text-gray-700">
                <i className="fa-solid fa-calendar-check text-[#00B8D4] mr-2"></i>
                Last Check: {pet?.lastCheck || "N/A"}
              </div>
            </div>
          </motion.div>


          {/* 🩵 MODERNIZED TABS */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100">
            <div className="flex flex-wrap gap-6 px-6 py-4 border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-2 transition-all font-semibold ${
                    activeTab === tab
                      ? "text-[#00B8D4] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#00B8D4]"
                      : "text-gray-500 hover:text-[#00B8D4]"
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
              className="p-6 min-h-[350px]"
            >
              {activeTab === "Appointments" && (
              <div className="px-6  rounded-2xl bg-white shadow-lg flex flex-col h-[350px]">
                {/* Appointment Status Filters */}
                <div className="flex gap-3 mb-3">
                  {["Upcoming", "Pending", "Done", "All"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setAppointmentFilter(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition 
                        ${
                          appointmentFilter === status
                            ? "bg-[#00B8D4] text-white shadow"
                            : "bg-gray-100 text-gray-600 hover:bg-[#d3f2fa]"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                  {filteredAppointments.map((appt) => {
                    const datePart = appt.date.split(" - ")[0];
                    const parsedDate = new Date(datePart + " 2025");
                    const isValidDate = !isNaN(parsedDate);

                    return (
                      <div
                        key={appt.id}
                        className="bg-white/70 backdrop-blur-md border border-[#00B8D4]/30 p-4 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all cursor-pointer"
                      >
                        {/* LEFT: Date */}
                        <div className="flex flex-col items-center justify-center w-16 text-center bg-[#EFFFFF] rounded-lg py-2 border border-[#00B8D4]/20 shadow-sm">
                          {isValidDate ? (
                            <>
                              <span className="text-xs font-semibold text-[#00B8D4] uppercase tracking-wide">
                                {parsedDate.toLocaleString("default", { month: "short" })}
                              </span>
                              <span className="text-xl font-bold text-gray-800 leading-tight">
                                {parsedDate.getDate()}
                              </span>
                              <span className="text-[10px] text-gray-500 capitalize">
                                {parsedDate.toLocaleString("default", { weekday: "long" })}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">Invalid Date</span>
                          )}
                        </div>

                        {/* RIGHT: Appointment Details */}
                        <div className="flex justify-between items-center flex-1 ml-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {appt.petName || pet.name} — {appt.type || "Grooming Session"}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <i className="fa-solid fa-clock text-[#00B8D4]"></i>
                              {appt.date.split(" - ")[1] || "10:00 AM"} • {appt.status || "Upcoming"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewDetails(appt)}
                            className="bg-[#00B8D4] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#029ab5] transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


              {activeTab === "Medical History" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-[#FFF8F9] p-5 shadow-sm border border-[#F3D6D8] flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Vaccination Record
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          April 5, 2025
                        </p>
                      </div>
                      <button className="mt-4 bg-[#FFB6C1] text-white px-3 py-2 rounded-lg hover:bg-[#FF9FB0] transition-all">
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Diet & Feeding" && (
                <DietFeedingSection />
              )}

              {activeTab === "Behavior Notes" && (
                <BehaviorNotesSection />
              )}
            </motion.div>
          </div>

          {/* ✏️ Edit Pet Modal */}
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
                <input type="text" defaultValue={pet.name} placeholder="Pet Name" className="w-full border border-gray-300 rounded-lg p-2 mb-3" />
                <input type="text" defaultValue={pet.breed} placeholder="Breed" className="w-full border border-gray-300 rounded-lg p-2 mb-3" />
                <input type="text" defaultValue={pet.age} placeholder="Age" className="w-full border border-gray-300 rounded-lg p-2 mb-3" />
                <input type="text" defaultValue={pet.gender} placeholder="Gender" className="w-full border border-gray-300 rounded-lg p-2 mb-3" />
                <button className="bg-[#00B8D4] text-white py-2 px-4 rounded-lg hover:bg-[#029ab5] transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PetDetails;
