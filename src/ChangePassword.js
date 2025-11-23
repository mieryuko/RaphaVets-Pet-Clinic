import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "./api/axios";
import FormMessage from "./user-pages/components/FormMessage";

function ChangePassword({ onClose }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [values, setValues] = useState({
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [verifying, setVerifying] = useState(!!token);
  const [message, setMessage] = useState({ message: "", type: "" });
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
        // setMessage({ message: "✅ Token verified. You can now reset your password.", type: "success" });
      }
    } catch (err) {
      setMessage({ 
        // message: "Invalid or expired reset link. Please request a new password reset.", 
        // type: "error" 
      });
      setIsTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    // Clear message when user starts typing
    if (message.message) {
      setMessage({ message: "", type: "" });
    }
  };

  const togglePassword = (key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const password = values.new;
  const confirm = values.confirm;

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasLength = password.length >= 8;
  const hasSpecial = /[*\-@\$]/.test(password);
  const matches = password !== "" && password === confirm;

  const allValid = hasUpper && hasNumber && hasLength && hasSpecial && matches;

  const itemClass = (condition) =>
    `flex items-start gap-2 ${condition ? "text-green-500" : "text-gray-400"}`;

  const handleUpdatePassword = async () => {
    if (!allValid) {
      setMessage({ message: "Please meet all password requirements before updating.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ message: "", type: "" });

    try {
      const endpoint = token ? "/auth/reset-password" : "/auth/change-password";
      const payload = token 
        ? { token, newPassword: values.new }
        : { newPassword: values.new, confirmPassword: values.confirm };

      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        setStep("success");
        setMessage({ message: "", type: "" });
        
        // If it's a reset password (with token), redirect to login after delay
        if (token) {
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      } else {
        setMessage({ message: res.data.message || "Failed to update password", type: "error" });
      }
    } catch (err) {
      console.error("❌ Password update error:", err);
      setMessage({
        message: err.response?.data?.message || "Server error. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAgain = () => {
    // Clear all localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("petsCacheTimestamp");
    localStorage.removeItem("selectedPet");
    localStorage.removeItem("cachedPets");

    navigate("/");
  };

  // Show loading state while verifying token
  if (verifying) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto my-auto p-6 text-center"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <div className="w-12 h-12 border-4 border-[#5EE6FE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying reset link...</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show invalid token message
  if (token && !isTokenValid) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto my-auto p-6 text-center"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-exclamation-triangle text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Invalid Reset Link</h3>
            <p className="text-gray-600 text-sm mb-4">
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={onClose || (() => navigate("/"))}
              className="w-full bg-[#5EE6FE] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#47c0d7] transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto my-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {step === "form" ? (
            <div className="p-5">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5EE6FE] to-[#3ecbe0] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <i className="fa-solid fa-lock text-white text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {token ? "Reset Password" : "Change Password"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {token ? "Enter your new password" : "Secure your account"}
                </p>
              </div>

              {/* Message Display */}
              {message.message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.type === "error" 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}>
                  {message.message}
                </div>
              )}

              <div className="space-y-3">
                {[
                  { label: "New Password", placeholder: "Enter new password", key: "new" },
                  { label: "Confirm New Password", placeholder: "Re-enter new password", key: "confirm" },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      {item.label}
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword[item.key] ? "text" : "password"}
                        value={values[item.key]}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-1 focus:ring-[#5EE6FE] focus:border-[#5EE6FE] focus:outline-none transition-all duration-200 bg-gray-50/50"
                        placeholder={item.placeholder}
                      />

                      <i
                        className={`fa-solid ${
                          showPassword[item.key] ? "fa-eye-slash" : "fa-eye"
                        } absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#5EE6FE] text-sm transition-colors duration-200`}
                        onClick={() => togglePassword(item.key)}
                      ></i>
                    </div>

                    {item.key === "new" && (
                      <motion.div 
                        className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-sm font-medium text-gray-600 mb-2">Requirements:</p>
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
                            <span>Matches confirmation password</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                {onClose && (
                  <motion.button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                )}
                <motion.button
                  disabled={loading || !allValid || (token && !isTokenValid)}
                  onClick={handleUpdatePassword}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    loading || !allValid || (token && !isTokenValid)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#5EE6FE] to-[#3ecbe0] text-white hover:shadow-md"
                  }`}
                  whileHover={!loading && allValid ? { scale: 1.02 } : {}}
                  whileTap={!loading && allValid ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {token ? "Resetting..." : "Updating..."}
                    </div>
                  ) : (
                    token ? "Reset Password" : "Change Password"
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3"
              >
                <i className="fa-solid fa-check text-white text-xl"></i>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-gray-800 mb-2"
              >
                Password {token ? "Reset" : "Changed"}!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 text-sm mb-4"
              >
                {token 
                  ? "Your password has been reset successfully." 
                  : "Please login again to continue"
                }
              </motion.p>

              <motion.button
                onClick={token ? () => navigate("/") : handleLoginAgain}
                className="w-full bg-gradient-to-r from-[#5EE6FE] to-[#3ecbe0] text-white py-2 rounded-lg text-sm font-semibold hover:shadow-md transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {token ? "Go to Login" : "Login Again"}
              </motion.button>
            </div>
          )}

          <div className="absolute inset-0 -z-10 opacity-[0.02] overflow-hidden rounded-xl">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#5EE6FE] rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#3ecbe0] rounded-full blur-2xl"></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ChangePassword;