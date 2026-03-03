import React from "react";
import { format } from "date-fns";

export default function AppointmentSummary({
  step,
  selectedService,
  selectedDate,
  selectedTime,
  selectedPet,
  ownerInfo
}) {
  
  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return "—";
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Appointment Summary</div>

      <div className="space-y-2 sm:space-y-3">
        {/* SERVICE */}
        <div>
          <div className="text-[10px] sm:text-xs text-gray-400">Service</div>
          <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">
            {selectedService?.label || "-"}
          </div>
        </div>

        {/* DATE & TIME */}
        <div>
          <div className="text-[10px] sm:text-xs text-gray-400">Date & Time</div>
          <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">
            {selectedDate
              ? `${format(selectedDate, "MMM d, yyyy")} • ${selectedTime ? formatTimeForDisplay(selectedTime) : "—"}`
              : "-"}
          </div>
        </div>

        {/* PET DETAILS */}
        {selectedPet && (
          <div className="pt-2 sm:pt-3 border-t border-gray-100">
            <div className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-2">Pet Details</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={`http://localhost:5000${selectedPet.image}`}
                alt={selectedPet.name}
                onError={(e) => {
                          e.target.src = "/images/dog-profile.png";
                        }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#5EE6FE] object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{selectedPet.name}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {selectedPet.breed} • {selectedPet.gender || "-"} • {selectedPet.age || "-"} years old
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OWNER INFO */}
        {ownerInfo && (
          <div className="pt-2 sm:pt-3 border-t border-gray-100">
            <div className="text-[10px] sm:text-xs text-gray-400 mb-1">Owner Information</div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                {ownerInfo.firstName} {ownerInfo.lastName}
              </div>
              <div className="text-gray-600 text-[10px] sm:text-xs">
                <span className="block truncate">📞 {ownerInfo.contactNo || "-"}</span>
                <span className="block truncate">📧 {ownerInfo.email || "-"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}