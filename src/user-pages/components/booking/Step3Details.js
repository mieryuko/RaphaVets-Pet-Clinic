import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/axios";

export default function Step3Details({ goToStep, selectedPet, setSelectedPet }) {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
  });
  const [pets, setPets] = useState([]);
  const scrollContainerRef = useRef(null);
  
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

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">🐾 Pet & Owner Details</h2>
        <p className="text-gray-500 text-xs sm:text-sm">
          Review your pet’s information and owner details before proceeding.
        </p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100 flex flex-col gap-4 sm:gap-5 md:gap-6">
        {/* PETS SECTION - HORIZONTAL SCROLL */}
        {pets.length === 0 ? (
          <div className="text-gray-500 text-sm">No pets found. Please add a pet.</div>
        ) : (
          <div className="relative">
            {/* Scroll Buttons - Visible only when there are many pets */}
            {pets.length > 3 && (
              <>
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center text-[#5EE6FE] hover:bg-[#5EE6FE] hover:text-white transition-all border border-gray-200"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center text-[#5EE6FE] hover:bg-[#5EE6FE] hover:text-white transition-all border border-gray-200"
                  style={{ transform: 'translate(50%, -50%)' }}
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </>
            )}

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hide"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <style>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {pets.map((pet) => {
                const isActive = selectedPet?.id === pet.id;
                return (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`flex-shrink-0 w-48 sm:w-56 md:w-64 cursor-pointer transition-all duration-300 rounded-xl sm:rounded-2xl p-3 sm:p-4
                              ${isActive ? "border-2 border-[#5EE6FE] bg-[#E8FBFF] shadow-md" : "border border-[#D6F0F3] bg-white hover:shadow-md"}`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        <img
                          src={`http://localhost:5000${pet.image}`}
                          alt={pet.name}
                          onError={(e) => {
                            e.target.src = "/images/dog-profile.png";
                          }}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#5EE6FE] object-cover shadow-sm"
                        />
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#5EE6FE] rounded-full flex items-center justify-center text-white text-xs border-2 border-white">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate w-full">{pet.name}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm truncate w-full">
                        {pet.breed}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
                        <span>{pet.age} yrs</span>
                        <span>•</span>
                        <span>{pet.weight} kg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll Indicator - Shows number of pets */}
            {pets.length > 3 && (
              <div className="flex justify-center gap-1 mt-2">
                <span className="text-xs text-gray-400">
                  <i className="fa-regular fa-circle-left mr-1"></i>
                  Scroll to see more ({pets.length} pets)
                  <i className="fa-regular fa-circle-right ml-1"></i>
                </span>
              </div>
            )}
          </div>
        )}

        {/* OWNER INFO - Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-2 sm:mt-3 md:mt-4">
          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Owner Name</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base font-medium shadow-sm truncate">
              {userData.firstName} {userData.lastName}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Contact Number</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base font-medium shadow-sm truncate">
              {userData.contactNo || "N/A"}
            </div>
          </div>

          <div className="flex flex-col sm:col-span-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Email Address</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-sm sm:text-base font-medium shadow-sm truncate">
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