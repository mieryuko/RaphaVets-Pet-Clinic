import { useState } from "react";
import Header from "../template/Header";
import { useNavigate } from "react-router-dom";

// Import components
import CalendarTab from "../components/appointments/CalendarTab";
import AppointmentsTab from "../components/appointments/AppointmentsTab";
import VisitsTab from "../components/appointments/VisitsTab";
import RequestsTab from "../components/appointments/RequestsTab";
import AppointmentRequestModal from "../components/appointments/AppointmentRequestModal";
import AppointmentDetailsModal from "../components/appointments/AppointmentDetailsModal";
import DeleteConfirmationModal from "../components/appointments/DeleteConfirmationModal";
import CancelAppointmentModal from "../components/appointments/CancelAppointmentModal";
import SuccessToast from "../../template/SuccessToast";

const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

const sampleAppointments = [
  { id: 1, petName: "Bogart", owner: "Mark Mapili", date: `${currentYear}-${currentMonth}-10`, time: "9:00 AM", status: "Completed", visitType: "Scheduled" },
  { id: 2, petName: "Tan tan", owner: "Miguel Rojero", date: `${currentYear}-${currentMonth}-12`, time: "11:30 AM", status: "Cancelled", visitType: "Scheduled" },
  { id: 3, petName: "Ming", owner: "Jordan Frando", date: `${currentYear}-${currentMonth}-15`, time: "1:00 PM", status: "Completed", visitType: "Scheduled" },
  { id: 4, petName: "Rocky", owner: "Fionah Beltran", date: `${currentYear}-${currentMonth}-16`, time: "3:00 PM", status: "Cancelled", visitType: "Scheduled" },
  { id: 5, petName: "Tobi", owner: "Vanerie Parcon", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Cancelled", visitType: "Scheduled" },
  { id: 6, petName: "Garfield", owner: "Marvin Tomales", date: `${currentYear}-${currentMonth}-18`, time: "11:00 AM", status: "Completed", visitType: "Scheduled" },
  { id: 7, petName: "Tanza", owner: "Clark raguhos", date: `${currentYear}-${currentMonth}-18`, time: "12:00 PM", status: "Completed", visitType: "Scheduled" },
  { id: 8, petName: "Mark", owner: "Lars Bernardez", date: `${currentYear}-${currentMonth}-18`, time: "1:00 PM", status: "Completed", visitType: "Scheduled" },
  { id: 9, petName: "Miguel", owner: "Jerome Bulatao", date: `${currentYear}-${currentMonth}-25`, time: "2:00 PM", status: "Pending", visitType: "Scheduled" },
  { id: 10, petName: "Brownie", owner: "Irick Beltran", date: `${currentYear}-${currentMonth}-25`, time: "3:00 PM", status: "Upcoming", visitType: "Scheduled" },
  { id: 11, petName: "Blackie", owner: "Caiden Levi", date: `${currentYear}-${currentMonth}-25`, time: "4:00 PM", status: "Upcoming", visitType: "Scheduled" },
  { id: 12, petName: "Whamie", owner: "Zyram Beltran", date: `${currentYear}-${currentMonth}-28`, time: "5:00 PM", status: "Upcoming", visitType: "Scheduled" },
];

const sampleVisits = [
  { id: 101, petName: "Miguel", owner: "Emily Sicat", date: `${currentYear}-${currentMonth}-10`, time: "9:30 AM", visitType: "Scheduled", status: "Completed" },
  { id: 102, petName: "Mark", owner: "Jerom Bulatao", date: `${currentYear}-${currentMonth}-11`, time: "2:15 PM", visitType: "Walk-in", status: "Completed" },
  { id: 103, petName: "Jade", owner: "Fionah Irish", date: `${currentYear}-${currentMonth}-12`, time: "11:00 AM", visitType: "Scheduled", status: "Completed" },
  { id: 104, petName: "Vanerie", owner: "Mark Mapili", date: `${currentYear}-${currentMonth}-13`, time: "3:45 PM", visitType: "Walk-in", status: "Completed" },
  { id: 105, petName: "Ashley", owner: "Tadifa", date: `${currentYear}-${currentMonth}-14`, time: "10:30 AM", visitType: "Scheduled", status: "Completed" },
];

const statusColors = {
  Pending: "bg-yellow-300 text-yellow-800",  
  Upcoming: "bg-pink-300 text-pink-800",   
  Completed: "bg-green-300 text-green-800",
  Cancelled: "bg-red-300 text-red-800",
};

const visitTypeColors = {
  Scheduled: "bg-blue-100 text-blue-800 border border-blue-200",
  "Walk-in": "bg-purple-100 text-purple-800 border border-purple-200",
};

const AppointmentsVisits = () => {
  const [activeTab, setActiveTab] = useState("Calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState(sampleAppointments);
  const [visits, setVisits] = useState(sampleVisits);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visitTypeFilter, setVisitTypeFilter] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [selectedVisits, setSelectedVisits] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const navigate = useNavigate();

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === "Appointments" && app.status === "Pending") return false;
    if (activeTab === "Appointments" && statusFilter !== "All" && app.status !== statusFilter)
      return false;
    return (
      app.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredVisits = visits.filter(visit => {
    if (visitTypeFilter !== "All" && visit.visitType !== visitTypeFilter)
      return false;
    return (
      visit.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleViewRequest = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (appointmentId, newStatus) => {
    try {
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { 
          ...app, 
          status: newStatus
        } : app
      ));
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  };

  const handleCancelAppointment = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedAppointments([]);
    setSelectedVisits([]);
  };

  const toggleAppointmentSelection = (appointmentId) => {
    setSelectedAppointments(prev =>
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const toggleVisitSelection = (visitId) => {
    setSelectedVisits(prev =>
      prev.includes(visitId)
        ? prev.filter(id => id !== visitId)
        : [...prev, visitId]
    );
  };

  const toggleSelectAll = () => {
    if (activeTab === "Appointments") {
      if (selectedAppointments.length === filteredAppointments.length && filteredAppointments.length > 0) {
        setSelectedAppointments([]);
      } else {
        setSelectedAppointments(filteredAppointments.map(app => app.id));
      }
    } else if (activeTab === "Visits") {
      if (selectedVisits.length === filteredVisits.length && filteredVisits.length > 0) {
        setSelectedVisits([]);
      } else {
        setSelectedVisits(filteredVisits.map(visit => visit.id));
      }
    }
  };

  const handleSingleDelete = (item) => {
    if (activeTab === "Appointments") {
      setAppointmentToDelete([item]);
      setShowDeleteModal(true);
    } else if (activeTab === "Visits") {
      setVisitToDelete([item]);
      setShowDeleteModal(true);
    }
  };

  const handleBulkDelete = () => {
    if (activeTab === "Appointments" && selectedAppointments.length === 0) return;
    if (activeTab === "Visits" && selectedVisits.length === 0) return;
    
    if (activeTab === "Appointments") {
      const appointmentsToDelete = filteredAppointments.filter(app => 
        selectedAppointments.includes(app.id)
      );
      setAppointmentToDelete(appointmentsToDelete);
      setShowDeleteModal(true);
    } else if (activeTab === "Visits") {
      const visitsToDelete = filteredVisits.filter(visit => 
        selectedVisits.includes(visit.id)
      );
      setVisitToDelete(visitsToDelete);
      setShowDeleteModal(true);
    }
  };

  const handleBulkStatusUpdate = (newStatus) => {
    if (!newStatus || selectedAppointments.length === 0) return;

    if (newStatus === "Cancelled") {
      const appointmentsToCancel = filteredAppointments.filter(app => 
        selectedAppointments.includes(app.id)
      );
      setAppointmentToCancel(appointmentsToCancel);
      setShowCancelModal(true);
      setPendingBulkStatus(newStatus);
    } else {
      updateAppointmentsStatus(newStatus);
    }
  };

  const updateAppointmentsStatus = (newStatus) => {
    setAppointments(prev => prev.map(app => 
      selectedAppointments.includes(app.id) 
        ? { ...app, status: newStatus } 
        : app
    ));

    const message = selectedAppointments.length === 1 
      ? `Appointment status updated to ${newStatus}!`
      : `${selectedAppointments.length} appointments updated to ${newStatus}!`;

    setToast({ type: "success", message });
    setSelectedAppointments([]);
    setIsSelectMode(false);
  };

  const [pendingBulkStatus, setPendingBulkStatus] = useState(null);

  const confirmCancellation = () => {
    if (appointmentToCancel) {
      if (Array.isArray(appointmentToCancel)) {
        // Bulk cancellation
        setAppointments(prev => prev.map(app => 
          selectedAppointments.includes(app.id) 
            ? { ...app, status: "Cancelled" } 
            : app
        ));
        setToast({ type: "success", message: `${appointmentToCancel.length} appointments cancelled successfully!` });
      } else {
        // Single cancellation
        handleUpdateStatus(appointmentToCancel.id, "Cancelled");
        setToast({ type: "success", message: "Appointment cancelled successfully!" });
      }
    }
    setShowCancelModal(false);
    setAppointmentToCancel(null);
    setSelectedAppointments([]);
    setIsSelectMode(false);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      const idsToDelete = Array.isArray(appointmentToDelete) 
        ? appointmentToDelete.map(app => app.id)
        : [appointmentToDelete.id];
      
      setAppointments(prev => prev.filter(app => !idsToDelete.includes(app.id)));
      
      const message = idsToDelete.length === 1 
        ? "Appointment deleted successfully!"
        : `${idsToDelete.length} appointments deleted successfully!`;
      
      setToast({ type: "success", message });
      setSelectedAppointments([]);
      setIsSelectMode(false);
    }
    
    if (visitToDelete) {
      const idsToDelete = Array.isArray(visitToDelete) 
        ? visitToDelete.map(visit => visit.id)
        : [visitToDelete.id];
      
      setVisits(prev => prev.filter(visit => !idsToDelete.includes(visit.id)));
      
      const message = idsToDelete.length === 1 
        ? "Visit deleted successfully!"
        : `${idsToDelete.length} visits deleted successfully!`;
      
      setToast({ type: "success", message });
      setSelectedVisits([]);
      setIsSelectMode(false);
    }
    
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
    setVisitToDelete(null);
  };

  const handleToastClose = () => {
    setToast(null);
  };

  // Filtered Requests
  const filteredRequests = appointments.filter(app => app.status === "Pending");

  const getSelectedCount = () => {
    if (activeTab === "Appointments") return selectedAppointments.length;
    if (activeTab === "Visits") return selectedVisits.length;
    return 0;
  };

  const getFilteredData = () => {
    if (activeTab === "Appointments") return filteredAppointments;
    if (activeTab === "Visits") return filteredVisits;
    return [];
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Calendar":
        return (
          <CalendarTab
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={appointments}
            visits={visits}
          />
        );
      case "Appointments":
        return (
          <AppointmentsTab
            appointments={filteredAppointments}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isSelectMode={isSelectMode}
            selectedAppointments={selectedAppointments}
            navigate={navigate}
            getSelectedCount={getSelectedCount}
            getFilteredData={getFilteredData}
            toggleSelectMode={toggleSelectMode}
            toggleSelectAll={toggleSelectAll}
            toggleAppointmentSelection={toggleAppointmentSelection}
            handleBulkStatusUpdate={handleBulkStatusUpdate}
            handleBulkDelete={handleBulkDelete}
            setSelectedAppointment={setSelectedAppointment}
            setIsDetailsModalOpen={setIsDetailsModalOpen}
            handleSingleDelete={handleSingleDelete}
            handleCancelAppointment={handleCancelAppointment}
            statusColors={statusColors}
          />
        );
      case "Visits":
        return (
          <VisitsTab
            visits={filteredVisits}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            visitTypeFilter={visitTypeFilter}
            setVisitTypeFilter={setVisitTypeFilter}
            isSelectMode={isSelectMode}
            selectedVisits={selectedVisits}
            navigate={navigate}
            getSelectedCount={getSelectedCount}
            getFilteredData={getFilteredData}
            toggleSelectMode={toggleSelectMode}
            toggleSelectAll={toggleSelectAll}
            toggleVisitSelection={toggleVisitSelection}
            handleBulkDelete={handleBulkDelete}
            setSelectedAppointment={setSelectedAppointment}
            setIsDetailsModalOpen={setIsDetailsModalOpen}
            handleSingleDelete={handleSingleDelete}
            visitTypeColors={visitTypeColors}
          />
        );
      case "Requests":
        return (
          <RequestsTab
            filteredRequests={filteredRequests}
            handleViewRequest={handleViewRequest}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FBFBFB] p-6 font-sans">
      <Header title="Appointments & Visits" />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-2 relative">
        {["Calendar", "Visits", "Appointments", "Requests"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2 font-semibold text-sm transition-colors ${
              activeTab === tab
                ? "text-[#5EE6FE]"
                : "text-gray-600 hover:text-[#5EE6FE]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{tab}</span>
              {tab === "Requests" && filteredRequests.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {filteredRequests.length}
                </span>
              )}
            </div>
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#5EE6FE] rounded-t-lg" />
            )}
          </button>
        ))}
      </div>

      {renderActiveTab()}

      {/* Modals */}
      {isModalOpen && selectedAppointment?.status === "Pending" && (
        <AppointmentRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointment={selectedAppointment}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {isDetailsModalOpen && selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          appointment={selectedAppointment}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setAppointmentToDelete(null);
            setVisitToDelete(null);
          }}
          onConfirm={confirmDelete}
          appointments={appointmentToDelete || visitToDelete}
          type={appointmentToDelete ? "appointment" : "visit"}
        />
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <CancelAppointmentModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setAppointmentToCancel(null);
          }}
          onConfirm={confirmCancellation}
          appointment={appointmentToCancel}
        />
      )}

      {/* Success Toast */}
      {toast?.type === "success" && (
        <SuccessToast 
          message={toast.message} 
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};

export default AppointmentsVisits;
