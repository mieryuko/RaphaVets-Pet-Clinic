import { useState } from "react";
import { format, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import Header from "../template/Header";
import { PlusCircle, Edit2, Trash2, Eye, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppointmentRequestModal from "../components/appointments/AppointmentRequestModal";
import AppointmentDetailsModal from "../components/appointments/AppointmentDetailsModal";
import DeleteConfirmationModal from "../components/appointments/DeleteConfirmationModal";
import CancelAppointmentModal from "../components/appointments/CancelAppointmentModal";
import SuccessToast from "../../template/SuccessToast";

const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

const sampleAppointments = [
  { id: 1, petName: "Bogart", owner: "Mark Mapili", date: `${currentYear}-${currentMonth}-10`, time: "9:00 AM", status: "Completed" },
  { id: 2, petName: "Tan tan", owner: "Miguel Rojero", date: `${currentYear}-${currentMonth}-12`, time: "11:30 AM", status: "Pending" },
  { id: 3, petName: "Ming", owner: "Jordan Frando", date: `${currentYear}-${currentMonth}-15`, time: "1:00 PM", status: "Upcoming" },
  { id: 4, petName: "Rocky", owner: "Anna Cruz", date: `${currentYear}-${currentMonth}-16`, time: "3:00 PM", status: "Pending" },
  { id: 5, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Completed" },
  { id: 6, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending" },
  { id: 7, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending" },
  { id: 8, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending" },
  { id: 9, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Completed" },
  { id: 10, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending" },
  { id: 11, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Upcoming" },
  { id: 12, petName: "Snow", owner: "Ella Santos", date: `${currentYear}-${currentMonth}-18`, time: "10:00 AM", status: "Pending" },
];

const statusColors = {
  Pending: "bg-yellow-300 text-yellow-800",  
  Upcoming: "bg-pink-300 text-pink-800",   
  Completed: "bg-green-300 text-green-800",
  Cancelled: "bg-red-300 text-red-800",
};

const Appointments = () => {
  const [activeTab, setActiveTab] = useState("Calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState(sampleAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
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

  const handleViewRequest = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (appointmentId, newStatus, cancelReason = "") => {
    try {
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { 
          ...app, 
          status: newStatus,
          ...(cancelReason && { cancelReason })
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
  };

  const toggleAppointmentSelection = (appointmentId) => {
    setSelectedAppointments(prev =>
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAppointments.length === filteredAppointments.length && filteredAppointments.length > 0) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(filteredAppointments.map(app => app.id));
    }
  };

  const handleSingleDelete = (appointment) => {
    setAppointmentToDelete([appointment]);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedAppointments.length === 0) return;
    
    const appointmentsToDelete = filteredAppointments.filter(app => 
      selectedAppointments.includes(app.id)
    );
    setAppointmentToDelete(appointmentsToDelete);
    setShowDeleteModal(true);
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

  const updateAppointmentsStatus = (newStatus, cancelReasons = {}) => {
    setAppointments(prev => prev.map(app => 
      selectedAppointments.includes(app.id) 
        ? { 
            ...app, 
            status: newStatus,
            ...(cancelReasons[app.id] && { cancelReason: cancelReasons[app.id] })
          } 
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

  const confirmCancellation = (cancelReason) => {
    if (appointmentToCancel) {
      if (Array.isArray(appointmentToCancel)) {
        // Bulk cancellation
        const cancelReasons = {};
        appointmentToCancel.forEach(app => {
          cancelReasons[app.id] = cancelReason;
        });
        updateAppointmentsStatus("Cancelled", cancelReasons);
      } else {
        // Single cancellation
        handleUpdateStatus(appointmentToCancel.id, "Cancelled", cancelReason);
        setToast({ type: "success", message: "Appointment cancelled successfully!" });
      }
    }
    setShowCancelModal(false);
    setAppointmentToCancel(null);
    setPendingBulkStatus(null);
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
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
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
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const hasManyAppointments = dayApps.length >= 4;

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
                        {dayApps.slice(0, hasManyAppointments ? 6 : 4).map((a, idx) => (
                          <span
                            key={idx}
                            className={`rounded-full border border-white shadow-sm ${
                              hasManyAppointments 
                                ? "h-2 w-2"  // Smaller dots for 4+ appointments
                                : "h-3 w-3"  // Normal size for 1-3 appointments
                            } ${statusColors[a.status]}`}
                            title={`${a.petName} - ${a.status}`}
                          />
                        ))}
                        {hasManyAppointments && dayApps.length > 6 && (
                          <span 
                            className="h-2 w-2 bg-gray-400 rounded-full border border-white"
                            title={`+${dayApps.length - 6} more appointments`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - remains the same */}
          <div className="w-2/5 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-[#F9FEFF] to-[#EAFBFF] rounded-3xl p-5 shadow-md border border-[#E1F8FF] flex flex-col gap-4 h-full">
              <h3 className="font-semibold text-base text-gray-700">
                Appointments on {format(selectedDate, "MMMM d, yyyy")}
              </h3>

              <div className="flex flex-col gap-3 overflow-y-auto">
                {dayAppointments.length === 0 ? (
                  <p className="text-gray-400 text-center mt-4 text-sm">
                    No appointments for this day.
                  </p>
                ) : (
                  dayAppointments.map(a => (
                    <div
                      key={a.id}
                      className="p-4 rounded-2xl bg-white shadow-sm border border-[#E6F7FA] hover:shadow-md transition-transform transform hover:scale-[1.02] flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-700 text-sm">{a.petName}</p>
                        <p className="text-gray-500 text-xs">Owner: {a.owner}</p>
                        <p className="text-gray-400 text-xs mt-1">{a.time}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Appointments" && (
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
              <button
                onClick={() => navigate("/admin-pages/appointments/add")}
                className="flex flex-row gap-2 px-4 py-2 bg-[#5EE6FE] text-white rounded-xl hover:bg-[#4AD4EC] transition"
              >
                <Plus size={18} />
                Appointment
              </button>
            </div>

            {/* Selection Controls */}
            <div className="flex gap-2 items-center">
              {isSelectMode ? (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedAppointments.length} selected
                  </span>
                  
                  {/* Bulk Status Update Dropdown */}
                  {selectedAppointments.length > 0 && (
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
                  {selectedAppointments.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium text-sm"
                    >
                      Delete Selected ({selectedAppointments.length})
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
                      checked={selectedAppointments.length === filteredAppointments.length && filteredAppointments.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">ID</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Pet</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Owner</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Date</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Time</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Status</th>
                <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={isSelectMode ? 8 : 7} className="text-center p-4 text-gray-400">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const isEditable = app.status === "Upcoming" || app.status === "Pending";
                  
                  return (
                    <tr
                      key={app.id}
                      className="cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition"
                    >
                      {isSelectMode && (
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.includes(app.id)}
                            onChange={() => toggleAppointmentSelection(app.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="p-2 text-sm">{app.id}</td>
                      <td className="p-2 text-sm">{app.petName}</td>
                      <td className="p-2 text-sm">{app.owner}</td>
                      <td className="p-2 text-sm">{app.date}</td>
                      <td className="p-2 text-sm">{app.time}</td>
                      <td className="p-2 text-sm">
                        {isEditable ? (
                          <select
                            value={app.status}
                            onChange={(e) => {
                              if (e.target.value === "Cancelled") {
                                handleCancelAppointment(app);
                              } else {
                                const updatedAppointments = appointments.map(a =>
                                  a.id === app.id ? { ...a, status: e.target.value } : a
                                );
                                setAppointments(updatedAppointments);
                              }
                            }}
                            className={`p-1 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 ${
                              app.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : app.status === "Upcoming"
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
                              app.status === "Completed"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {app.status}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-sm flex gap-2">
                        <Eye
                          size={18}
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedAppointment(app);
                            setIsDetailsModalOpen(true);
                          }}
                        />
                        <Trash2
                          size={18}
                          className="text-red-500 cursor-pointer hover:text-red-600"
                          onClick={() => handleSingleDelete(app)}
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
          }}
          onConfirm={confirmDelete}
          appointments={appointmentToDelete}
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

export default Appointments;