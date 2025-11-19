import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = ({ title, subtitle }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent w-64 transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-[#5EE6FE] transition-colors">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#5EE6FE] to-[#4CD4EC] rounded-full flex items-center justify-center shadow-sm">
              <User size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Dr. Veterinarian</p>
              <p className="text-xs text-gray-500">Veterinarian</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
