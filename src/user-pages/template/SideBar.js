import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SideBar({ isMenuOpen, setIsMenuOpen, pets }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/home");
  };

  return (
    <>
      <div
        className={`${
          isMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-0 md:p-0"
        } fixed md:static top-0 left-0 z-20 md:z-auto bg-white md:bg-transparent w-[250px] h-full md:h-auto flex-shrink-0 flex flex-col p-5 transition-all duration-500 ease-in-out overflow-hidden`}
      >
        {isMenuOpen && (
          <>
            {/* PERSONAL */}
            <div className="pb-4 flex flex-col border-b-[1px] border-[#A6E3E9]">
              <div>
                <span className="font-[700] text-[20px] text-gray-700">Your Pets</span>
              </div>

              {/* PET PROFILE CARDS (STATIC PLACEHOLDERS) */}
              <div className="flex overflow-x-auto px-2 gap-4 mt-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {[
                  {
                    name: "Miguel",
                    image: "/images/dog-profile.png",
                  },
                ].map((pet, i) => (
                  <div
                    key={i}
                    onClick={() => navigate("/pet", { state: { pet } })}
                    className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-br from-[#A7E9E3] via-[#FDE2E4] to-[#FFF5E4] shadow-sm hover:scale-110 transition-all duration-300">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#FDFEFF] flex items-center justify-center border border-[#C9EAF2]">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <span className="text-[12px] mt-1 text-gray-700 truncate w-14 text-center font-medium group-hover:text-[#00B8D4]">
                      {pet.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sidebar Links */}
              <div className="flex flex-col gap-2 mt-3">
                <div
                  onClick={() => navigate("/user-home")}
                  className={`text-[15px] flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                    location.pathname === "/user-home"
                      ? "text-[#5EE6FE] font-semibold"
                      : "hover:text-[#5EE6FE] text-gray-700"
                  }`}
                >
                  <i className="fa-solid fa-house"></i>
                  <span>Home</span>
                </div>

                <div
                  onClick={() => navigate("/profile")}
                  className={`text-[15px] flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                    location.pathname === "/profile"
                      ? "text-[#5EE6FE] font-semibold"
                      : "hover:text-[#5EE6FE] text-gray-700"
                  }`}
                >
                  <i className="fa-solid fa-user"></i>
                  <span>Profile</span>
                </div>

                <div
                  onClick={() => navigate("/breed-detect")}
                  className={`text-[15px] flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                    location.pathname === "/breed-detect"
                      ? "text-[#5EE6FE] font-semibold"
                      : "hover:text-[#5EE6FE] text-gray-700"
                  }`}
                >
                  <i className="fa-solid fa-shield-dog"></i>
                  <span>Try Breed Detect</span>
                </div>
              </div>
            </div>

            {/* RESOURCES */}
            <div className="pb-4 flex flex-col border-b-[1px] border-[#A6E3E9] mt-2">
              <span className="font-[700] text-[20px] text-gray-700">Resources</span>
              <div className="px-3 flex flex-col gap-2 mt-2">
                <div
                  onClick={() => navigate("/videos")}
                  className={`text-[15px] flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                    location.pathname === "/videos"
                      ? "text-[#5EE6FE] font-semibold"
                      : "hover:text-[#5EE6FE] text-gray-700"
                  }`}
                >
                  <i className="fa-solid fa-film"></i>
                  <span>Videos</span>
                </div>

                <div
                  onClick={() => navigate("/pet-tips")}
                  className={`text-[15px] flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                    location.pathname === "/pet-tips"
                      ? "text-[#5EE6FE] font-semibold"
                      : "hover:text-[#5EE6FE] text-gray-700"
                  }`}
                >
                  <i className="fa-solid fa-lightbulb"></i>
                  <span>Pet Tips</span>
                </div>
              </div>
            </div>

            {/* INFORMATION */}
            <div className="pb-4 flex flex-col border-b-[1px] border-[#A6E3E9] mt-2">
              <span className="font-[700] text-[20px] text-gray-700">Information</span>
              <div className="px-3 flex flex-col gap-2 mt-2">
                <div className="text-[15px] flex items-center gap-2 hover:text-[#5EE6FE] cursor-pointer">
                  <i className="fa-solid fa-circle-question"></i>
                  <span>FAQs</span>
                </div>
                <div className="text-[15px] flex items-center gap-2 hover:text-[#5EE6FE] cursor-pointer">
                  <i className="fa-solid fa-headset"></i>
                  <span>Support</span>
                </div>
              </div>
            </div>

            {/* LOGOUT */}
            <div
              className="px-3 mt-3 text-[15px] flex items-center gap-2 hover:text-[#5EE6FE] cursor-pointer"
              onClick={() => setShowLogoutModal(true)}
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </div>
          </>
        )}
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[320px] shadow-lg text-center animate-popUp">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Logout
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0] transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay (mobile) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-10"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}

export default SideBar;
