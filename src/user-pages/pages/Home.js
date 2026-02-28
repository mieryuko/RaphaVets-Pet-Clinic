import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";
import socket from "../../socket"; // 👈 ADD THIS IMPORT

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
  const [petCareTips, setPetCareTips] = useState([]);
  const [loading, setLoading] = useState({
    appointments: true,
    medical: true,
    lab: true,
    tips: true
  });
  const navigate = useNavigate();

  // Socket.IO connection and listeners
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    // Setup socket connection
    if (!socket.connected) {
      socket.connect();
    }

    // Socket connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setSocketConnected(true);
      
      // Join user room when connected
      if (userId) {
        socket.emit('join', userId);
        console.log(`👤 Joined room: user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    // Join user room if already connected
    if (socket.connected && userId) {
      socket.emit('join', userId);
      setSocketConnected(true);
    }

    // Listen for new medical records
    socket.on('new_medical_record', (newRecord) => {
      console.log('📨 New medical record received:', newRecord);
      
      // Show a notification or toast (optional)
      showNotification('New Record Added', `A new ${newRecord.recordCategory} record has been added for ${newRecord.petName}`);
      
      // Determine if it's medical or lab based on recordCategory or labTypeID
      if (newRecord.recordCategory === 'lab' || newRecord.labTypeID === 1) {
        setLabRecords(prev => {
          // Check if already exists
          const exists = prev.some(r => r.id === newRecord.id);
          if (exists) return prev;
          return [newRecord, ...prev];
        });
      } else {
        setMedicalRecords(prev => {
          const exists = prev.some(r => r.id === newRecord.id);
          if (exists) return prev;
          return [newRecord, ...prev];
        });
      }
    });

    // Listen for updated medical records
    socket.on('medical_record_updated', (updatedRecord) => {
      console.log('📨 Medical record updated:', updatedRecord);
      
      showNotification('Record Updated', `The ${updatedRecord.recordCategory} record for ${updatedRecord.petName} has been updated`);
      
      // Update in both lists if present
      setMedicalRecords(prev => 
        prev.map(record => 
          record.id === updatedRecord.id ? { ...record, ...updatedRecord } : record
        )
      );
      
      setLabRecords(prev => 
        prev.map(record => 
          record.id === updatedRecord.id ? { ...record, ...updatedRecord } : record
        )
      );
    });

    // Listen for deleted medical records
    socket.on('medical_record_deleted', ({ id }) => {
      console.log('📨 Medical record deleted:', id);
      
      // Find the record to show which pet it belonged to (optional)
      const deletedMedical = medicalRecords.find(r => r.id === id);
      const deletedLab = labRecords.find(r => r.id === id);
      const deletedRecord = deletedMedical || deletedLab;
      
      if (deletedRecord) {
        showNotification('Record Deleted', `A record for ${deletedRecord.petName} has been deleted`);
      }
      
      setMedicalRecords(prev => prev.filter(record => record.id !== id));
      setLabRecords(prev => prev.filter(record => record.id !== id));
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_medical_record');
      socket.off('medical_record_updated');
      socket.off('medical_record_deleted');
    };
  }, [medicalRecords, labRecords]); // Add dependencies to access current state in cleanup

  // Simple notification function (you can replace with your preferred toast library)
  const showNotification = (title, message) => {
    // You can implement a toast notification here
    console.log(`🔔 ${title}: ${message}`);
  };
  const [socketConnected, setSocketConnected] = useState(false);
  
  useEffect(() => {
    fetchAppointments();
    fetchMedicalRecords();
    fetchLabRecords();
    fetchPetCareTips();
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
      const userId = localStorage.getItem("userId");
      
      if (userId) {
        const res = await api.get(`/medical-records/user/${userId}?recordType=medical`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicalRecords(res.data.data || []);
      }
      setLoading(prev => ({ ...prev, medical: false }));
    } catch (err) {
      console.error("❌ Error fetching medical records:", err);
      setMedicalRecords([]);
      setLoading(prev => ({ ...prev, medical: false }));
    }
  };

  const fetchLabRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (userId) {
        const res = await api.get(`/medical-records/user/${userId}?recordType=lab`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLabRecords(res.data.data || []);
      }
      setLoading(prev => ({ ...prev, lab: false }));
    } catch (err) {
      console.error("❌ Error fetching lab records:", err);
      setLabRecords([]);
      setLoading(prev => ({ ...prev, lab: false }));
    }
  };

  const fetchPetCareTips = async () => {
    try {
      const res = await api.get("/pet-care-tips/random?count=2");
      setPetCareTips(res.data.data || []);
      setLoading(prev => ({ ...prev, tips: false }));
    } catch (err) {
      console.error("❌ Error fetching pet care tips:", err);
      setPetCareTips([]);
      setLoading(prev => ({ ...prev, tips: false }));
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

  // Animation variants (keep your existing ones)
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
        className="space-y-4 sm:space-y-6"
      >
        {/* Dashboard Cards - Responsive Grid */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
        >
          {/* Card 1: Pet Care Tip or Loading */}
          <motion.div variants={cardVariants} className="w-full">
            {loading.tips ? (
              <DashboardCard 
                title="Loading Tip..." 
                description="Fetching pet care tips for you."
                icon="fa-spinner fa-spin" 
                bg="#FCE7F3" 
                text="#045D56" 
              />
            ) : petCareTips[0] ? (
              <DashboardCard 
                title={petCareTips[0].title} 
                description={petCareTips[0].short}
                icon={petCareTips[0].icon || "fa-paw"}
                bg="#FCE7F3" 
                text="#045D56"
                url={petCareTips[0].url}
              />
            ) : (
              <DashboardCard 
                title="Pet Care Tips" 
                description="No tips available at the moment."
                icon="fa-paw" 
                bg="#FCE7F3" 
                text="#045D56" 
              />
            )}
          </motion.div>

          {/* Card 2: Pet Care Tip or Loading */}
          <motion.div variants={cardVariants} className="w-full">
            {loading.tips ? (
              <DashboardCard 
                title="Loading Tip..." 
                description="Fetching pet care tips for you."
                icon="fa-spinner fa-spin" 
                bg="#E3FAF7" 
                text="#7C2E38" 
              />
            ) : petCareTips[1] ? (
              <DashboardCard 
                title={petCareTips[1].title} 
                description={petCareTips[1].short}
                icon={petCareTips[1].icon || "fa-paw"}
                bg="#E3FAF7" 
                text="#7C2E38"
                url={petCareTips[1].url}
              />
            ) : (
              <DashboardCard 
                title="Pet Care Tips" 
                description="No tips available at the moment."
                icon="fa-paw" 
                bg="#E3FAF7" 
                text="#7C2E38" 
              />
            )}
          </motion.div>

          {/* Card 3: Book Appointment */}
          <motion.div variants={cardVariants} className="w-full">
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

        {/* Tabs Section - Responsive height */}
        <motion.div 
          variants={itemVariants}
          className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white shadow-lg flex flex-col min-h-[300px] sm:h-[350px] lg:h-[400px]"
        >
          {/* Tab Headers - Responsive */}
          <div className="font-semibold flex gap-4 sm:gap-6 border-b pb-2 sm:pb-3 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide">
            {["Appointment", "Medical Reports", "Lab Records"].map((tab) => (
              <motion.span
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer relative whitespace-nowrap text-sm sm:text-base ${
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

          {/* Tab Content - Responsive */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
                    onAppointmentCancelled={fetchAppointments}
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
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md"
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