import { Home, Users, Calendar, Wrench, FileText, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation(); // to highlight active menu
  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/admin-pages/dashboard" },
    { name: "Patient & Pet Management", icon: <Users size={18} />, path: "/admin-pages/patient-management" },
    { name: "Appointments", icon: <Calendar size={18} />, path: "/admin-pages/appointments" },
    { name: "Tools", icon: <Wrench size={18} />, path: "/admin-pages/tools" },
    { name: "Content Manager", icon: <FileText size={18} />, path: "/admin-pages/content-manager" },
    { name: "Reports", icon: <FileText size={18} />, path: "/admin-pages/reports" },
    { name: "Admin Settings", icon: <Settings size={18} />, path: "/admin-pages/settings" },
  ];

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
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#FFF4F4] hover:text-[#FF6B6B] cursor-pointer transition-all duration-150">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
