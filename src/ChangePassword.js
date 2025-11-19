import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "./api/axios";
import FormMessage from "./user-pages/components/FormMessage";

function ChangePassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(!!token);
  const [message, setMessage] = useState({ message: "", type: "" });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await api.get(`/auth/verify-reset-token/${token}`);
      if (res.data.success) {
        setIsTokenValid(true);
        setMessage({ message: "✅ Token verified. You can now reset your password.", type: "success" });
      }
    } catch (err) {
      setMessage({ 
        message: "Invalid or expired reset link. Please request a new password reset.", 
        type: "error" 
      });
      setIsTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const password = formData.newPassword;
  const confirm = formData.confirmPassword;

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasLength = password.length >= 8;
  const hasSpecial = /[*\-@\$]/.test(password);
  const matches = password !== "" && password === confirm;

  const allValid = hasUpper && hasNumber && hasLength && hasSpecial && matches;

  const itemClass = (condition) =>
    `flex items-start gap-2 ${condition ? "text-green-500" : "text-gray-400"}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setMessage({ message: "Please fill in all fields.", type: "error" });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ message: "Passwords do not match.", type: "error" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ message: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ message: "", type: "" });

    try {
      const res = await api.post("/auth/reset-password", {
        token: token,
        newPassword: formData.newPassword
      });

      if (res.data.success) {
        setMessage({ message: "✅ Password reset successfully! You can now login with your new password.", type: "success" });
        
        // Redirect to login after success
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage({ message: res.data.message || "Failed to reset password", type: "error" });
      }
    } catch (err) {
      console.error("❌ Password reset error:", err);
      setMessage({
        message: err.response?.data?.message || "Server error. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5EE6FE] to-[#2FA394] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (token && !isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5EE6FE] to-[#2FA394] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
        >
          <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-exclamation-triangle text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Invalid Reset Link</h3>
          <p className="text-gray-600 mb-4">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#5EE6FE] text-white rounded-lg font-semibold hover:bg-[#47c0d7] transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EE6FE] to-[#2FA394] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#5EE6FE] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-lock text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {token ? "Reset Password" : "Change Password"}
            </h2>
            <p className="text-gray-600">
              {token 
                ? "Enter your new password" 
                : "Change your account password"
              }
            </p>
          </div>

          <FormMessage type={message.type} message={message.message} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-10 text-sm focus:ring-2 focus:ring-[#5EE6FE] focus:border-[#5EE6FE] focus:outline-none transition-all duration-200 bg-gray-50/50"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#5EE6FE] transition-colors"
                  onClick={() => togglePassword("new")}
                >
                  <i className={`fa-solid ${showPassword.new ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-10 text-sm focus:ring-2 focus:ring-[#5EE6FE] focus:border-[#5EE6FE] focus:outline-none transition-all duration-200 bg-gray-50/50"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#5EE6FE] transition-colors"
                  onClick={() => togglePassword("confirm")}
                >
                  <i className={`fa-solid ${showPassword.confirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <motion.div 
              className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-medium text-gray-600 mb-2">Password Requirements:</p>
              <div className="space-y-2 text-xs">
                <div className={itemClass(hasUpper)}>
                  <i className={`fa-solid ${hasUpper ? "fa-check" : "fa-circle"} text-[10px] mt-0.5`} />
                  <span>At least one uppercase letter</span>
                </div>
                <div className={itemClass(hasLength)}>
                  <i className={`fa-solid ${hasLength ? "fa-check" : "fa-circle"} text-[10px] mt-0.5`} />
                  <span>At least 8 characters long</span>
                </div>
                <div className={itemClass(hasNumber)}>
                  <i className={`fa-solid ${hasNumber ? "fa-check" : "fa-circle"} text-[10px] mt-0.5`} />
                  <span>At least one number (0-9)</span>
                </div>
                <div className={itemClass(hasSpecial)}>
                  <i className={`fa-solid ${hasSpecial ? "fa-check" : "fa-circle"} text-[10px] mt-0.5`} />
                  <span>At least one special character (eg. @, #, $, *)</span>
                </div>
                <div className={itemClass(matches)}>
                  <i className={`fa-solid ${matches ? "fa-check" : "fa-circle"} text-[10px] mt-0.5`} />
                  <span>Passwords match</span>
                </div>
              </div>
            </motion.div>

            <button
              type="submit"
              disabled={loading || !allValid || (token && !isTokenValid)}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                loading || !allValid || (token && !isTokenValid)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#5EE6FE] text-white hover:bg-[#47c0d7] hover:shadow-md"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {token ? "Resetting Password..." : "Changing Password..."}
                </div>
              ) : (
                token ? "Reset Password" : "Change Password"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-[#5EE6FE] hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ChangePassword;