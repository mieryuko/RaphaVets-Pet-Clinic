import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!password) {
      setError("Please enter your password to continue.");
      return;
    }
    setError("");
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      setShowConfirm(false);
      setError("");

      const res = await api.delete(`/users/${userId}/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });

      alert(res.data.message);

      // Clear local storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      
      // Redirect to home page
      navigate("/");
    } catch (err) {
      console.error("❌ Delete account error:", err);
      setError(err.response?.data?.message || "Failed to delete account. Please check your password and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-base sm:text-lg font-semibold text-[#d93025] mb-2">
          Delete Your Account
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          This action is <span className="font-semibold">permanent and cannot be undone</span>. 
          All your data, including pets, appointments, and medical records will be permanently deleted.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs sm:text-sm">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      <div className="max-w-md mx-auto sm:mx-0 w-full">
        <label className="block text-gray-600 text-xs sm:text-sm mb-1 font-medium">
          Confirm Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-1 focus:ring-[#d93025] focus:border-[#d93025]"
          placeholder="Enter your current password"
          disabled={loading}
        />
        
        <div className="mt-4 sm:mt-5 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Before you delete your account:
          </h3>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            <li>All your pets' information will be removed</li>
            <li>Appointment history will be lost</li>
            <li>Medical records will be permanently deleted</li>
            <li>You won't be able to recover any data</li>
          </ul>
        </div>

        <button
          onClick={handleDelete}
          disabled={loading}
          className={`w-full mt-4 py-2.5 sm:py-3 ${
            loading ? "bg-gray-400" : "bg-[#d93025] hover:bg-[#b92b21]"
          } text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="fa-solid fa-trash-can"></i>
              Delete My Account
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-[90%] sm:max-w-md z-10 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="fa-solid fa-triangle-exclamation text-[#d93025] text-xl sm:text-2xl"></i>
              </div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                Are you absolutely sure?
              </h3>
              
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5">
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 sm:mb-5">
                <p className="text-xs text-red-700">
                  <span className="font-semibold">Warning:</span> This is permanent and cannot be reversed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-[#d93025] text-white rounded-lg text-sm font-medium hover:bg-[#b92b21] transition-all disabled:opacity-50"
                >
                  Yes, Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DeleteAccount;