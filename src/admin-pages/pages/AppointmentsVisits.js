import { useState } from "react";
import { format, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import Header from "../template/Header";
import { PlusCircle, Edit2, Trash2, Eye, Search, Plus, Calendar, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppointmentRequestModal from "../components/appointments/AppointmentRequestModal";
import AppointmentDetailsModal from "../components/appointments/AppointmentDetailsModal";
import DeleteConfirmationModal from "../components/appointments/DeleteConfirmationModal";
import CancelAppointmentModal from "../components/appointments/CancelAppointmentModal";
import SuccessToast from "../../template/SuccessToast";

const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

const sampleAppointments = [
  { id: 1, petName: "Bogart", owner: "Mark Mapili", date: `${currentYear}-${currentMonth}-10`, time: "9:00 AM", status: "Completed", visitType: "Scheduled" },
  { id: 2, petName: "Tan tan", owner: "Miguel Rojero", date: `${currentYear}-${currentMonth}-12`, time: "11:30 AM", status: "Pending", visitType: "Scheduled" },
  { id: 3, petName: "Ming", owner: "Jordan Frando", date: `${currentYear}-${currentMonth}-15`, time: "1:00 PM", status: "Upcoming", visitType: "Scheduled" },
  { id: 4, petName: "Rocky", owner: "Anna Cruz", date: `${currentYear}-${currentMonth}-16`, time: "3:00 PM", status: "Pending", visitType: "Scheduled" },
  { id: 5, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Completed", visitType: "Scheduled" },
  { id: 6, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending", visitType: "Scheduled" },
  { id: 7, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending", visitType: "Scheduled" },
  { id: 8, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending", visitType: "Scheduled" },
  { id: 9, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Completed", visitType: "Scheduled" },
  { id: 10, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending", visitType: "Scheduled" },
  { id: 11, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Upcoming", visitType: "Scheduled" },
  { id: 12, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending", visitType: "Scheduled" },
];

// Add sample visits data
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

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDayOfWeek = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  const daysInMonth = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysInMonth.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysInMonth.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const dayAppointments = appointments.filter(a => isSameDay(parseISO(a.date), selectedDate));
  const dayVisits = visits.filter(v => isSameDay(parseISO(v.date), selectedDate));

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

      {activeTab === "Calendar" && (
        <div className="flex gap-6 h-[calc(100%-130px)]">
          {/* Calendar Panel */}
          <div className="w-3/5 flex flex-col">
            <div className="bg-[#F4F7F8] rounded-3xl shadow-md p-5 flex flex-col gap-2 h-full border border-[#E8F7FA]">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-semibold text-gray-700">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="px-3 py-1 rounded-lg bg-[#E6FCFF] hover:bg-[#D8F9FF] text-gray-700 transition"
                  >
                    Prev
                  </button>
                  <button
                    onClick={nextMonth}
                    className="px-3 py-1 rounded-lg bg-[#E6FCFF] hover:bg-[#D8F9FF] text-gray-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 text-center font-medium text-xs text-gray-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2 flex-1">
                {daysInMonth.map((day, index) => {
                  if (!day) {
                    // Empty cell for alignment
                    return <div key={`empty-${index}`} />;
                  }

                  const dayApps = appointments.filter(a => isSameDay(parseISO(a.date), day));
                  const dayVisits = visits.filter(v => isSameDay(parseISO(v.date), day));
                  const totalEvents = [...dayApps, ...dayVisits];
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const hasManyEvents = totalEvents.length >= 4;

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`relative flex flex-col items-center justify-start min-h-[55px] p-2 cursor-pointer transition-all rounded-xl border
                        ${
                          isSelected
                            ? "bg-[#DDF9FF] border-[#5EE6FE] shadow-lg"
                            : isToday
                            ? "border-[#C7F5FF] bg-[#F9FEFF]"
                            : "border-transparent hover:border-[#DFF9FF]"
                        }
                      `}
                    >
                      <span className="text-[12px] font-medium text-gray-700">
                        {format(day, "d")}
                      </span>
                      <div className="flex flex-wrap justify-center mt-1 gap-1 w-full">
                        {totalEvents.slice(0, hasManyEvents ? 6 : 4).map((event, idx) => (
                          <span
                            key={idx}
                            className={`rounded-full border border-white shadow-sm ${
                              hasManyEvents 
                                ? "h-2 w-2"  // Smaller dots for 4+ events
                                : "h-3 w-3"  // Normal size for 1-3 events
                            } ${
                              'status' in event ? statusColors[event.status] : 
                              'visitType' in event ? visitTypeColors[event.visitType] : 
                              'bg-gray-400'
                            }`}
                            title={`${event.petName} - ${'status' in event ? event.status : event.visitType}`}
                          />
                        ))}
                        {hasManyEvents && totalEvents.length > 6 && (
                          <span 
                            className="h-2 w-2 bg-gray-400 rounded-full border border-white"
                            title={`+${totalEvents.length - 6} more events`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-2/5 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-[#F9FEFF] to-[#EAFBFF] rounded-3xl p-5 shadow-md border border-[#E1F8FF] flex flex-col gap-4 h-full">
              <h3 className="font-semibold text-base text-gray-700">
                Events on {format(selectedDate, "MMMM d, yyyy")}
              </h3>

              <div className="flex flex-col gap-3 overflow-y-auto">
                {dayAppointments.length === 0 && dayVisits.length === 0 ? (
                  <p className="text-gray-400 text-center mt-4 text-sm">
                    No events for this day.
                  </p>
                ) : (
                  <>
                    {dayAppointments.map(a => (
                      <div
                        key={a.id}
                        className="p-4 rounded-2xl bg-white shadow-sm border border-[#E6F7FA] hover:shadow-md transition-transform transform hover:scale-[1.02] flex justify-between items-center"
                      >
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-700 text-sm">{a.petName}</p>
                          <p className="text-gray-500 text-xs">Owner: {a.owner}</p>
                          <p className="text-gray-400 text-xs mt-1">{a.time} (Appointment)</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[a.status]}`}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                    {dayVisits.map(v => (
                      <div
                        key={v.id}
                        className="p-4 rounded-2xl bg-white shadow-sm border border-[#E6F7FA] hover:shadow-md transition-transform transform hover:scale-[1.02] flex justify-between items-center"
                      >
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-700 text-sm">{v.petName}</p>
                          <p className="text-gray-500 text-xs">Owner: {v.owner}</p>
                          <p className="text-gray-400 text-xs mt-1">{v.time} (Visit)</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${visitTypeColors[v.visitType]}`}
                        >
                          {v.visitType}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "Appointments" || activeTab === "Visits") && (
        <div className="mt-">
          {/* Search & Filter with New Select Controls */}
          <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
            <div className="flex gap-2 items-center">
              {/* Search Bar */}
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search pets or owners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
                />
              </div>

              {/* Status Filter for Appointments */}
              {activeTab === "Appointments" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 w-36 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
                >
                  <option value="All">All Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              )}

              {/* Visit Type Filter for Visits */}
              {activeTab === "Visits" && (
                <select
                  value={visitTypeFilter}
                  onChange={(e) => setVisitTypeFilter(e.target.value)}
                  className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 w-36 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
                >
                  <option value="All">All Types</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              )}

              {/* Add Button */}
              {activeTab === "Appointments" && (
    <button
      onClick={() => navigate("/admin-pages/appointments/add")}
      className="flex items-center gap-2 px-4 py-2 bg-[#5EE6FE] text-white rounded-xl hover:bg-[#4AD4EC] transition font-medium"
    >
      <Plus className="h-4 w-4" />
      Appointment
    </button>
  )}

  {/* Add Visit Button */}
  {activeTab === "Visits" && (
    <button
      onClick={() => navigate("/admin-pages/visits/add")}
      className="flex items-center gap-2 px-4 py-2 bg-[#5EE6FE] text-white rounded-xl hover:bg-[#4AD4EC] transition font-medium"
    >
      <Plus className="h-4 w-4" />
      Visit
    </button>
  )}
            </div>

            {/* Selection Controls */}
            <div className="flex gap-2 items-center">
              {isSelectMode ? (
                <>
                  <span className="text-sm text-gray-600">
                    {getSelectedCount()} selected
                  </span>
                  
                  {/* Bulk Status Update Dropdown for Appointments */}
                  {activeTab === "Appointments" && selectedAppointments.length > 0 && (
                    <div className="relative">
                      <select
                        onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                        className="px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                      >
                        <option value="">Update Status</option>
                        <option value="Upcoming">Mark as Upcoming</option>
                        <option value="Completed">Mark as Completed</option>
                        <option value="Cancelled">Mark as Cancelled</option>
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Bulk Delete Button */}
                  {getSelectedCount() > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium text-sm"
                    >
                      Delete Selected ({getSelectedCount()})
                    </button>
                  )}
                  
                  <button
                    onClick={toggleSelectMode}
                    className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleSelectMode}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium text-sm"
                >
                  Select
                </button>
              )}
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-[#1B1B1B] sticky top-0">
              <tr>
                {isSelectMode && (
                  <th className="p-2 text-sm text-gray-600 dark:text-gray-300 w-12">
                    <input
                      type="checkbox"
                      checked={getSelectedCount() === getFilteredData().length && getFilteredData().length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">ID</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Pet</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Owner</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Date</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">
                  {activeTab === "Appointments" ? "Scheduled Time" : "Visit Time"}
                </th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">
                  {activeTab === "Appointments" ? "Status" : "Visit Type"}
                </th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredData().length === 0 ? (
                <tr>
                  <td colSpan={isSelectMode ? 8 : 7} className="text-center p-4 text-gray-400">
                    No {activeTab.toLowerCase()} found.
                  </td>
                </tr>
              ) : (
                getFilteredData().map((item) => {
                  const isAppointment = activeTab === "Appointments";
                  const isEditable = isAppointment && (item.status === "Upcoming" || item.status === "Pending");
                  
                  return (
                    <tr
                      key={item.id}
                      className="cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition"
                    >
                      {isSelectMode && (
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={
                              isAppointment 
                                ? selectedAppointments.includes(item.id)
                                : selectedVisits.includes(item.id)
                            }
                            onChange={() => {
                              if (isAppointment) {
                                toggleAppointmentSelection(item.id);
                              } else {
                                toggleVisitSelection(item.id);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="p-2 text-sm">{item.id}</td>
                      <td className="p-2 text-sm">{item.petName}</td>
                      <td className="p-2 text-sm">{item.owner}</td>
                      <td className="p-2 text-sm">{item.date}</td>
                      <td className="p-2 text-sm">{item.time}</td>
                      <td className="p-2 text-sm">
                        {isAppointment ? (
                          isEditable ? (
                            <select
                              value={item.status}
                              onChange={(e) => {
                                if (e.target.value === "Cancelled") {
                                  handleCancelAppointment(item);
                                } else {
                                  const updatedAppointments = appointments.map(a =>
                                    a.id === item.id ? { ...a, status: e.target.value } : a
                                  );
                                  setAppointments(updatedAppointments);
                                }
                              }}
                              className={`p-1 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 ${
                                item.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item.status === "Upcoming"
                                  ? "bg-pink-100 text-pink-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              <option value="Upcoming">Upcoming</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === "Completed"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {item.status}
                            </span>
                          )
                        ) : (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${visitTypeColors[item.visitType]}`}
                          >
                            {item.visitType}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-sm flex gap-2">
                        <Eye
                          size={18}
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedAppointment(item);
                            setIsDetailsModalOpen(true);
                          }}
                        />
                        <Trash2
                          size={18}
                          className="text-red-500 cursor-pointer hover:text-red-600"
                          onClick={() => handleSingleDelete(item)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "Requests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pr-2 pb-2 overflow-y-auto">
          {filteredRequests.length === 0 ? (
            <p className="text-gray-400 text-center col-span-2">No pending requests.</p>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md flex flex-col gap-2 border border-[#E6F7FA]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{req.petName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Owner: {req.owner}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">{req.date} • {req.time}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 shadow-sm">
                    Pending
                  </span>
                </div>

                <button
                  onClick={() => handleViewRequest(req)}
                  className="mt-2 py-1 rounded-xl bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition"
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      )}

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