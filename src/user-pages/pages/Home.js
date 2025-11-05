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
  const [chatType, setChatType] = useState(null);
  const [isExpandedChat, setIsExpandedChat] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState("Upcoming");

  const [selectedAppointment, setSelectedAppointment] = useState(null); // <-- for modal
  const [showDetailsModal, setShowDetailsModal] = useState(false); // <-- toggle modal

  const appointments = [
    {
      id: 1,
      petName: "Miguel",
      ownerName: "Fionah Beltran",
      type: "General Checkup",
      date: "Nov 10, 2025 - 10:00 AM",
      status: "Upcoming",
      notes: "Bring previous medical records.",
    },
    {
      id: 2,
      petName: "Mark",
      ownerName: "John Cruz",
      type: "Vaccination",
      date: "Nov 12, 2025 - 1:30 PM",
      status: "Upcoming",
      notes: "Rabies and deworming included.",
    },
    {
      id: 3,
      petName: "Jordan",
      ownerName: "Mary Santos",
      type: "Grooming",
      date: "Oct 25, 2025 - 9:00 AM",
      status: "Done",
      notes: "Full grooming session completed.",
    },
  ];

  const filteredAppointments = appointments.filter(
    (a) => appointmentFilter === "All" || a.status === appointmentFilter
  );

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

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

  // Handle View Details button
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div
      className={`font-sansation min-h-screen relative ${
        darkMode ? "bg-[#1E1E1E] text-white" : "bg-[#FBFBFB]"
      } ${isChatOpen ? "overflow-hidden" : ""}`}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} setIsMenuOpen={setIsMenuOpen} />

      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp">
        <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          pets={pets}
          setShowModal={setShowModal}
        />

        <div
          className={`transition-all duration-500 ease-in-out flex flex-col gap- rounded-xl p-5 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"
          }`}
        >
          {/* TOP HOME DASHBOARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <div className="bg-[#FCE7F3] text-[#045D56] p-5 rounded-xl shadow-lg flex flex-col justify-between cursor-pointer hover:scale-105 transition-all">
              <div>
                <h3 className="font-bold text-lg mb-2">Daily Walks</h3>
                <p className="text-sm">
                  Take your dog for at least 30 minutes of walking to keep them healthy.
                </p>
              </div>
              <div className="mt-3 flex justify-end text-2xl">
                <i className="fa-solid fa-dumbbell"></i>
              </div>
            </div>

            <div className="bg-[#E3FAF7] text-[#7C2E38] p-5 rounded-xl shadow-lg flex flex-col justify-between cursor-pointer hover:scale-105 transition-all">
              <div>
                <h3 className="font-bold text-lg mb-2">Hydration Reminder</h3>
                <p className="text-sm">Ensure your pet has access to fresh water at all times.</p>
              </div>
              <div className="mt-3 flex justify-end text-2xl">
                <i className="fa-solid fa-droplet"></i>
              </div>
            </div>

            <div
              onClick={() => navigate("/booking")}
              className="bg-[#FFF4E5] text-[#5E2A4F] p-5 rounded-xl shadow-lg flex flex-col justify-between cursor-pointer hover:scale-105 transition-all"
            >
              <div>
                <h3 className="font-bold text-lg mb-2">Book Appointment</h3>
                <p className="text-sm">Schedule a visit with your vet in just a few clicks.</p>
              </div>
              <div className="mt-3 flex justify-end text-2xl">
                <i className="fa-solid fa-calendar-days"></i>
              </div>
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="px-6 py-4 rounded-2xl bg-white shadow-lg flex flex-col h-[350px]">
            <div className="font-semibold flex gap-6 border-b pb-3 mb-4">
              {["Appointment", "Medical Reports", "Lab Records"].map((tab) => (
                <span
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer transition-colors duration-300 ${
                    activeTab === tab
                      ? "text-[#5EE6FE] border-b-2 border-[#5EE6FE] pb-1"
                      : "text-gray-400 hover:text-[#5EE6FE]"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {/* --- APPOINTMENTS TAB --- */}
              {activeTab === "Appointment" && (
                <div className="flex flex-col flex-1 gap-3">
                  <div className="flex gap-3 mb-3">
                    {["Upcoming", "Pending", "Done", "All"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setAppointmentFilter(status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition 
                          ${
                            appointmentFilter === status
                              ? "bg-[#5EE6FE] text-white shadow"
                              : "bg-gray-100 text-gray-600 hover:bg-[#d3f2fa]"
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {filteredAppointments.map((appt) => {
                    const datePart = appt.date.split(" - ")[0];
                    const parsedDate = new Date(datePart + " 2025")

                    // Fallback in case parsing still fails
                    const isValidDate = !isNaN(parsedDate);

                    return (
                      <div
                        key={appt.id}
                        className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-4 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all cursor-pointer"
                      >
                        {/* LEFT SIDE: DATE STACK */}
                        <div className="flex flex-col items-center justify-center w-16 text-center bg-[#EFFFFF] rounded-lg py-2 border border-[#5EE6FE]/20 shadow-sm">
                          {isValidDate ? (
                            <>
                              <span className="text-xs font-semibold text-[#5EE6FE] uppercase tracking-wide">
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

                        {/* RIGHT SIDE: APPOINTMENT DETAILS */}
                        <div className="flex justify-between items-center flex-1 ml-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {appt.petName} — {appt.type}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <i className="fa-solid fa-clock text-[#5EE6FE]"></i>
                              {appt.date.split(" - ")[1] || "10:00 AM"} &nbsp;•&nbsp;{" "}
                              {appt.status || "Upcoming"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewDetails(appt)}
                            className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#3ecbe0] transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- MEDICAL REPORTS TAB --- */}
              {activeTab === "Medical Reports" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Vaccination Record", date: "October 15, 2025", icon: "fa-syringe" },
                    { title: "Deworming Certificate", date: "September 10, 2025", icon: "fa-capsules" },
                    { title: "Annual Health Report", date: "June 22, 2025", icon: "fa-file-medical" },
                  ].map((record, index) => (
                    <div
                      key={index}
                      className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-5 rounded-xl shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <i className={`fa-solid ${record.icon} text-[#5EE6FE] text-lg`}></i>
                        <h3 className="font-semibold text-gray-800">{record.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                        <i className="fa-regular fa-calendar"></i> {record.date}
                      </p>
                      <button
                        onClick={() => alert(`Downloading ${record.title} PDF...`)}
                        className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#3ecbe0] transition-all"
                      >
                        <i className="fa-solid fa-download mr-2"></i>Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* --- LAB RECORDS TAB --- */}
              {activeTab === "Lab Records" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Blood Test Results", date: "November 1, 2025", icon: "fa-vial" },
                    { title: "Urine Analysis", date: "October 5, 2025", icon: "fa-flask" },
                    { title: "X-ray Findings", date: "August 30, 2025", icon: "fa-x-ray" },
                  ].map((lab, index) => (
                    <div
                      key={index}
                      className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-5 rounded-xl shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <i className={`fa-solid ${lab.icon} text-[#5EE6FE] text-lg`}></i>
                        <h3 className="font-semibold text-gray-800">{lab.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                        <i className="fa-regular fa-calendar"></i> {lab.date}
                      </p>
                      <button
                        onClick={() => alert(`Downloading ${lab.title} PDF...`)}
                        className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#3ecbe0] transition-all"
                      >
                        <i className="fa-solid fa-download mr-2"></i>Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- VIEW DETAILS MODAL --- */}
      {showDetailsModal && selectedAppointment && (
        <>
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 animate-popUp">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[400px] text-gray-800 relative">
              <button
                onClick={closeModal}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-4 text-center text-[#00C3E3]">
                Appointment Details
              </h2>

              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-semibold">Pet Name:</span> {selectedAppointment.petName}
                </p>
                <p>
                  <span className="font-semibold">Owner Name:</span> {selectedAppointment.ownerName}
                </p>
                <p>
                  <span className="font-semibold">Service:</span> {selectedAppointment.type}
                </p>
                <p>
                  <span className="font-semibold">Date & Time:</span> {selectedAppointment.date}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedAppointment.status === "Upcoming"
                        ? "bg-[#E0F9FF] text-[#00B8D4]"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedAppointment.status}
                  </span>
                </p>
                {selectedAppointment.notes && (
                  <p>
                    <span className="font-semibold">Notes:</span> {selectedAppointment.notes}
                  </p>
                )}
              </div>

              <div className="mt-5 flex justify-center">
                <button
                  onClick={closeModal}
                  className="bg-[#5EE6FE] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#3ecbe0] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 sm:bottom-12 sm:right-20 bg-[#5EE6FE] text-white text-2xl w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-[#3ecbe0] transition-all duration-300 z-50"
      >
        <i className="fa-regular fa-comment"></i>
      </button>

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

      {chatType && <FloatingChatBox type={chatType} onClose={() => setChatType(null)} />}

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
