import React, { useState, useEffect } from "react";
import api from "../../../api/axios";

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivityLog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/activity-log/${userId}?page=${page}&limit=10`);
        // make sure logs is always an array
        const fetchedLogs = Array.isArray(res.data.logs) ? res.data.logs : [];
        setLogs(prev => page === 1 ? fetchedLogs : [...prev, ...fetchedLogs]);
        setHasMore(res.data.hasMore);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching activity log:", err.response?.data || err.message);
        setError("Failed to load activity log");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLog();
  }, [userId, page]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const getIconForActivity = (type) => {
    const icons = {
      'login': 'fa-right-to-bracket',
      'logout': 'fa-right-from-bracket',
      'appointment': 'fa-calendar-check',
      'profile_update': 'fa-user-pen',
      'password_change': 'fa-lock',
      'pet_added': 'fa-paw',
      'pet_updated': 'fa-pen',
      'default': 'fa-circle-info'
    };
    return icons[type] || icons.default;
  };

  const getColorForActivity = (type) => {
    const colors = {
      'login': '#5EE6FE',
      'logout': '#FFB6C1',
      'appointment': '#00B8D4',
      'profile_update': '#FFA07A',
      'password_change': '#98D8C8',
      'pet_added': '#FFD700',
      'pet_updated': '#DDA0DD',
      'default': '#A9A9A9'
    };
    return colors[type] || colors.default;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EE6FE]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 text-sm bg-red-50 rounded-xl">
        <i className="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
        <p>{error}</p>
        <button 
          onClick={() => setPage(1)} 
          className="mt-3 px-4 py-2 bg-[#5EE6FE] text-white rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-[#5EE6FE]">Activity Log</h2>
        <p className="text-gray-600 text-xs sm:text-sm">
          Track your recent activities and account actions
        </p>
      </div>

      {/* Logs list */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {Array.isArray(logs) && logs.map((log, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#F9FBFB] border border-[#E6F5F7] rounded-xl shadow-sm hover:shadow-md p-3 sm:p-4 transition-all duration-300 gap-2 sm:gap-0"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: getColorForActivity(log.type) }}
              >
                <i className={`fa-solid ${getIconForActivity(log.type)} text-xs sm:text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium text-sm sm:text-base truncate">{log.type}</p>
                <p className="text-gray-500 text-xs sm:text-sm truncate">{log.description}</p>
              </div>
            </div>
            <span className="text-gray-400 text-[10px] sm:text-xs whitespace-nowrap ml-10 sm:ml-0">
              {formatDate(log.date)}
            </span>
          </div>
        ))}

        {/* Load more button */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-[#EAFBFD] text-[#5EE6FE] rounded-lg text-sm font-medium hover:bg-[#d3f2fa] transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Activities'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {logs.length === 0 && (
        <div className="text-center py-8 sm:py-10 text-gray-500">
          <i className="fa-solid fa-clock text-3xl sm:text-4xl mb-2 sm:mb-3 text-gray-300"></i>
          <p className="text-sm sm:text-base">No activity recorded yet.</p>
          <p className="text-xs text-gray-400 mt-1">Your actions will appear here</p>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;