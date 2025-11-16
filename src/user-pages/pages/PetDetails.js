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
  
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modal and toast states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const tabs = ["Appointments", "Medical Reports", "Lab Records"];

  const calculateAge = (dob) => {
    if (!dob) return "Unknown";
    
    const birth = new Date(dob);
    // Handle invalid dates
    if (isNaN(birth.getTime())) return "Unknown";
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age + " yrs";
  };

  // Helper function to safely parse dates
  const parseAppointmentDate = (appointment) => {
    try {
      // If the API returns a formatted date string like "Nov 22, 2025 - 12:00:00"
      // We need to extract the date part and create a valid Date object
      if (appointment.date && typeof appointment.date === 'string') {
        // Split the date string to get the date part (before the '-')
        const datePart = appointment.date.split(' - ')[0];
        if (datePart) {
          return new Date(datePart);
        }
      }
      
      // Fallback: If we have appointmentDate from the raw data
      if (appointment.appointmentDate) {
        return new Date(appointment.appointmentDate);
      }
      
      // Last resort: return current date
      return new Date();
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date(); // Return current date as fallback
    }
  };

  // Helper function to format date for display
  const formatAppointmentDate = (appointment) => {
    const dateObj = parseAppointmentDate(appointment);
    
    // Format: "Nov 22, 2025 - 12:00 PM"
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    
    const dateStr = dateObj.toLocaleDateString('en-US', options);
    
    // Get time part from the original date string if available
    if (appointment.date && typeof appointment.date === 'string') {
      const timePart = appointment.date.split(' - ')[1];
      if (timePart) {
        return `${dateStr} - ${formatTime(timePart)}`;
      }
    }
    
    return dateStr;
  };

  const getAppointmentTime = (appointment) => {
    try {
      if (appointment.date && typeof appointment.date === 'string') {
        const timePart = appointment.date.split(' - ')[1];
        if (timePart) {
          return formatTime(timePart);
        }
      }
      return "Unknown time";
    } catch (error) {
      return "Unknown time";
    }
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    try {
      // Convert "12:00:00" to "12:00 PM"
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString; // Return original if parsing fails
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("petImage", file);

      const token = localStorage.getItem("token");
      const res = await api.post(`/pets/${pet.id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📤 Upload Response:", res.data); // Debug log

      // The API already returns the full URL, so use it directly
      setPet(prev => ({ 
        ...prev, 
        image: res.data.imageUrl // Use the URL directly from API response
      }));
      
      setPreviewImage(null);
      
      // Trigger sidebar refresh
      setRefreshTrigger(prev => prev + 1);
      
      setToastMessage("Profile picture updated successfully!");
      setShowSuccessToast(true);
      
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setToastMessage("Failed to upload image.");
      setShowSuccessToast(true);
    }
  };

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📊 Full API Response:", res.data);

        const petData = res.data;

        // Map the pet data with proper field names from your database
        const mappedPet = {
          id: petData.petID || petData.id,
          name: petData.petName || petData.name || "Unknown Name",
          breed: petData.breed || "Unknown Breed",
          gender: petData.petGender || petData.gender || "N/A",
          age: calculateAge(petData.dateOfBirth),
          image: petData.image || "/images/dog-profile.png",
          weight: petData.weight_kg,
          lastCheck: petData.lastCheck || "N/A",
          dateOfBirth: petData.dateOfBirth,
          color: petData.color,
          note: petData.note
        };

        console.log("🐾 Mapped Pet Data:", mappedPet);

        setPet(mappedPet);

        // Process appointments with proper date handling
        const mappedAppointments = (petData.appointments || []).map((appt) => ({
          ...appt,
          dateObj: parseAppointmentDate(appt),
          formattedDate: formatAppointmentDate(appt),
          displayDate: formatAppointmentDate(appt)
        }));
        
        console.log("📅 Mapped Appointments:", mappedAppointments);
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
          {/* Pass refreshTrigger to SideBar */}
          <SideBar 
            isMenuOpen={isMenuOpen} 
            setIsMenuOpen={setIsMenuOpen} 
            refreshTrigger={refreshTrigger}
          />

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
                    <img 
                      src={previewImage || `http://localhost:5000${pet.image}`} 
                      alt={pet.name} 
                      className="w-full h-full object-cover"
                    />
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
                                {getAppointmentTime(appt)} • {appt.status}
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
                  <div className="text-center text-gray-500 mt-6">
                    No medical reports available.
                  </div>
                )}

                {activeTab === "Lab Records" && (
                  <div className="text-center text-gray-500 mt-6">
                    No lab records available.
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
                      src={previewImage || `http://localhost:5000${pet.image}`} 
                      alt={pet.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <input 
                    type="file" 
                    id="profile-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setPreviewImage(previewUrl);
                        await handleImageUpload(file);
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