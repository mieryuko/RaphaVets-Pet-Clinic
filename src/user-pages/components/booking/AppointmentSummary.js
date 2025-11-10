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
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-sm text-gray-500">Appointment Summary</div>

      <div className="mt-3 space-y-3">
        {/* SERVICE */}
        <div>
          <div className="text-xs text-gray-400">Service</div>
          <div className="font-semibold">{selectedService?.label || "-"}</div>
        </div>

        {/* DATE & TIME */}
        <div>
          <div className="text-xs text-gray-400">Date & Time</div>
          <div className="font-semibold">
            {selectedDate
              ? `${format(selectedDate, "MMM d, yyyy")} • ${selectedTime || "—"}`
              : "-"}
          </div>
        </div>

        {/* PET DETAILS */}
        {selectedPet && (
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2">Pet Details</div>
            <div className="flex items-center gap-3">
              <img
                src={selectedPet.image || "/images/dog-profile.png"}
                alt={selectedPet.name}
                className="w-10 h-10 rounded-full border border-[#5EE6FE] object-cover"
              />
              <div>
                <div className="font-semibold text-gray-800 text-sm">{selectedPet.name}</div>
                <div className="text-xs text-gray-500">
                  {selectedPet.breed} • {selectedPet.gender || "-"} • {selectedPet.age || "-"} years old
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OWNER INFO */}
        {ownerInfo && (
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Owner Information</div>
            <div className="space-y-1 text-sm">
              <div className="font-semibold text-gray-800">
                {ownerInfo.firstName} {ownerInfo.lastName}
              </div>
              <div className="text-gray-600 text-xs">
                📞 {ownerInfo.contactNo || "-"}
                <br />
                📧 {ownerInfo.email || "-"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
