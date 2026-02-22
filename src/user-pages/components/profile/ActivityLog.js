import React, { useState, useEffect } from "react";
import api from "../../../api/axios";

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivityLog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/activity-log/${userId}`);
        setLogs(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching activity log:", err.response?.data || err.message);
        setError("Failed to load activity log");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLog();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EE6FE]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 text-sm bg-red-50 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#5EE6FE] mb-2">Activity Log</h2>
      <p className="text-gray-600 text-sm mb-4">
        Track your recent activities and account actions here.
      </p>

      {/* Logs list */}
      <div className="flex flex-col gap-3">
        {logs.map((log, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-[#F9FBFB] border border-[#E6F5F7] rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: log.color }}
              >
                <i className={`fa-solid ${log.icon}`}></i>
              </div>
              <div>
                <p className="text-gray-800 font-medium">{log.type}</p>
                <p className="text-gray-500 text-sm">{log.description}</p>
              </div>
            </div>
            <span className="text-gray-400 text-xs whitespace-nowrap">
              {log.date}
            </span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {logs.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          No activity recorded yet.
        </div>
      )}
    </div>
  );
}

export default ActivityLog;