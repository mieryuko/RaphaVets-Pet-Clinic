import React, { useState } from "react";

function ConnectedDevices() {
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome on Windows", location: "Philippines", time: "Now", active: true },
    { id: 2, device: "Mobile App - iPhone 13", location: "Manila", time: "2 hours ago", active: true },
    { id: 3, device: "Safari on MacBook", location: "Cebu", time: "2 days ago", active: false },
  ]);

  const handleLogout = (id) => {
    setSessions(prev => prev.map(session => 
      session.id === id ? { ...session, active: false } : session
    ));
  };

  const handleLogoutAll = () => {
    if (window.confirm('Are you sure you want to log out all other devices?')) {
      setSessions(prev => prev.map(session => ({ ...session, active: false })));
    }
  };

  const activeSessions = sessions.filter(s => s.active);
  const inactiveSessions = sessions.filter(s => !s.active);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-[#5EE6FE]">Connected Devices</h2>
        {activeSessions.length > 1 && (
          <button
            onClick={handleLogoutAll}
            className="text-xs sm:text-sm text-[#5EE6FE] hover:text-[#47c0d7] font-medium"
          >
            Log out all other devices
          </button>
        )}
      </div>
      
      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
        Manage devices currently logged in to your account.
      </p>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Active Sessions ({activeSessions.length})
          </h3>
          <div className="flex flex-col gap-2 sm:gap-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#F8FBFB] p-3 sm:p-4 rounded-lg border border-[#E6F5F7] gap-3 sm:gap-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5EE6FE]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-laptop text-[#5EE6FE] text-sm sm:text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium text-sm sm:text-base truncate">{session.device}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {session.location} • <span className="text-green-600">{session.time}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleLogout(session.id)}
                  className="text-[#5EE6FE] hover:text-[#47c0d7] text-xs sm:text-sm font-semibold transition-all ml-11 sm:ml-0"
                >
                  Log out
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Previous Sessions
          </h3>
          <div className="flex flex-col gap-2">
            {inactiveSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 gap-2 sm:gap-0 opacity-75"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-laptop text-gray-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium text-sm truncate">{session.device}</p>
                    <p className="text-gray-400 text-xs">
                      {session.location} • {session.time}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs ml-11 sm:ml-0">Expired</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectedDevices;