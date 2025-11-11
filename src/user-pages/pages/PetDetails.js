import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { motion } from "framer-motion";
import Header from "../template/Header";
import SideBar from "../template/SideBar";
import ViewDetailsModal from "../components/home/ViewDetailsModal"; 
import SuccessToast from "../../template/SuccessToast";

function PetDetails() {
  const { id } = useParams();

  const [pet, setPet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState("Upcoming");
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Appointments");
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Modal and toast states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const tabs = ["Appointments", "Medical Reports", "Lab Records"];

  const calculateAge = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age + " yrs";
  };

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const petData = res.data;

        const mappedPet = {
          id: petData.petID,
          name: petData.petName,
          breed: petData.breed,
          gender: petData.petGender || "N/A",
          age: calculateAge(petData.dateOfBirth),
          image: petData.imageName || "/images/dog-profile.png",
          weight: petData.weight_kg,
          lastCheck: petData.lastCheck || "N/A",
        };
        setPet(mappedPet);

        const mappedAppointments = (petData.appointments || []).map((appt) => ({
          ...appt,
          dateObj: new Date(appt.date)
        }));
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
    setSelectedAppointment(appt);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  const handleSaveChanges = () => {
    setShowEditModal(false);
    setToastMessage("Profile picture updated successfully!");
    setShowSuccessToast(true);
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
    <div className={`font-sansation min-h-screen bg-[#FBFBFB] relative ${(showEditModal || showDetailsModal) ? 'overflow-hidden' : ''}`}>
      <div className={`${(showEditModal || showDetailsModal) ? 'blur-sm' : ''}`}>
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

            {/* Tabs Section */}
            <div className="px-6 py-4 rounded-2xl bg-white shadow-lg flex flex-col h-[350px]">
              {/* Tab Headers */}
              <div className="font-semibold flex gap-6 border-b pb-3 mb-4">
                {tabs.map((tab) => (
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
                {activeTab === "Appointments" && (
                  <>
                    {/* Filters */}
                    <div className="flex gap-3 mb-3">
                      {["Upcoming", "Pending", "Done", "All"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setAppointmentFilter(status)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            appointmentFilter === status
                              ? "bg-[#5EE6FE] text-white shadow"
                              : "bg-gray-100 text-gray-600 hover:bg-[#d3f2fa]"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {/* Appointment Cards */}
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-4 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all cursor-pointer"
                        >
                          <div className="flex flex-col items-center justify-center w-16 text-center bg-[#EFFFFF] rounded-lg py-2 border border-[#5EE6FE]/20 shadow-sm">
                            <span className="text-xs font-semibold text-[#5EE6FE] uppercase tracking-wide">
                              {appt.dateObj?.toLocaleString("default", { month: "short" })}
                            </span>
                            <span className="text-xl font-bold text-gray-800 leading-tight">
                              {appt.dateObj?.getDate()}
                            </span>
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
                                <i className="fa-solid fa-clock text-[#5EE6FE]"></i>
                                {appt.date} • {appt.status}
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
                      ))
                    ) : (
                      <p className="text-center text-gray-500 mt-6">No appointments found.</p>
                    )}
                  </>
                )}

                {activeTab === "Medical Reports" && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(pet.medicalReports || []).map((report, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-[#FFF8F9] p-5 shadow-sm border border-[#F3D6D8] flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700">{report.title}</h3>
                          <p className="text-gray-500 text-sm mt-1">{report.date}</p>
                        </div>
                        <button className="mt-4 bg-[#FFB6C1] text-white px-3 py-2 rounded-lg hover:bg-[#FF9FB0] transition-all">
                          Download PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Lab Records" && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(pet.labRecords || []).map((record, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-[#E3FAF7] p-5 shadow-sm border border-[#A6E3E9] flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700">{record.title}</h3>
                          <p className="text-gray-500 text-sm mt-1">{record.date}</p>
                        </div>
                        <button className="mt-4 bg-[#5EE6FE] text-white px-3 py-2 rounded-lg hover:bg-[#3ecbe0] transition-all">
                          View Report
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="relative z-50 mx-4">
            <ViewDetailsModal appointment={selectedAppointment} closeModal={closeModal} />
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="relative z-50 mx-4 w-full max-w-sm">
            <div className="bg-white rounded-xl p-5 w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
              
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Edit Pet Profile</h3>
              
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#00B8D4] bg-gray-200 flex items-center justify-center mb-3">
                    <img 
                      src={pet.image} 
                      alt={pet.name} 
                      className="w-full h-full object-cover"
                      id="pet-profile-image"
                    />
                  </div>
                  <input 
                    type="file" 
                    id="profile-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          document.getElementById('pet-profile-image').src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="profile-upload"
                    className="absolute bottom-1 right-0 bg-[#5EE6FE] text-white p-1.5 rounded-full shadow-lg hover:bg-[#3ecbe0] transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-camera text-xs"></i>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Click camera to change photo</p>
              </div>

              {/* Read-only Information */}
              <div className="space-y-3 mb-4">
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <label className="text-xs text-gray-500 block mb-1">Pet Name</label>
                  <p className="text-sm text-gray-800 font-medium">{pet.name}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <label className="text-xs text-gray-500 block mb-1">Breed</label>
                  <p className="text-sm text-gray-800 font-medium">{pet.breed}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <label className="text-xs text-gray-500 block mb-1">Age</label>
                    <p className="text-sm text-gray-800 font-medium">{pet.age}</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <label className="text-xs text-gray-500 block mb-1">Gender</label>
                    <p className="text-sm text-gray-800 font-medium">{pet.gender}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveChanges}
                  className="flex-1 bg-[#5EE6FE] text-white py-2 rounded-lg hover:bg-[#3ecbe0] transition-all text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-3">
                Contact support to update pet information
              </p>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <SuccessToast 
          message={toastMessage} 
          onClose={() => setShowSuccessToast(false)} 
        />
      )}
    </div>
  );
}

export default PetDetails;
