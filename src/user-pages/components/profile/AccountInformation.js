import React, { useState, useEffect } from "react";
import api from "../../../api/axios"; // make sure the path is correct

function AccountInformation() {
  const [editableFields, setEditableFields] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    address: "",
  });

  const userId = localStorage.getItem("userId");

  // Load user data
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        const user = res.data.user || res.data;
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          contactNo: user.contactNo || "",
          address: user.address || "",
        });
      } catch (err) {
        console.error("❌ Error fetching user info:", err.response?.data || err.message);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (!userId) {
      alert("⚠️ Not logged in!");
      return;
    }

    try {
      const res = await api.put(`/users/${userId}`, formData);
      alert("✅ " + (res.data.message || "Profile updated successfully!"));
      setEditableFields({});
    } catch (err) {
      console.error("❌ Error updating profile:", err.response?.data || err.message);
      alert("Failed to update profile");
    }
  };

  const fields = [
    { label: "First Name", field: "firstName" },
    { label: "Last Name", field: "lastName" },
    { label: "Email Address", field: "email" },
    { label: "Contact Number", field: "contactNo" },
    { label: "Address", field: "address" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#5EE6FE] mb-2">Personal Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((item) => (
          <div key={item.field} className="relative">
            <label className="block text-gray-600 text-sm mb-1">{item.label}</label>
            <div className="flex items-center">
              <input
                type="text"
                name={item.field}
                value={formData[item.field] || ""}
                onChange={handleChange}
                disabled={!editableFields[item.field]}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#5EE6FE] focus:border-[#5EE6FE] transition-all ${
                  editableFields[item.field]
                    ? "border-[#5EE6FE] bg-white"
                    : "border-gray-300 bg-gray-100 cursor-not-allowed"
                }`}
              />
              <button
                onClick={() => toggleEdit(item.field)}
                type="button"
                className="ml-2 text-[#5EE6FE] hover:text-[#47c0d7] transition-all"
              >
                <i className="fa-solid fa-pen-to-square text-lg"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-right">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#5EE6FE] text-white rounded-lg font-semibold hover:bg-[#47c0d7] transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default AccountInformation;
