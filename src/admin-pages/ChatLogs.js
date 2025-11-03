import React, { useState } from "react";

export default function ChatLogs() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const logs = [
    { id: 1, user: "Anna Cruz", message: "My dog keeps vomiting.", type: "Consultation", time: "10:30 AM" },
    { id: 2, user: "Ben Santos", message: "How do I book a schedule?", type: "Inquiry", time: "11:00 AM" },
    { id: 3, user: "Vet - Dr. Reyes", message: "Please bring Milo tomorrow.", type: "Response", time: "11:15 AM" },
  ];

  const filtered = logs.filter(
    (log) =>
      (filter === "All" || log.type === filter) &&
      (log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.message.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#2FA394]">Chat Logs</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search user or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE] w-full sm:w-72"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
        >
          <option>All</option>
          <option>Consultation</option>
          <option>Inquiry</option>
          <option>Response</option>
        </select>
      </div>

      {/* Chat Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Message</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((log) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{log.user}</td>
                  <td className="px-4 py-3 text-gray-600">{log.message}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.type === "Consultation"
                          ? "bg-[#E3FAF7] text-[#2FA394]"
                          : log.type === "Response"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{log.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
