import React, { useState } from "react";
import SuccessToast from "../../../template/SuccessToast";
import ErrorToast from "../../../template/ErrorToast";
import api from "../../../api/axios";

const AppointmentTab = ({ appointments, appointmentFilter, setAppointmentFilter, handleViewDetails, handleCancelAppointment, onAppointmentCancelled }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Time TBD';
    
    if (timeStr.includes('PM') || timeStr.includes('AM')) {
      return timeStr;
    }
    
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatAppointmentDate = (dateString) => {
    try {
      let date;
      
      if (dateString.includes("•")) {
        const [datePart] = dateString.split(" • ");
        date = new Date(datePart);
      } else if (dateString.includes("-")) {
        const [datePart, timePart] = dateString.split(" - ");
        date = new Date(datePart);
        
        if (timePart && !timePart.includes('PM') && !timePart.includes('AM')) {
          const formattedTime = formatTime(timePart);
          return {
            month: date.toLocaleString("default", { month: "short" }),
            day: date.getDate(),
            weekday: date.toLocaleString("default", { weekday: "short" }),
            fullDate: date,
            displayTime: formattedTime
          };
        }
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date)) {
        return null;
      }

      return {
        month: date.toLocaleString("default", { month: "short" }),
        day: date.getDate(),
        weekday: date.toLocaleString("default", { weekday: "short" }),
        fullDate: date
      };
    } catch (error) {
      return null;
    }
  };

  const getTimeFromDateString = (dateString) => {
    if (dateString.includes("•")) {
      return dateString.split(" • ")[1] || "Time TBD";
    } else if (dateString.includes("-")) {
      const timePart = dateString.split(" - ")[1] || "Time TBD";
      return formatTime(timePart);
    }
    return "Time TBD";
  };

  const filteredAppointments = appointments.filter(appt => {
    if (appointmentFilter === "All") return true;
    const status = appt.status?.toLowerCase() || "";
    const filter = appointmentFilter.toLowerCase();
    return status.includes(filter);
  });

  const canCancelAppointment = (appointment) => {
    const status = appointment.status?.toLowerCase() || "";
    return status === 'upcoming' || status === 'pending';
  };

  const isCompletedAppointment = (appointment) => {
    const status = appointment.status?.toLowerCase() || "";
    return status === 'completed';
  };

  const isCancelledAppointment = (appointment) => {
    const status = appointment.status?.toLowerCase() || "";
    return status === 'cancelled';
  };

  const handleCancelClick = (appointment, e) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (selectedAppointment) {
      setIsLoading(true);
      try {
        const response = await api.put(`/appointment/cancel/${selectedAppointment.id}`);
        
        setSuccessMessage(`Appointment for ${selectedAppointment.petName} has been cancelled successfully`);
        setShowSuccessToast(true);
        setShowCancelModal(false);
        setSelectedAppointment(null);
        
        if (typeof onAppointmentCancelled === 'function') {
          onAppointmentCancelled();
        }
        
        if (typeof handleCancelAppointment === 'function') {
          handleCancelAppointment(selectedAppointment);
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        setErrorMessage(error.response?.data?.message || "Failed to cancel appointment");
        setShowErrorToast(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeModal = () => {
    setShowCancelModal(false);
    setSelectedAppointment(null);
  };

  return (
    <>
      <div className="flex flex-col flex-1 gap-3">
        {/* Filter Buttons */}
        <div className="flex gap-1.5 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
          {["Upcoming", "Pending", "Completed", "Cancelled", "All"].map((status) => (
            <button
              key={status}
              onClick={() => setAppointmentFilter(status)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap
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
        <div className="space-y-2 sm:space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <i className="fa-regular fa-calendar text-2xl sm:text-3xl mb-2 opacity-50"></i>
              <p className="text-sm sm:text-base">No {appointmentFilter.toLowerCase()} appointments found</p>
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
                  className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-3 sm:p-4 rounded-lg sm:rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all cursor-pointer"
                  onClick={() => handleViewDetails(appt)}
                >
                  {/* Date */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-stretch justify-between sm:justify-center w-full sm:w-16 text-center bg-[#EFFFFF] rounded-lg py-1 sm:py-2 px-3 sm:px-0 border border-[#5EE6FE]/20 shadow-sm">
                    {formattedDate ? (
                      <div className="flex sm:flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-[#5EE6FE] uppercase">
                          {formattedDate.month}
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                          {formattedDate.day}
                        </span>
                        <span className="hidden sm:block text-[10px] text-gray-500">
                          {formattedDate.weekday}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Invalid Date</span>
                    )}
                  </div>

                  {/* Details*/}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-1 gap-3">
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {appt.petName} — {appt.type}
                      </p>
                      <p className="text-xs text-gray-500 flex flex-wrap items-center gap-1 mt-1">
                        <i className="fa-solid fa-clock text-[#5EE6FE]"></i>
                        <span>{time}</span>
                        <span className="mx-1">•</span>
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
                          <i className="fa-solid fa-user text-[#5EE6FE] mr-1"></i>
                          {appt.ownerName}
                        </p>
                      )}
                    </div>
                    
                    {/* Action Buttons*/}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(appt);
                        }}
                        className="bg-[#5EE6FE] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold hover:bg-[#3ecbe0] transition-all whitespace-nowrap flex-1 sm:flex-none"
                      >
                        View Details
                      </button>
                      
                      {canCancel && (
                        <button
                          onClick={(e) => handleCancelClick(appt, e)}
                          className="bg-[#FFB6C1] text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold hover:bg-[#FFA0B0] transition-all whitespace-nowrap border border-[#FFA0B0] flex-1 sm:flex-none"
                        >
                          Cancel
                        </button>
                      )}

                      {(isCompleted || isCancelled) && (
                        <div className="bg-gray-300 text-gray-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 whitespace-nowrap flex-1 sm:flex-none">
                          <i className={`fa-solid ${isCompleted ? 'fa-check' : 'fa-trash'}`}></i>
                          <span className="hidden xs:inline">{isCompleted ? 'Completed' : 'Cancelled'}</span>
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

      {/* Cancel Confirmation Modal*/}
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
                disabled={isLoading}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep
              </button>
              <button
                onClick={confirmCancellation}
                disabled={isLoading}
                className="flex-1 bg-[#FFB6C1] text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFA0B0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Cancelling..." : "Cancel"}
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

      {/* Error Toast */}
      {showErrorToast && (
        <ErrorToast 
          message={errorMessage}
          duration={3000}
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </>
  );
};

export default AppointmentTab;