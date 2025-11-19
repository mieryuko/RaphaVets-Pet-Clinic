import React from 'react';
import {
  Calendar,
  Stethoscope,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const navItems = [
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "diagnostic", label: "Diagnostic Tool", icon: Stethoscope },
    { id: "records", label: "Medical Records", icon: FileText },
    { id: "patients", label: "Patients", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#1E3A8A] to-[#1E40AF] shadow-xl transition-all duration-300 flex flex-col relative`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-blue-600 flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope size={24} className="text-[#5EE6FE]" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">VetCare</span>
              <span className="font-light text-blue-200 text-sm block">Professional</span>
            </div>
          </div>
        )}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-colors text-white"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-all rounded-xl mb-2 ${
                isActive 
                  ? 'bg-white shadow-lg text-[#1E40AF]' 
                  : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
              }`}
            >
              <Icon size={22} className={isActive ? "text-[#5EE6FE]" : ""} />
              {sidebarOpen && (
                <span className={`font-medium ${isActive ? "text-gray-800" : "text-blue-100"}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-blue-600 bg-blue-800/50 m-3 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#5EE6FE] to-[#4CD4EC] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">DR</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Dr. Veterinarian</p>
              <p className="text-blue-200 text-xs">Veterinarian</p>
            </div>
          )}
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg transition-colors">
          <LogOut size={18} />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
