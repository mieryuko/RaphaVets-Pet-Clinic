import React, { useState, useEffect } from "react";
import api from "../../../api/axios";

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    appointments: false,
    health: false,
    promotions: false,
    clinicNews: false,
  });

  const userId = localStorage.getItem("userId"); // or however you store it
  const token = localStorage.getItem("token");

  // Fetch preferences from backend
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await api.get(`/users/${userId}/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map backend fields to frontend keys, with defaults
        setNotifications({
          appointments: res.data.appointmentReminders === 1,
          health: res.data.petHealthUpd === 1,
          promotions: res.data.promoEmail === 1,
          clinicNews: res.data.clinicAnnouncement === 1,
        });
      } catch (err) {
        console.error("❌ Error loading preferences:", err);
      }
    };

    if (userId && token) fetchPreferences();
  }, [userId, token]);

  // Toggle notification switch
  const toggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Save updated preferences
  const handleSave = async () => {
    try {
      const payload = {
        appointmentReminders: notifications.appointments ? 1 : 0,
        petHealthUpd: notifications.health ? 1 : 0,
        promoEmail: notifications.promotions ? 1 : 0,
        clinicAnnouncement: notifications.clinicNews ? 1 : 0,
      };

      await api.put(`/users/${userId}/preferences`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Preferences saved successfully!");
    } catch (error) {
      console.error("❌ Error saving preferences:", error);
      alert("❌ Failed to save preferences.");
    }
  };

  const notificationItems = [
    { label: "Appointment Reminders", key: "appointments" },
    { label: "Pet Health Updates", key: "health" },
    { label: "Promotional Emails", key: "promotions" },
    { label: "Clinic Announcements", key: "clinicNews" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#5EE6FE] mb-2">
        Manage Notifications
      </h2>
      <p className="text-sm text-gray-600">
        Choose how you’d like to receive updates from RaphaVet Pets Clinic.
      </p>

      <div className="flex flex-col gap-4">
        {notificationItems.map((item) => (
          <div
            key={item.key}
            className="flex justify-between items-center bg-[#F8FBFB] p-3 rounded-lg border border-[#E6F5F7] hover:shadow-md transition-all duration-200"
          >
            <span className="text-gray-700 font-medium">{item.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[item.key] ?? false} // fallback to false
                onChange={() => toggle(item.key)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#5EE6FE] transition-all"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="text-right">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#5EE6FE] text-white rounded-lg font-semibold hover:bg-[#47c0d7] transition-all duration-300"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

export default NotificationSettings;
