import React from "react";

export default function Topbar() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3">
        <h2 className="text-lg font-semibold text-[#2FA394]">Admin Dashboard</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="hidden sm:block border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]"
          />
          <div className="w-10 h-10 rounded-full bg-gray-200" />
        </div>
      </div>
    </header>
  );
}
