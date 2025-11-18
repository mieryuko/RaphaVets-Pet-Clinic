import React, { useState } from "react";
import SuccessToast from "../../../template/SuccessToast";

const AppointmentTab = ({ appointments, appointmentFilter, setAppointmentFilter, handleViewDetails, handleCancelAppointment }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Time TBD';
    
    // Handle both "12:00:00" and "12:00 PM" formats
    if (timeStr.includes('PM') || timeStr.includes('AM')) {
      return timeStr; // Already formatted
    }
    
    // Format "12:00:00" to "12:00 PM"
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatAppointmentDate = (dateString) => {
    try {
      // Handle different date formats that might come from your API
      let date;
      
      if (dateString.includes("•")) {
        // Format: "Nov 22, 2025 • 12:00 PM"
        const [datePart] = dateString.split(" • ");
        date = new Date(datePart);
      } else if (dateString.includes("-")) {
        // Format: "2025-11-22 - 12:00:00"
        const [datePart, timePart] = dateString.split(" - ");
        date = new Date(datePart);
        
        // Format the time part if it's in "12:00:00" format
        if (timePart && !timePart.includes('PM') && !timePart.includes('AM')) {
          const formattedTime = formatTime(timePart);
          return {
            month: date.toLocaleString("default", { month: "short" }),
            day: date.getDate(),
            weekday: date.toLocaleString("default", { weekday: "long" }),
            fullDate: date,
            displayTime: formattedTime
          };
        }
      } else {
        // Assume it's already a proper date string
        date = new Date(dateString);
      }

      if (isNaN(date)) {
        console.warn("Invalid date:", dateString);
        return null;
      }

      return {
        month: date.toLocaleString("default", { month: "short" }),
        day: date.getDate(),
        weekday: date.toLocaleString("default", { weekday: "long" }),
        fullDate: date
      };
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Extract time from date string
  const getTimeFromDateString = (dateString) => {
    if (dateString.includes("•")) {
      return dateString.split(" • ")[1] || "Time TBD";
    } else if (dateString.includes("-")) {
      const timePart = dateString.split(" - ")[1] || "Time TBD";
      // Format the time if it's in "12:00:00" format
      return formatTime(timePart);
    }
    return "Time TBD";
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(appt => {
    if (appointmentFilter === "All") return true;
    
    const status = appt.status?.toLowerCase() || "";
    const filter = appointmentFilter.toLowerCase();
    return status.includes(filter);
  });

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    const status = appointment.status?.toLowerCase() || "";
    return status === 'upcoming' || status === 'pending';
  };

  // Check if appointment is completed
  const isCompletedAppointment = (appointment) => {
    const status = appointment.status?.toLowerCase() || "";
    return status === 'completed';
  };

  // Check if appointment is cancelled
  const isCancelledAppointment = (appointment) => {
    const status = appointment.status?.toLowerCase() || "";
    return status === 'cancelled';
  };

  // Handle cancel button click
  const handleCancelClick = (appointment, e) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  // Confirm cancellation - goes directly to success toast
  const confirmCancellation = () => {
    if (selectedAppointment) {
      // Directly show success toast without backend call
      setSuccessMessage(`Appointment for ${selectedAppointment.petName} has been cancelled successfully`);
      setShowSuccessToast(true);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      
      // Optional: If you want to call the parent function for any additional logic
      if (typeof handleCancelAppointment === 'function') {
        handleCancelAppointment(selectedAppointment);
      }
    }
  };

  // Close modal
  const closeModal = () => {
    setShowCancelModal(false);
    setSelectedAppointment(null);
  };

  return (
    <>
      <div className="flex flex-col flex-1 gap-3">
        {/* Filter Buttons */}
        <div className="flex gap-3 mb-3 flex-wrap">
          {["Upcoming", "Pending", "Completed", "Cancelled", "All"].map((status) => (
            <button
              key={status}
              onClick={() => setAppointmentFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition 
                ${appointmentFilter === status
                  ? "bg-[#5EE6FE] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-[#d3f2fa]"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-regular fa-calendar text-3xl mb-2 opacity-50"></i>
              <p>No {appointmentFilter.toLowerCase()} appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const formattedDate = formatAppointmentDate(appt.date);
              const time = getTimeFromDateString(appt.date);
              const canCancel = canCancelAppointment(appt);
              const isCompleted = isCompletedAppointment(appt);
              const isCancelled = isCancelledAppointment(appt);

              return (
                <div
                  key={appt.id}
                  className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-4 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all cursor-pointer"
                  onClick={() => handleViewDetails(appt)}
                >
                  {/* LEFT: DATE */}
                  <div className="flex flex-col items-center justify-center w-16 text-center bg-[#EFFFFF] rounded-lg py-2 border border-[#5EE6FE]/20 shadow-sm">
                    {formattedDate ? (
                      <>
                        <span className="text-xs font-semibold text-[#5EE6FE] uppercase tracking-wide">
                          {formattedDate.month}
                        </span>
                        <span className="text-xl font-bold text-gray-800 leading-tight">
                          {formattedDate.day}
                        </span>
                        <span className="text-[10px] text-gray-500 capitalize">
                          {formattedDate.weekday}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">Invalid Date</span>
                    )}
                  </div>

                  {/* RIGHT: DETAILS */}
                  <div className="flex justify-between items-center flex-1 ml-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {appt.petName} — {appt.type}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <i className="fa-solid fa-clock text-[#5EE6FE]"></i>
                        {time} &nbsp;•&nbsp; 
                        <span className={`font-medium ${
                          appt.status === 'Upcoming' ? 'text-green-600' :
                          appt.status === 'Pending' ? 'text-yellow-600' :
                          appt.status === 'Completed' ? 'text-blue-600' :
                          appt.status === 'Cancelled' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {appt.status || "Upcoming"}
                        </span>
                      </p>
                      {appt.ownerName && (
                        <p className="text-xs text-gray-400 mt-1">
                          <i className="fa-solid fa-user text-[#5EE6FE]"></i>
                          {appt.ownerName}
                        </p>
                      )}
                    </div>
                    
                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                      {/* View Details Button - Always visible */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the card click
                          handleViewDetails(appt);
                        }}
                        className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#3ecbe0] transition-all whitespace-nowrap"
                      >
                        View Details
                      </button>
                      
                      {/* Cancel Button - Only for upcoming/pending appointments */}
                      {canCancel && (
                        <button
                          onClick={(e) => handleCancelClick(appt, e)}
                          className="bg-[#FFB6C1] text-gray-800 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#FFA0B0] transition-all whitespace-nowrap border border-[#FFA0B0]"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Completed Status - Non-clickable with delete icon */}
                      {isCompleted && (
                        <div className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-not-allowed">
                          <i className="fa-solid fa-check"></i>
                          Completed
                        </div>
                      )}

                      {/* Cancelled Status - Non-clickable with delete icon */}
                      {isCancelled && (
                        <div className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-not-allowed">
                          <i className="fa-solid fa-trash"></i>
                          Cancelled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal - Smaller Version */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-xs w-full mx-auto shadow-xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#FFB6C1] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-exclamation text-white text-lg"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel appointment for{" "}
                <span className="font-semibold text-gray-800">
                  {selectedAppointment.petName}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
              >
                Keep
              </button>
              <button
                onClick={confirmCancellation}
                className="flex-1 bg-[#FFB6C1] text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFA0B0] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <SuccessToast 
          message={successMessage}
          duration={3000}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  );
};

export default AppointmentTab;