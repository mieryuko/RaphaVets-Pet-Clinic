import React, { useState } from "react";
import api from "../../../api/axios"; // your configured axios instance
import { useNavigate } from "react-router-dom";

function SecurityPrivacy() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // assumes you stored user ID after login

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

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const togglePassword = (key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // validation logic for new password
  const password = values.new;
  const confirm = values.confirm;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasLength = password.length >= 8;
  const hasSpecial = /[*\-@\$]/.test(password);
  const matches = password !== "" && password === confirm;

  const allValid = hasUpper && hasLower && hasLength && hasSpecial && matches;

  const itemClass = (condition) =>
    `flex items-start gap-1 ${condition ? "text-green-500" : "text-gray-400"}`;

  const handleUpdatePassword = async () => {
    if (!values.current || !values.new || !values.confirm) {
      alert("Please fill out all password fields.");
      return;
    }

    if (!allValid) {
      alert("Please meet all password requirements before updating.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/users/${userId}/change-password`, {
        currentPassword: values.current,
        newPassword: values.new,
        confirmPassword: values.confirm,
      });

      alert(res.data.message || "Password updated successfully!");
      setValues({ current: "", new: "", confirm: "" });
    } catch (err) {
      const message = err.response?.data?.message || "Error updating password.";
      alert(message);

      if (message.includes("unauthorized") || message.includes("token")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#5EE6FE] mb-2">Security Options</h2>

      <div className="space-y-4">
        {fields.map((item) => (
          <div key={item.key}>
            <label className="block text-gray-600 text-sm mb-1">{item.label}</label>

            {/* password input with eye icon */}
            <div className="relative">
              <input
                type={showPassword[item.key] ? "text" : "password"}
                value={values[item.key]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-1 focus:ring-[#5EE6FE] focus:border-[#5EE6FE]"
                placeholder={item.placeholder}
              />

              <i
                className={`fa-solid ${
                  showPassword[item.key] ? "fa-eye-slash" : "fa-eye"
                } absolute right-3 top-3 text-gray-500 cursor-pointer hover:text-[#5EE6FE]`}
                onClick={() => togglePassword(item.key)}
              ></i>
            </div>

            {/* Password requirements only for New Password */}
            {item.key === "new" && (
              <div className="mt-1 sm:mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-gray-400 text-xs">
                  <div className={itemClass(hasUpper)}>
                    <i
                      className={`fa-solid ${hasUpper ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}
                    />
                    <span className="text-[11px]">At least one uppercase letter.</span>
                  </div>

                  <div className={itemClass(hasLength)}>
                    <i
                      className={`fa-solid ${hasLength ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}
                    />
                    <span className="text-[11px]">At least 8 characters long.</span>
                  </div>

                  <div className={itemClass(hasLower)}>
                    <i
                      className={`fa-solid ${hasLower ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}
                    />
                    <span className="text-[11px]">At least one lowercase letter.</span>
                  </div>

                  <div className={itemClass(hasSpecial)}>
                    <i
                      className={`fa-solid ${hasSpecial ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}
                    />
                    <span className="text-[11px]">
                      Includes a special character (*, -, @, $).
                    </span>
                  </div>

                  <div className={itemClass(matches)}>
                    <i
                      className={`fa-solid ${matches ? "fa-check" : "fa-circle"} mt-1 text-[10px]`}
                    />
                    <span className="text-[11px]">Matches confirmation password.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-right">
        <button
          disabled={loading}
          onClick={handleUpdatePassword}
          className={`px-6 py-2 ${
            loading ? "bg-gray-400" : "bg-[#5EE6FE] hover:bg-[#47c0d7]"
          } text-white rounded-lg font-semibold transition-all duration-300`}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export default SecurityPrivacy;
