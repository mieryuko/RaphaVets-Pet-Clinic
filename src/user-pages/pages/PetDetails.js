import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import ClientLayout from "../ClientLayout";
import ViewDetailsModal from "../components/home/ViewDetailsModal"; 
import SuccessToast from "../../template/SuccessToast";

function PetDetails() {
  const { id } = useParams();

  const [pet, setPet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState("Upcoming");
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

        const petData = res.data;

        const mappedPet = {
          id: petData.petID,
          name: petData.petName,
          breed: petData.breed,
          gender: petData.petGender || "N/A",
          age: calculateAge(petData.dateOfBirth),
          image: petData.image || "/images/dog-profile.png",
          weight: petData.weight_kg,
          lastCheck: petData.lastCheck || "N/A",
        };

        // ✅ Only update pet.image if there's no preview
        setPet((prev) => ({
          ...mappedPet,
          image: previewImage ? prev.image : mappedPet.image,
        }));

        const mappedAppointments = (petData.appointments || []).map((appt) => ({
          ...appt,
          dateObj: parseAppointmentDate(appt),
        }));
        setAppointments(mappedAppointments);
      } catch (err) {
        console.error("❌ Failed to fetch pet details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [id, previewImage, refreshTrigger]);

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
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
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
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
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {/* Pet Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between px-6 py-5"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#00B8D4] bg-gray-200 flex items-center justify-center">
                <img src={previewImage || pet.image} alt={pet.name} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                {pet.name}
                <motion.button 
                  onClick={() => setShowEditModal(true)} 
                  className="text-gray-400 hover:text-[#00B8D4]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="fa-solid fa-pen text-base"></i>
                </motion.button>
              </h2>
              <p className="text-gray-500 text-sm">
                {pet.breed} • {pet.gender} • {pet.age}
              </p>
            </div>
          </div>
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm mt-4 sm:mt-0"
          >
            <div className="px-4 py-2 bg-[#FFF7E6] rounded-xl shadow-sm text-gray-700">
              <i className="fa-solid fa-calendar-check text-[#00B8D4] mr-2"></i>
              Last Check: {pet.lastCheck}
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-4 rounded-2xl bg-white shadow-lg flex flex-col h-[350px]"
        >
          {/* Tab Headers */}
          <div className="font-semibold flex gap-6 border-b pb-3 mb-4">
            {tabs.map((tab) => (
              <motion.span
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer relative ${
                  activeTab === tab ? "text-[#5EE6FE]" : "text-gray-400"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5EE6FE]"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.span>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === "Appointments" && (
                  <>
                    {/* Filters */}
                    <motion.div 
                      variants={containerVariants}
                      className="flex gap-3 mb-3"
                    >
                      {["Upcoming", "Pending", "Done", "All"].map((status, index) => (
                        <motion.button
                          key={status}
                          variants={itemVariants}
                          onClick={() => setAppointmentFilter(status)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointmentFilter === status
                              ? "bg-[#5EE6FE] text-white shadow"
                              : "bg-gray-100 text-gray-600 hover:bg-[#d3f2fa]"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {status}
                        </motion.button>
                      ))}
                    </motion.div>

                    {/* Appointment Cards */}
                    {filteredAppointments.length > 0 ? (
                      <motion.div
                        variants={containerVariants}
                        className="space-y-4"
                      >
                        {filteredAppointments.map((appt, index) => (
                          <motion.div
                            key={appt.id}
                            variants={cardVariants}
                            className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-4 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 cursor-pointer"
                            whileHover="hover"
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleViewDetails(appt)}
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
                                  {formatAppointmentDate(appt)} • {appt.status}
                                </p>
                              </div>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(appt);
                                }}
                                className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg text-xs font-semibold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View Details
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-gray-500 mt-6"
                      >
                        No appointments found.
                      </motion.p>
                    )}
                  </>
                )}

                {activeTab === "Medical Reports" && (
                  <motion.div
                    variants={containerVariants}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {(pet.medicalReports || []).map((report, index) => (
                      <motion.div
                        key={index}
                        variants={cardVariants}
                        className="rounded-2xl bg-[#FFF8F9] p-5 shadow-sm border border-[#F3D6D8] flex flex-col justify-between"
                        whileHover={{ scale: 1.02 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700">{report.title}</h3>
                          <p className="text-gray-500 text-sm mt-1">{report.date}</p>
                        </div>
                        <motion.button 
                          className="mt-4 bg-[#FFB6C1] text-white px-3 py-2 rounded-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Download PDF
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "Lab Records" && (
                  <motion.div
                    variants={containerVariants}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {(pet.labRecords || []).map((record, index) => (
                      <motion.div
                        key={index}
                        variants={cardVariants}
                        className="rounded-2xl bg-[#E3FAF7] p-5 shadow-sm border border-[#A6E3E9] flex flex-col justify-between"
                        whileHover={{ scale: 1.02 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700">{record.title}</h3>
                          <p className="text-gray-500 text-sm mt-1">{record.date}</p>
                        </div>
                        <motion.button 
                          className="mt-4 bg-[#5EE6FE] text-white px-3 py-2 rounded-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Report
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="relative z-50 mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ViewDetailsModal appointment={selectedAppointment} closeModal={closeModal} />
            </motion.div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              className="relative z-50 mx-4 w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="bg-white rounded-xl p-5 w-full shadow-2xl max-h-[80vh] overflow-y-auto">
                <motion.button 
                  onClick={() => setShowEditModal(false)} 
                  className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
                
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Edit Pet Profile</h3>
                
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#00B8D4] bg-gray-200 flex items-center justify-center mb-3">
                      <img 
                        src={previewImage || pet.image} 
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
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setPreviewImage(previewUrl);
                          await handleImageUpload(file);
                        }
                      }}
                    />

                    <motion.label 
                      htmlFor="profile-upload"
                      className="absolute bottom-1 right-0 bg-[#5EE6FE] text-white p-1.5 rounded-full shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="fa-solid fa-camera text-xs"></i>
                    </motion.label>
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
                  <motion.button 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    onClick={handleSaveChanges}
                    className="flex-1 bg-[#5EE6FE] text-white py-2 rounded-lg text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Contact support to update pet information
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showSuccessToast && (
        <SuccessToast 
          message={toastMessage} 
          onClose={() => setShowSuccessToast(false)} 
        />
      )}
    </ClientLayout>
  );
}

export default PetDetails;