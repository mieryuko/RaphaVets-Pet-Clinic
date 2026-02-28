import React, { useState, useEffect } from "react";
import api from "../../../api/axios";

function AccountInformation({ userData, setUserData }) {
  const [editableFields, setEditableFields] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const userId = localStorage.getItem("userId");

  // Load user data
  useEffect(() => {
    if (userData) {
      const user = userData.user || userData;
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        contactNo: user.contactNo || "",
        address: user.address || "",
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear message when user starts typing
    if (message.text) setMessage({ type: "", text: "" });
  };

  const toggleEdit = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage({ type: "error", text: "⚠️ Not logged in!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.put(`/users/${userId}/profile`, formData);
      setMessage({ type: "success", text: res.data.message || "Profile updated successfully!" });
      setEditableFields({});
      
      // Update parent state if needed
      if (setUserData) {
        setUserData(prev => ({ ...prev, ...formData }));
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("❌ Error updating profile:", err.response?.data || err.message);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "First Name", field: "firstName", type: "text" },
    { label: "Last Name", field: "lastName", type: "text" },
    { label: "Email Address", field: "email", type: "email" },
    { label: "Contact Number", field: "contactNo", type: "tel" },
    { label: "Address", field: "address", type: "text" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <h2 className="text-base sm:text-lg font-semibold text-[#5EE6FE] mb-2 sm:mb-3">
        Personal Details
      </h2>
      
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {fields.map((item) => (
          <div key={item.field} className="relative">
            <label className="block text-gray-600 text-xs sm:text-sm mb-1 font-medium">
              {item.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                type={item.type}
                name={item.field}
                value={formData[item.field] || ""}
                onChange={handleChange}
                disabled={!editableFields[item.field]}
                className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-1 focus:ring-[#5EE6FE] focus:border-[#5EE6FE] transition-all ${
                  editableFields[item.field]
                    ? "border-[#5EE6FE] bg-white"
                    : "border-gray-300 bg-gray-100 cursor-not-allowed text-gray-600"
                }`}
                placeholder={`Enter ${item.label.toLowerCase()}`}
              />
              <button
                onClick={() => toggleEdit(item.field)}
                type="button"
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  editableFields[item.field]
                    ? "bg-[#5EE6FE] text-white"
                    : "text-[#5EE6FE] hover:bg-[#EAFBFD]"
                }`}
                title={editableFields[item.field] ? "Cancel edit" : "Edit field"}
              >
                <i className={`fa-solid ${editableFields[item.field] ? "fa-times" : "fa-pen-to-square"} text-sm`}></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-4 sm:mt-5">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full sm:w-auto px-6 py-2.5 sm:py-2 ${
            loading ? "bg-gray-400" : "bg-[#5EE6FE] hover:bg-[#47c0d7]"
          } text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fa-solid fa-save"></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AccountInformation;