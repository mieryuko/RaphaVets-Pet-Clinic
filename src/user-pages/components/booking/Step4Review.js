import React, { useEffect, useState } from "react";
import { format, addMinutes } from "date-fns";
import api from "../../../api/axios";

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

    console.log("handleSubmit clicked");
  console.log("Selected pet:", selectedPet);
    if (!selectedPet) {
      alert("Please select a pet before confirming.");
      return;
    }

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const endTime = addMinutes(parseTime(selectedTime), 30)
        .toTimeString()
        .slice(0, 8);

      // Log the selected service to debug
      console.log('Selected service:', selectedService);

      const appointmentData = {
        serviceID: selectedService.serviceID || selectedService.id, // Try both possible ID fields
        petID: parseInt(selectedPet.id),
        appointmentDate: formattedDate,
        startTime: selectedTime,
        endTime: endTime
      };

      console.log('Submitting appointment:', appointmentData);

      const res = await api.post('/appointment/book', appointmentData);
      console.log(res);
      if (res.data) {
        console.log('Booking response:', res.data);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Review Your Details</h2>
        <p className="text-gray-500 text-sm">
          Please review all information before confirming your appointment.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 space-y-5">
        {/* SERVICE & DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Service</div>
            <div className="font-semibold text-gray-800">{selectedService?.label || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Date & Time</div>
            <div className="font-semibold text-gray-800">
              {selectedDate
                ? `${format(selectedDate, "MMM d, yyyy")} • ${selectedTime || "—"}`
                : "-"}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* PET INFO */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">🐾 Pet Information</h3>
          {selectedPet ? (
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#E8FBFF] to-[#FDFDFD] border border-[#D6F0F3] rounded-xl p-4">
              <img
                src={selectedPet.image || "/images/dog-profile.png"}
                alt={selectedPet.name}
                className="w-16 h-16 rounded-full border-4 border-[#5EE6FE] object-cover shadow-sm"
              />
              <div>
                <div className="text-lg font-semibold text-gray-800">{selectedPet.name}</div>
                <div className="text-sm text-gray-500">
                  {selectedPet.breed} • {selectedPet.gender} • {selectedPet.age} years old
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No pet selected</div>
          )}
        </div>

        {/* OWNER INFO */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">👤 Owner Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">Owner Name</div>
              <div className="font-semibold text-gray-800">{userData.firstName} {userData.lastName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Contact Number</div>
              <div className="font-semibold text-gray-800">{userData.contactNo}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-400">Email Address</div>
              <div className="font-semibold text-gray-800">{userData.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => goToStep(3)}
          className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-lg bg-[#5EE6FE] text-white font-semibold hover:bg-[#3ecbe0] shadow-sm transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-check"></i> Confirm Appointment
        </button>
      </div>
    </div>
  );
}
