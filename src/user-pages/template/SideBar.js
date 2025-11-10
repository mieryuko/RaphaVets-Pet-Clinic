import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

function SideBar({ isMenuOpen, setIsMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pets, setPets] = useState([]); // store pets from backend

  

  // Fetch pets on component mount
  useEffect(() => {
    const fetchPets = async () => {
      const token = localStorage.getItem("token");
      console.log("Token being sent:", token); // <-- log token

      if (!token) return;

      try {
        const res = await api.get("/pets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Pets response:", res.data); // <-- log response
        setPets(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch pets:", err.response?.data || err);
      }
    };

    fetchPets();
  }, []);


  const handleLogout = async () => {
    setShowLogoutModal(false);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await api.post(
          "/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("❌ Logout error:", err);
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    navigate("/");
  };

  const menuItems = [
    { label: "Home", path: "/user-home", icon: "fa-house" },
    { label: "Profile", path: "/profile", icon: "fa-user" },
    { label: "Try Breed Detect", path: "/breed-detect", icon: "fa-shield-dog" },
  ];

  const resourceItems = [
    { label: "Videos", path: "/videos", icon: "fa-film" },
    { label: "Pet Tips", path: "/pet-tips", icon: "fa-lightbulb" },
  ];

  const infoItems = [
    { label: "FAQs", path: "#", icon: "fa-circle-question" },
    { label: "Support", path: "#", icon: "fa-headset" },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`${
          isMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-0 md:p-0"
        } fixed md:static top-0 left-0 z-20 md:z-auto bg-white md:bg-transparent w-[250px] h-full md:h-auto flex-shrink-0 flex flex-col p-5 transition-all duration-500 ease-in-out overflow-hidden`}
      >
        {isMenuOpen && (
          <>
            {/* Your Pets Section */}
            <div className="pb-4 flex flex-col border-b-[1px] border-[#A6E3E9]">
              <span className="font-[700] text-[20px] text-gray-700">Your Pets</span>

              <div className="flex overflow-x-auto px-2 gap-4 mt-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {pets.length > 0 ? (
                  pets.map((pet) => (
                    <div
                      key={pet.id}
                      onClick={() => navigate(`/pet/${pet.id}`)}
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
                  ))
                ) : (
                  <p className="text-sm text-gray-400 mt-2 px-2">No pets found</p>
                )}
              </div>

              {/* Menu Links */}
              <div className="flex flex-col gap-2 mt-3">
                {menuItems.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`text-[15px] flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                      location.pathname === item.path
                        ? "text-[#5EE6FE] font-semibold"
                        : "hover:text-[#5EE6FE] text-gray-700"
                    }`}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="pb-4 flex flex-col border-b-[1px] border-[#A6E3E9] mt-2">
              <span className="font-[700] text-[20px] text-gray-700">Resources</span>
              <div className="px-3 flex flex-col gap-2 mt-2">
                {resourceItems.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`text-[15px] flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                      location.pathname === item.path
                        ? "text-[#5EE6FE] font-semibold"
                        : "hover:text-[#5EE6FE] text-gray-700"
                    }`}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Information */}
            <div className="pb-4 flex flex-col border-b-[1px] border-[#A6E3E9] mt-2">
              <span className="font-[700] text-[20px] text-gray-700">Information</span>
              <div className="px-3 flex flex-col gap-2 mt-2">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="text-[15px] flex items-center gap-2 hover:text-[#5EE6FE] cursor-pointer"
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
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

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[320px] shadow-lg text-center animate-popUp">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
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

      {/* Mobile overlay */}
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
