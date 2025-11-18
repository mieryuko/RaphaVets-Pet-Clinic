import { useState } from "react"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Calendar, Brain, FileBarChart, Settings, LogOut, Edit } from "lucide-react";
  import api from "../../api/axios"; 


const Sidebar = () => {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/admin-pages/dashboard" },
    // { name: "Diagnostic Tool", icon: <Brain size={18} />, path: "/admin-pages/tools" },
    { name: "Customer & Pet Management", icon: <Users size={18} />, path: "/admin-pages/pet-management" },
    { name: "Appointments & Visits", icon: <Calendar size={18} />, path: "/admin-pages/appointments" },
    { name: "Content Management", icon: <Edit size={18} />, path: "/admin-pages/content-manager" },
    { name: "Reports", icon: <FileBarChart size={18} />, path: "/admin-pages/reports" },
    { name: "Admin Settings", icon: <Settings size={18} />, path: "/admin-pages/settings" },
  ];

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

      // REMOVE ALL THESE ITEMS:
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      localStorage.removeItem("petsCacheTimestamp");
      localStorage.removeItem("selectedPet");
      localStorage.removeItem("cachedPets");

      navigate("/");
    };

  return (
    <aside className="w-64 h-screen bg-white shadow-[4px_0_12px_rgba(0,0,0,0.05)] flex flex-col justify-between py-6 rounded-r-2xl">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <img src="/images/rapha-logo.png" alt="Rapha Logo" className="w-24 mb-4 select-none" />
      </div>

      {/* Navigation */}
      <ul className="space-y-1 px-4 flex-1">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                ${location.pathname === item.path
                  ? "bg-[#F5FCFF] text-[#00BFFF]"
                  : "text-gray-600 hover:bg-[#F5FCFF] hover:text-[#00BFFF] dark:text-gray-300 dark:hover:bg-[#222]"
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="px-4">
        <div 
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#FFF4F4] hover:text-[#FF6B6B] cursor-pointer transition-all duration-150">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </div>
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
    </aside>
  );
};

export default Sidebar;
