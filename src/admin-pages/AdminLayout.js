/* dl npm install lucide-react */

import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  AlertTriangle,
  FileText,
  BarChart3,
  MessageSquare,
  Brain,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin-pages" },
    { name: "Pet Records", icon: <Users size={18} />, path: "/admin-pages/pets" },
    { name: "Appointments", icon: <CalendarCheck size={18} />, path: "/admin-pages/appointments" },
    { name: "Patients", icon: <Users size={18} />, path: "/admin-pages/patients" },
    { name: "Missing Pets", icon: <AlertTriangle size={18} />, path: "/admin-pages/missing" },
    { name: "Content Manager", icon: <FileText size={18} />, path: "/admin-pages/content" },
    { name: "Regression Tool", icon: <Brain size={18} />, path: "/admin-pages/regression" },
    { name: "Reports", icon: <BarChart3 size={18} />, path: "/admin-pages/reports" },
    { name: "Chat Logs", icon: <MessageSquare size={18} />, path: "/admin-pages/chatlogs" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F9FA]">
      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed md:static md:translate-x-0 z-40 w-64 bg-white shadow-lg border-r border-gray-100 transition-transform duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#2FA394]">RaphaVets</h1>
          <button
            className="md:hidden text-gray-500"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-[#2FA394] text-white shadow-sm"
                    : "text-gray-700 hover:bg-[#E3FAF7] hover:text-[#2FA394]"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}

          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 w-full mt-6">
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 py-3 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-600"
              onClick={() => setOpen(!open)}
            >
              <Menu size={22} />
            </button>
            <h2 className="font-semibold text-[#2FA394] text-lg">
              {pageTitle(location.pathname)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/40"
              alt="admin"
              className="w-9 h-9 rounded-full border border-gray-200"
            />
            <span className="text-sm text-gray-700 font-medium">Admin</span>
          </div>
        </header>

        {/* Outlet for content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function pageTitle(path) {
  if (path === "/admin-pages") return "Dashboard";
  const mapping = {
    "/admin-pages/appointments": "Appointments",
    "/admin-pages/patients": "Patients",
    "/admin-pages/missing": "Missing Pets",
    "/admin-pages/content": "Content Manager",
    "/admin-pages/regression": "Regression Tool",
    "/admin-pages/reports": "Reports",
    "/admin-pages/chatlogs": "Chat Logs",
  };
  return mapping[path] || "";
}

