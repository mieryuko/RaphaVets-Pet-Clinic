import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { motion } from "framer-motion";
import Header from "../template/Header";
import SideBar from "../template/SideBar";
import DietFeedingSection from "../components/pet-details/DietFeedingSection";
import BehaviorNotesSection from "../components/pet-details/BehaviorNote";

function PetDetails() {
  const { id } = useParams();

  const [pet, setPet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState("Upcoming");
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Appointments");
  const [showEditModal, setShowEditModal] = useState(false);

  const tabs = ["Appointments", "Medical History", "Diet & Feeding", "Behavior Notes"];

  // Helper to calculate pet age
  const calculateAge = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age + " yrs";
  };

  // Fetch pet + appointments
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const petData = res.data;
        console.log("Fetched pet details:", petData);

        // Map backend fields to frontend-friendly
        const mappedPet = {
          id: petData.petID,
          name: petData.petName,
          breed: petData.breed,
          gender: petData.gender || "N/A",
          age: calculateAge(petData.dateOfBirth),
          image: petData.imageName || "/images/dog-profile.png",
          weight: petData.weight_kg,
          lastCheck: petData.lastCheck || "N/A",
        };

        setPet(mappedPet);

        // Map appointments
        const mappedAppointments = (petData.appointments || []).map((appt) => {
          const [monthStr, day, , time] = appt.date.split(/[\s-]+/);
          const dateObj = new Date(`${monthStr} ${day}, ${new Date().getFullYear()} ${time}`);
          return { ...appt, dateObj };
        });
        setAppointments(mappedAppointments);
      } catch (err) {
        console.error("❌ Failed to fetch pet details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPetData();
  }, [id]);

  const filteredAppointments = appointments.filter((appt) =>
    appointmentFilter === "All" ? true : appt.status === appointmentFilter
  );

  const handleViewDetails = (appt) => {
    alert(`Viewing details for ${appt.type} on ${appt.date}`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading pet details...
      </div>
    );

  if (!pet)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Pet not found.
      </div>
    );

  return (
    <div className="font-sansation min-h-screen bg-gradient-to-b from-[#FDFBFB] to-[#EBEDEE] relative">
      <Header setIsMenuOpen={setIsMenuOpen} />
      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp">
        <SideBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} pets={[pet]} setShowModal={() => {}} />

        <div
          className={`transition-all duration-500 ease-in-out flex flex-col gap-6 rounded-xl p-5 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"
          }`}
        >
          {/* Pet Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between px-6 py-5"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#00B8D4] bg-gray-200 flex items-center justify-center">
                  <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {pet.name}
                  <button onClick={() => setShowEditModal(true)} className="text-gray-400 hover:text-[#00B8D4] transition-all">
                    <i className="fa-solid fa-pen text-base"></i>
                  </button>
                </h2>
                <p className="text-gray-500 text-sm">
                  {pet.breed} • {pet.gender} • {pet.age}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm mt-4 sm:mt-0">
              <div className="px-4 py-2 bg-[#FFF7E6] rounded-xl shadow-sm text-gray-700">
                <i className="fa-solid fa-calendar-check text-[#00B8D4] mr-2"></i>
                Last Check: {pet.lastCheck}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
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

            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 min-h-[350px]">
              {activeTab === "Appointments" && (
                <div className="px-6 rounded-2xl bg-white shadow-lg flex flex-col h-[350px]">
                  {/* Filters */}
                  <div className="flex gap-3 mb-3">
                    {["Upcoming", "Pending", "Done", "All"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setAppointmentFilter(status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
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
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="bg-white/70 backdrop-blur-md border border-[#00B8D4]/30 p-4 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all cursor-pointer"
                        >
                          <div className="flex flex-col items-center justify-center w-16 text-center bg-[#EFFFFF] rounded-lg py-2 border border-[#00B8D4]/20 shadow-sm">
                            <span className="text-xs font-semibold text-[#00B8D4] uppercase tracking-wide">
                              {appt.dateObj?.toLocaleString("default", { month: "short" })}
                            </span>
                            <span className="text-xl font-bold text-gray-800 leading-tight">{appt.dateObj?.getDate()}</span>
                            <span className="text-[10px] text-gray-500 capitalize">
                              {appt.dateObj?.toLocaleString("default", { weekday: "short" })}
                            </span>
                          </div>

                          <div className="flex justify-between items-center flex-1 ml-4">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {pet.name} — {appt.type}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <i className="fa-solid fa-clock text-[#00B8D4]"></i>
                                {appt.date} • {appt.status}
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
                      ))
                    ) : (
                      <p className="text-center text-gray-500 mt-6">No appointments found.</p>
                    )}
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
                        <h3 className="text-lg font-semibold text-gray-700">Vaccination Record</h3>
                        <p className="text-gray-500 text-sm mt-1">April 5, 2025</p>
                      </div>
                      <button className="mt-4 bg-[#FFB6C1] text-white px-3 py-2 rounded-lg hover:bg-[#FF9FB0] transition-all">
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Diet & Feeding" && <DietFeedingSection />}
              {activeTab === "Behavior Notes" && <BehaviorNotesSection />}
            </motion.div>
          </div>

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative">
                <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl">
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
