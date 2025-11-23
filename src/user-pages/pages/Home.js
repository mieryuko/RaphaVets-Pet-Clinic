import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";

// Component imports
import DashboardCard from "../components/home/DashboardCard";
import AppointmentTab from "../components/home/AppointmentTab";
import MedicalReportsTab from "../components/home/MedicalReportsTab";
import LabRecordsTab from "../components/home/LabRecordsTab";
import ViewDetailsModal from "../components/home/ViewDetailsModal";
import api from "../../api/axios";

function Home() {
  const [activeTab, setActiveTab] = useState("Appointment");
  const [appointmentFilter, setAppointmentFilter] = useState("Upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [labRecords, setLabRecords] = useState([]);
  const [loading, setLoading] = useState({
    appointments: true,
    medical: true,
    lab: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
    fetchMedicalRecords();
    fetchLabRecords();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token"); 
      const res = await api.get("/appointment/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
      setLoading(prev => ({ ...prev, appointments: false }));
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Get user ID from localStorage - using the correct key
      const userId = localStorage.getItem("userId");
      const userData = JSON.parse(localStorage.getItem("user"));
      
      console.log("🔍 Fetching medical records...");
      console.log("📱 User ID from localStorage:", userId);
      console.log("📱 User data from localStorage:", userData);
      
      // Use userId (17) from localStorage
      if (userId) {
        const res = await api.get(`/medical-records/user/${userId}?recordType=medical`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Medical records API response:", res.data);
        setMedicalRecords(res.data.data || []);
      } else {
        console.log("❌ No user ID found in localStorage");
      }
      setLoading(prev => ({ ...prev, medical: false }));
    } catch (err) {
      console.error("❌ Error fetching medical records:", err);
      console.error("Error details:", err.response?.data);
      setMedicalRecords([]);
      setLoading(prev => ({ ...prev, medical: false }));
    }
  };

  const fetchLabRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Get user ID from localStorage - using the correct key
      const userId = localStorage.getItem("userId");
      
      console.log("🔍 Fetching lab records...");
      console.log("📱 User ID from localStorage:", userId);
      
      // Use userId (17) from localStorage
      if (userId) {
        const res = await api.get(`/medical-records/user/${userId}?recordType=lab`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Lab records API response:", res.data);
        setLabRecords(res.data.data || []);
      }
      setLoading(prev => ({ ...prev, lab: false }));
    } catch (err) {
      console.error("❌ Error fetching lab records:", err);
      console.error("Error details:", err.response?.data);
      setLabRecords([]);
      setLoading(prev => ({ ...prev, lab: false }));
    }
  };

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

  const filteredAppointments = appointments.filter(
    (a) => appointmentFilter === "All" || a.status === appointmentFilter
  );

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  // Debug logs
  console.log("📊 Current state:", {
    activeTab,
    medicalRecordsCount: medicalRecords.length,
    labRecordsCount: labRecords.length,
    medicalRecords,
    labRecords,
    loading
  });

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

  return (
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Dashboard Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6"
        >
          <motion.div variants={cardVariants}>
            <DashboardCard 
              title="Daily Walks" 
              description="Take your dog for at least 30 minutes of walking to keep them healthy." 
              icon="fa-dumbbell" 
              bg="#FCE7F3" 
              text="#045D56" 
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <DashboardCard 
              title="Hydration Reminder" 
              description="Ensure your pet has access to fresh water at all times." 
              icon="fa-droplet" 
              bg="#E3FAF7" 
              text="#7C2E38" 
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <DashboardCard 
              title="Book Appointment" 
              description="Schedule a visit with your vet in just a few clicks." 
              icon="fa-calendar-days" 
              bg="#FFF4E5" 
              text="#5E2A4F" 
              onClick={() => navigate("/booking")} 
            />
          </motion.div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div 
          variants={itemVariants}
          className="px-6 py-4 rounded-2xl bg-white shadow-lg flex flex-col h-[350px]"
        >
          {/* Tab Headers */}
          <div className="font-semibold flex gap-6 border-b pb-3 mb-4">
            {["Appointment", "Medical Reports", "Lab Records"].map((tab) => (
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

          {/* Tab Content */}
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
                {activeTab === "Appointment" && (
                  <AppointmentTab 
                    appointments={filteredAppointments} 
                    appointmentFilter={appointmentFilter} 
                    setAppointmentFilter={setAppointmentFilter} 
                    handleViewDetails={handleViewDetails} 
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

      {/* View Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ViewDetailsModal appointment={selectedAppointment} closeModal={closeModal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}

export default Home;