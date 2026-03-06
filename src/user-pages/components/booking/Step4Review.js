import React, { useEffect, useState } from "react";
import { format, addMinutes } from "date-fns";
import api from "../../../api/axios";
import { buildMediaUrl } from "../../../utils/runtimeUrls";

export default function Step4Review({ 
  selectedService, 
  selectedDate, 
  selectedTime,
  selectedPet,
  handleConfirm, 
  goToStep 
}) {

  const [userData, setUserData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      contactNo: "",
    });
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

    useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch user profile:", err);
      }
    };

    if (userId && token) fetchUserProfile();
  }, [userId, token]);

  const handleSubmit = async () => {

    if (!selectedPet) {
      alert("Please select a pet before confirming.");
      return;
    }

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const endTime = addMinutes(parseTime(selectedTime), 30)
        .toTimeString()
        .slice(0, 8);

      const appointmentData = {
        serviceID: selectedService.serviceID || selectedService.id,
        petID: parseInt(selectedPet.id),
        appointmentDate: formattedDate,
        startTime: selectedTime,
        endTime: endTime
      };

      const res = await api.post('/appointment/book', appointmentData);
      if (res.data) {
        handleConfirm(res.data.appointmentId);
      }
    } catch (err) {
      console.error('Booking Error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date;
  };

  const formatPetAge = (ageValue) => {
    const raw = String(ageValue || "").trim();
    if (!raw) return "Unknown age";
    if (/(day|week|month|yr|year)/i.test(raw)) return raw;
    return `${raw} yrs old`;
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Review Your Details</h2>
        <p className="text-gray-500 text-xs sm:text-sm">
          Please review all information before confirming your appointment.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
        {/* SERVICE & DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-400">Service</div>
            <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">{selectedService?.label || "-"}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-400">Date & Time</div>
            <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">
              {selectedDate
                ? `${format(selectedDate, "MMM d, yyyy")} • ${selectedTime ? formatTimeForDisplay(selectedTime) : "—"}`
                : "-"}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* PET INFO */}
        <div>
          <h3 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-3">🐾 Pet Information</h3>
          {selectedPet ? (
            <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-[#E8FBFF] to-[#FDFDFD] border border-[#D6F0F3] rounded-lg sm:rounded-xl p-3 sm:p-4">
              <img
                src={buildMediaUrl(selectedPet.image)}
                alt={selectedPet.name}
                onError={(e) => {
                          e.target.src = "/images/dog-profile.png";
                        }}
                className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-full border-4 border-[#5EE6FE] object-cover shadow-sm flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-base sm:text-lg font-semibold text-gray-800 truncate">{selectedPet.name}</div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">
                  {selectedPet.breed} • {selectedPet.gender} • {formatPetAge(selectedPet.age)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No pet selected</div>
          )}
        </div>

        {/* OWNER INFO */}
        <div>
          <h3 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-3">👤 Owner Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-[10px] sm:text-xs text-gray-400">Owner Name</div>
              <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                {userData.firstName} {userData.lastName}
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-gray-400">Contact Number</div>
              <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                {userData.contactNo || "N/A"}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-[10px] sm:text-xs text-gray-400">Email Address</div>
              <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                {userData.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3">
        <button
          onClick={() => goToStep(3)}
          className="w-full xs:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-sm sm:text-base"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="w-full xs:w-auto px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-[#5EE6FE] text-white font-semibold hover:bg-[#3ecbe0] shadow-sm transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <i className="fa-solid fa-check text-xs sm:text-sm"></i>
          <span>Confirm Appointment</span>
        </button>
      </div>
    </div>
  );
}

function formatTimeForDisplay(timeStr) {
  if (!timeStr) return "—";
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}