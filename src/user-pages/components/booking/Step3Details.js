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
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🐾 Pet & Owner Details</h2>
        <p className="text-gray-500 text-sm">
          Review your pet’s information and owner details before proceeding.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col gap-6">
        {/* PETS CARD */}
        {pets.length === 0 ? (
          <div className="text-gray-500">No pets found. Please add a pet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets.map((pet) => {
              const isActive = selectedPet?.id === pet.id;
              return (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`flex items-center gap-5 p-5 border rounded-2xl cursor-pointer transition
                              ${isActive ? "border-[#5EE6FE] bg-[#E8FBFF]" : "border-[#D6F0F3] bg-white"}`}
                >
                  <img
                    src={pet.image || "/images/dog-profile.png"}
                    alt={pet.name}
                    className="w-20 h-20 rounded-full border-4 border-[#5EE6FE] object-cover shadow-sm"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{pet.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {pet.breed} • {pet.age} • {pet.weight} kg
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OWNER INFO */}
        <div className="grid sm:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Owner Name</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium shadow-sm cursor-not-allowed">
              {userData.firstName} {userData.lastName}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Contact Number</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium shadow-sm cursor-not-allowed">
              {userData.contactNo || "N/A"}
            </div>
          </div>

          <div className="flex flex-col sm:col-span-2">
            <label className="text-sm font-semibold text-gray-600 mb-1">Email Address</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium shadow-sm cursor-not-allowed">
              {userData.email}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => goToStep(2)}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Back
          </button>
          <button
            disabled={!selectedPet} // Require pet selection
            onClick={() => goToStep(4)}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-sm transition-all flex items-center gap-2
              ${selectedPet ? "bg-[#5EE6FE] hover:bg-[#3ecbe0]" : "bg-gray-100 cursor-not-allowed text-gray-400"}`}
          >
            Next: Review Your Details <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </>
  );
}
