import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function Step3Details({ goToStep, selectedPet, setSelectedPet }) {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
  });
  const [pets, setPets] = useState([]);
  
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch user profile:", err);
      }
    };

    if (userId && token) fetchUserProfile();
  }, [userId, token]);

  // Fetch pets
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get("/pets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPets(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch pets:", err);
      }
    };

    if (token) fetchPets();
  }, [token]);

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">🐾 Pet & Owner Details</h2>
        <p className="text-gray-500 text-xs sm:text-sm">
          Review your pet’s information and owner details before proceeding.
        </p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100 flex flex-col gap-4 sm:gap-5 md:gap-6">
        {/* PETS CARD */}
        {pets.length === 0 ? (
          <div className="text-gray-500 text-sm">No pets found. Please add a pet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {pets.map((pet) => {
              const isActive = selectedPet?.id === pet.id;
              return (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`flex items-center gap-3 sm:gap-5 p-3 sm:p-4 md:p-5 border rounded-xl sm:rounded-2xl cursor-pointer transition
                              ${isActive ? "border-[#5EE6FE] bg-[#E8FBFF]" : "border-[#D6F0F3] bg-white"}`}
                >
                  <img
                    src={`http://localhost:5000${pet.image}`}
                    alt={pet.name}
                    onError={(e) => {
                          e.target.src = "/images/dog-profile.png";
                        }}
                    className="w-14 h-14 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-full border-4 border-[#5EE6FE] object-cover shadow-sm flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">{pet.name}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">
                      {pet.breed} • {pet.age} • {pet.weight} kg
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OWNER INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-2 sm:mt-3 md:mt-4">
          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Owner Name</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base font-medium shadow-sm cursor-not-allowed truncate">
              {userData.firstName} {userData.lastName}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Contact Number</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base font-medium shadow-sm cursor-not-allowed truncate">
              {userData.contactNo || "N/A"}
            </div>
          </div>

          <div className="flex flex-col sm:col-span-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Email Address</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base font-medium shadow-sm cursor-not-allowed truncate">
              {userData.email}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3 mt-2 sm:mt-3 md:mt-4">
          <button
            onClick={() => goToStep(2)}
            className="w-full xs:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            Back
          </button>
          <button
            disabled={!selectedPet}
            onClick={() => goToStep(4)}
            className={`w-full xs:w-auto px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg text-white font-semibold shadow-sm transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base
              ${selectedPet ? "bg-[#5EE6FE] hover:bg-[#3ecbe0]" : "bg-gray-100 cursor-not-allowed text-gray-400"}`}
          >
            <span>Next: Review</span>
            <i className="fa-solid fa-arrow-right text-xs sm:text-sm"></i>
          </button>
        </div>
      </div>
    </>
  );
}