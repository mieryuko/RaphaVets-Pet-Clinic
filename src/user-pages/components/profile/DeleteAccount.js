import React, { useState } from "react";
import api from "../../../api/axios";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const handleDelete = () => {
    if (!password) return alert("Please enter your password first.");
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setShowConfirm(false);

      const res = await api.delete(`/users/${userId}/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password }, // password verification
      });

      alert(res.data.message);

      // Optional: log out and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/";
    } catch (err) {
      console.error("❌ Delete account error:", err);
      alert(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-lg font-semibold text-[#d93025] mb-2">
        Delete Your Account
      </h2>
      <p className="text-sm text-gray-600">
        This action is <span className="font-semibold">permanent</span>. All your data will be lost. Please confirm your password.
      </p>

      <div className="max-w-md mx-auto mt-5">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#5EE6FE] focus:border-[#5EE6FE]"
          placeholder="Enter your password"
        />
        <button
          onClick={handleDelete}
          className="w-full mt-4 py-2 bg-[#d93025] text-white rounded-lg font-semibold hover:bg-[#b92b21] transition-all duration-300"
        >
          Delete Account
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md z-10 text-center">
            <i className="fa-solid fa-triangle-exclamation text-[#d93025] text-4xl mb-3"></i>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Are you sure you want to delete your account?
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-[#d93025] text-white rounded-lg hover:bg-[#b92b21] transition-all duration-300"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteAccount;
