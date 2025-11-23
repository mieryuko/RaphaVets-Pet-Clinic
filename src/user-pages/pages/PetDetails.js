import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import ClientLayout from "../ClientLayout";
import ViewDetailsModal from "../components/home/ViewDetailsModal"; 
import SuccessToast from "../../template/SuccessToast";

// Import the tab components
import AppointmentTab from "../components/home/AppointmentTab";
import MedicalReportsTab from "../components/home/MedicalReportsTab";
import LabRecordsTab from "../components/home/LabRecordsTab";

function PetDetails() {
  const { id } = useParams();

  const [pet, setPet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [labRecords, setLabRecords] = useState([]);
  const [loading, setLoading] = useState({
    pet: true,
    medical: true,
    lab: true
  });
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

  // Fetch medical records for this specific pet
  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Fetching medical records for pet:", id);
      
      const res = await api.get(`/medical-records/pet/${id}?recordType=medical`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("✅ Medical records response:", res.data);
      setMedicalRecords(res.data.data || []);
      setLoading(prev => ({ ...prev, medical: false }));
    } catch (err) {
      console.error("❌ Error fetching medical records:", err);
      setMedicalRecords([]);
      setLoading(prev => ({ ...prev, medical: false }));
    }
  };

  // Fetch lab records for this specific pet
  const fetchLabRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Fetching lab records for pet:", id);
      
      const res = await api.get(`/medical-records/pet/${id}?recordType=lab`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("✅ Lab records response:", res.data);
      setLabRecords(res.data.data || []);
      setLoading(prev => ({ ...prev, lab: false }));
    } catch (err) {
      console.error("❌ Error fetching lab records:", err);
      setLabRecords([]);
      setLoading(prev => ({ ...prev, lab: false }));
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "Unknown";
    
    const birth = new Date(dob);
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
      if (appointment.date && typeof appointment.date === 'string') {
        const datePart = appointment.date.split(' - ')[0];
        if (datePart) {
          return new Date(datePart);
        }
      }
      
      if (appointment.appointmentDate) {
        return new Date(appointment.appointmentDate);
      }
      
      return new Date();
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  // Helper function to format date for display
  const formatAppointmentDate = (appointment) => {
    const dateObj = parseAppointmentDate(appointment);
    
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    
    const dateStr = dateObj.toLocaleDateString('en-US', options);
    
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
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("petImage", file);

      const token = localStorage.getItem("token");
      const res = await api.post(`/pets/${id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📤 Upload Response:", res.data);

      setPet(prev => ({
        ...prev,
        image: res.data.imageUrl
      }));

      setPreviewImage(null);

      localStorage.removeItem('cachedPets');
      localStorage.removeItem('petsCacheTimestamp');

      window.dispatchEvent(new Event('petImageUpdated'));
      setRefreshTrigger(prev => prev + 1);

      setToastMessage("Profile picture updated successfully!");
      setShowSuccessToast(true);

    } catch (err) {
      console.error("❌ Upload failed:", err);
      setToastMessage("Failed to upload image.");
      setShowSuccessToast(true);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = (appointment) => {
    console.log("Cancelling appointment:", appointment.id);
  };

  // Handle view details
  const handleViewDetails = (appt) => {
    setSelectedAppointment(appt);
    setShowDetailsModal(true);
  };

  // Handle download for medical/lab records
  const handleDownload = async (fileID, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/medical-records/download/${fileID}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert('Failed to download file');
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
        console.log("📊 Pet Data from API:", petData);

        const mappedPet = {
          id: petData.petID || petData.id,
          name: petData.name || "Unknown Name",
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
        
        console.log("🔄 Mapped Pet:", mappedPet);
        
        if (previewImage) {
          setPet(prev => ({
            ...mappedPet,
            image: prev?.image || mappedPet.image
          }));
        } else {
          setPet(mappedPet);
        }

        const mappedAppointments = (petData.appointments || []).map((appt) => ({
          ...appt,
          dateObj: parseAppointmentDate(appt),
          formattedDate: formatAppointmentDate(appt),
          displayDate: formatAppointmentDate(appt)
        }));
       
        console.log("📅 Mapped Appointments:", mappedAppointments);
        setAppointments(mappedAppointments);
        setLoading(prev => ({ ...prev, pet: false }));

        // Fetch medical and lab records after pet data is loaded
        fetchMedicalRecords();
        fetchLabRecords();

      } catch (err) {
        console.error("❌ Failed to fetch pet details:", err);
        setLoading(prev => ({ ...prev, pet: false, medical: false, lab: false }));
      }
    };

    fetchPetData();
  }, [id, refreshTrigger]);

  const filteredAppointments = appointments.filter((appt) =>
    appointmentFilter === "All" ? true : appt.status === appointmentFilter
  );

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

  if (loading.pet)
    return (
      <ClientLayout>
        <div className="flex flex-col gap-6">
          {/* Pet Header Skeleton */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between px-6 py-5 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-300 bg-gray-200 flex items-center justify-center"></div>
              </div>
              <div>
                <div className="h-7 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm mt-4 sm:mt-0">
              <div className="px-4 py-2 bg-gray-200 rounded-xl shadow-sm h-9 w-40"></div>
            </div>
          </div>

          {/* Tabs Section Skeleton */}
          <div className="px-6 py-4 rounded-2xl bg-white shadow-lg flex flex-col h-[350px] animate-pulse">
            {/* Tab Headers */}
            <div className="font-semibold flex gap-6 border-b pb-3 mb-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-6 w-24 bg-gray-200 rounded"></div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {/* Filters Skeleton */}
              <div className="flex gap-3 mb-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-7 w-16 bg-gray-200 rounded-full"></div>
                ))}
              </div>

              {/* Appointment Cards Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-100 border border-gray-200 p-4 rounded-xl flex justify-between items-center">
                    <div className="flex flex-col items-center justify-center w-16 text-center bg-gray-200 rounded-lg py-2">
                      <div className="h-3 w-8 bg-gray-300 rounded mb-1"></div>
                      <div className="h-5 w-6 bg-gray-300 rounded mb-1"></div>
                      <div className="h-2 w-10 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center flex-1 ml-4">
                      <div>
                        <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 w-32 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-8 w-20 bg-gray-300 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );

  if (!pet)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Pet not found.
      </div>
    );

  return (
    <ClientLayout refreshTrigger={refreshTrigger}>
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
                <img
                  src={previewImage || `http://localhost:5000${pet.image}`}
                  alt={pet.name || "Pet"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/images/dog-profile.png";
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                {pet.name || "Unnamed Pet"}
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
                {pet.breed || "Unknown breed"} • {pet.gender || "Unknown"} • {pet.age || "Unknown age"}
              </p>
            </div>
          </div>
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm mt-4 sm:mt-0"
          >
            <div className="px-4 py-2 bg-[#FFF7E6] rounded-xl shadow-sm text-gray-700">
              <i className="fa-solid fa-calendar-check text-[#00B8D4] mr-2"></i>
              Last Check: {pet.lastCheck || "N/A"}
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
                  <AppointmentTab
                    appointments={filteredAppointments}
                    appointmentFilter={appointmentFilter}
                    setAppointmentFilter={setAppointmentFilter}
                    handleViewDetails={handleViewDetails}
                    handleCancelAppointment={handleCancelAppointment}
                  />
                )}

                {activeTab === "Medical Reports" && (
                  <MedicalReportsTab 
                    records={medicalRecords} 
                    onDownload={handleDownload}
                    loading={loading.medical}
                  />
                )}

                {activeTab === "Lab Records" && (
                  <LabRecordsTab 
                    records={labRecords} 
                    onDownload={handleDownload}
                    loading={loading.lab}
                  />
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
                        src={previewImage || `http://localhost:5000${pet.image}`}
                        alt={pet.name || "Pet"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/images/dog-profile.png";
                        }}
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
                    <p className="text-sm text-gray-800 font-medium">{pet.name || "Unnamed Pet"}</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <label className="text-xs text-gray-500 block mb-1">Breed</label>
                    <p className="text-sm text-gray-800 font-medium">{pet.breed || "Unknown breed"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <label className="text-xs text-gray-500 block mb-1">Age</label>
                      <p className="text-sm text-gray-800 font-medium">{pet.age || "Unknown age"}</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <label className="text-xs text-gray-500 block mb-1">Gender</label>
                      <p className="text-sm text-gray-800 font-medium">{pet.gender || "Unknown"}</p>
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