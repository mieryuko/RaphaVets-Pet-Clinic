import React, { useState, useEffect } from "react";
import api from "../../../api/axios";

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    appointments: false,
    health: false,
    petTips: false,
    petVideos: false,
    forumPosts: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetch preferences from backend
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/users/${userId}/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications({
          appointments: res.data.appointmentReminders === 1,
          health: res.data.petHealthUpd === 1,
          petTips: res.data.petTips === 1,
          petVideos: res.data.petVideos === 1,
          forumPosts: res.data.forumPosts === 1,
        });
        setMessage({ type: "", text: "" });
      } catch (err) {
        console.error("❌ Error loading preferences:", err);
        setMessage({ type: "error", text: "Failed to load preferences" });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, token]);

  // Toggle notification switch
  const toggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    // Clear message when user makes changes
    if (message.text) setMessage({ type: "", text: "" });
  };

  // Save updated preferences
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        appointmentReminders: notifications.appointments ? 1 : 0,
        petHealthUpd: notifications.health ? 1 : 0,
        petTips: notifications.petTips ? 1 : 0,
        petVideos: notifications.petVideos ? 1 : 0,
        forumPosts: notifications.forumPosts ? 1 : 0,
      };

      await api.put(`/users/${userId}/preferences`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage({ type: "success", text: "Preferences saved successfully!" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("❌ Error saving preferences:", error);
      setMessage({ type: "error", text: "Failed to save preferences." });
    } finally {
      setSaving(false);
    }
  };

  const notificationItems = [
    { label: "Appointment Reminders", key: "appointments", description: "Get notified about upcoming appointments" },
    { label: "Pet Health Updates", key: "health", description: "Receive health tips and reminders for your pets" },
    { label: "Pet Care Tips", key: "petTips", description: "Daily tips for better pet care" },
    { label: "Pet Videos", key: "petVideos", description: "Educational videos about pet health" },
    { label: "Forum Posts", key: "forumPosts", description: "Get updates from community discussions" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EE6FE]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-[#5EE6FE]">
          Notification Settings
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Choose how you'd like to receive updates
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success" 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          <i className={`fa-solid mr-2 ${
            message.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"
          }`}></i>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:gap-4">
        {notificationItems.map((item) => (
          <div
            key={item.key}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#F8FBFB] p-3 sm:p-4 rounded-lg border border-[#E6F5F7] hover:shadow-md transition-all duration-200 gap-2 sm:gap-0"
          >
            <div className="flex-1">
              <span className="text-gray-700 font-medium text-sm sm:text-base">{item.label}</span>
              <p className="text-gray-500 text-xs mt-1">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer self-end sm:self-auto">
              <input
                type="checkbox"
                checked={notifications[item.key] ?? false}
                onChange={() => toggle(item.key)}
                className="sr-only peer"
                disabled={saving}
              />
              <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#5EE6FE] transition-all"></div>
              <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all peer-checked:translate-x-5 sm:peer-checked:translate-x-5"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto px-6 py-2.5 sm:py-2 ${
            saving ? "bg-gray-400" : "bg-[#5EE6FE] hover:bg-[#47c0d7]"
          } text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2`}
        >
          {saving ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk"></i>
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default NotificationSettings;