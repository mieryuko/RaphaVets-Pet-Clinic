import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const items = [
    { to: "/admin", label: "Dashboard", icon: "🏠" },
    { to: "/admin/appointments", label: "Appointments", icon: "📅" },
    { to: "/admin/patients", label: "Patients", icon: "🐾" },
    { to: "/admin/missing", label: "Lost & Found", icon: "🔍" },
    { to: "/admin/content", label: "Content", icon: "✍️" },
    { to: "/admin/regression", label: "Regression Tool", icon: "📈" },
    { to: "/admin/reports", label: "Reports", icon: "📊" },
    { to: "/admin/chatlogs", label: "Chat Logs", icon: "💬" },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white border-r h-screen sticky top-0">
      <div className="px-3 py-6 flex items-center gap-3">
        <div className="bg-[#2FA394] text-white font-bold rounded-xl w-10 h-10 flex items-center justify-center">R</div>
        <div className="hidden md:block">
          <div className="font-semibold">RaphaVets</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
      </div>

      <nav className="mt-6">
        {items.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm ${isActive ? "bg-[#EFFBF9] text-[#0f766e]" : "text-gray-600 hover:bg-gray-50"}`
            }
          >
            <span className="text-lg">{i.icon}</span>
            <span className="hidden md:inline">{i.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
