import React, { useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

function SecurityPrivacy() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const fields = [
    { label: "Current Password", placeholder: "Enter current password", key: "current" },
    { label: "New Password", placeholder: "Enter new password", key: "new" },
    { label: "Confirm New Password", placeholder: "Re-enter new password", key: "confirm" },
  ];

  const [values, setValues] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    // Clear message when user types
    if (message.text) setMessage({ type: "", text: "" });
  };

  const togglePassword = (key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Validation logic
  const password = values.new;
  const confirm = values.confirm;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasLength = password.length >= 8;
  const hasSpecial = /[*\-@$!]/.test(password);
  const matches = password !== "" && password === confirm;

  const allValid = hasUpper && hasLower && hasLength && hasSpecial && matches;

  const itemClass = (condition) =>
    `flex items-start gap-1.5 text-xs ${condition ? "text-green-600" : "text-gray-400"}`;

  const handleUpdatePassword = async () => {
    if (!values.current || !values.new || !values.confirm) {
      setMessage({ type: "error", text: "Please fill out all password fields." });
      return;
    }

    if (!allValid) {
      setMessage({ type: "error", text: "Please meet all password requirements before updating." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.put(`/users/${userId}/change-password`, {
        currentPassword: values.current,
        newPassword: values.new,
        confirmPassword: values.confirm,
      });

      setMessage({ type: "success", text: res.data.message || "Password updated successfully!" });
      setValues({ current: "", new: "", confirm: "" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      const message = err.response?.data?.message || "Error updating password.";
      setMessage({ type: "error", text: message });

      if (message.includes("unauthorized") || message.includes("token")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <h2 className="text-base sm:text-lg font-semibold text-[#5EE6FE] mb-2">
        Security Settings
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

      <div className="space-y-4">
        {fields.map((item) => (
          <div key={item.key}>
            <label className="block text-gray-600 text-xs sm:text-sm mb-1 font-medium">
              {item.label}
            </label>

            <div className="relative">
              <input
                type={showPassword[item.key] ? "text" : "password"}
                value={values[item.key]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-10 text-sm focus:ring-1 focus:ring-[#5EE6FE] focus:border-[#5EE6FE]"
                placeholder={item.placeholder}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => togglePassword(item.key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5EE6FE]"
              >
                <i className={`fa-solid ${showPassword[item.key] ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
              </button>
            </div>

            {/* Password requirements */}
            {item.key === "new" && (
              <div className="mt-2 sm:mt-3 bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-2">Password requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className={itemClass(hasUpper)}>
                    <i className={`fa-solid ${hasUpper ? "fa-check-circle" : "fa-circle"} text-[10px] mt-0.5`} />
                    <span>Uppercase letter</span>
                  </div>
                  <div className={itemClass(hasLower)}>
                    <i className={`fa-solid ${hasLower ? "fa-check-circle" : "fa-circle"} text-[10px] mt-0.5`} />
                    <span>Lowercase letter</span>
                  </div>
                  <div className={itemClass(hasLength)}>
                    <i className={`fa-solid ${hasLength ? "fa-check-circle" : "fa-circle"} text-[10px] mt-0.5`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={itemClass(hasSpecial)}>
                    <i className={`fa-solid ${hasSpecial ? "fa-check-circle" : "fa-circle"} text-[10px] mt-0.5`} />
                    <span>Special character (*, -, @, $, !)</span>
                  </div>
                  <div className={itemClass(matches)}>
                    <i className={`fa-solid ${matches ? "fa-check-circle" : "fa-circle"} text-[10px] mt-0.5`} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          disabled={loading}
          onClick={handleUpdatePassword}
          className={`w-full sm:w-auto px-6 py-2.5 sm:py-2 ${
            loading ? "bg-gray-400" : "bg-[#5EE6FE] hover:bg-[#47c0d7]"
          } text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Updating...
            </>
          ) : (
            <>
              <i className="fa-solid fa-lock"></i>
              Update Password
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SecurityPrivacy;