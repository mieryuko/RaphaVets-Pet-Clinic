import React from "react";

const AppointmentTab = ({ appointments, appointmentFilter, setAppointmentFilter, handleViewDetails }) => {

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Time TBD';
    
    // Handle both "12:00:00" and "12:00 PM" formats
    if (timeStr.includes('PM') || timeStr.includes('AM')) {
      return timeStr; // Already formatted
    }
    
    // Format "12:00:00" to "12:00 PM"
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatAppointmentDate = (dateString) => {
    try {
      // Handle different date formats that might come from your API
      let date;
      
      if (dateString.includes("•")) {
        // Format: "Nov 22, 2025 • 12:00 PM"
        const [datePart] = dateString.split(" • ");
        date = new Date(datePart);
      } else if (dateString.includes("-")) {
        // Format: "2025-11-22 - 12:00:00"
        const [datePart, timePart] = dateString.split(" - ");
        date = new Date(datePart);
        
        // Format the time part if it's in "12:00:00" format
        if (timePart && !timePart.includes('PM') && !timePart.includes('AM')) {
          const formattedTime = formatTime(timePart);
          return {
            month: date.toLocaleString("default", { month: "short" }),
            day: date.getDate(),
            weekday: date.toLocaleString("default", { weekday: "long" }),
            fullDate: date,
            displayTime: formattedTime
          };
        }
      } else {
        // Assume it's already a proper date string
        date = new Date(dateString);
      }

      if (isNaN(date)) {
        console.warn("Invalid date:", dateString);
        return null;
      }

      return {
        month: date.toLocaleString("default", { month: "short" }),
        day: date.getDate(),
        weekday: date.toLocaleString("default", { weekday: "long" }),
        fullDate: date
      };
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Extract time from date string
  const getTimeFromDateString = (dateString) => {
    if (dateString.includes("•")) {
      return dateString.split(" • ")[1] || "Time TBD";
    } else if (dateString.includes("-")) {
      const timePart = dateString.split(" - ")[1] || "Time TBD";
      // Format the time if it's in "12:00:00" format
      return formatTime(timePart);
    }
    return "Time TBD";
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(appt => {
    if (appointmentFilter === "All") return true;
    
    const status = appt.status?.toLowerCase() || "";
    const filter = appointmentFilter.toLowerCase();
    return status.includes(filter);
  });

  console.log(filteredAppointments);
  return (
    <div className="flex flex-col flex-1 gap-3">
      {/* Filter Buttons */}
      <div className="flex gap-3 mb-3 flex-wrap">
        {["Upcoming", "Pending", "Done", "All"].map((status) => (
          <button
            key={status}
            onClick={() => setAppointmentFilter(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition 
              ${appointmentFilter === status
                ? "bg-[#5EE6FE] text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-[#d3f2fa]"
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fa-regular fa-calendar text-3xl mb-2 opacity-50"></i>
            <p>No {appointmentFilter.toLowerCase()} appointments found</p>
          </div>
        ) : (
          filteredAppointments.map((appt) => {
            const formattedDate = formatAppointmentDate(appt.date);
            const time = getTimeFromDateString(appt.date);

            return (
              <div
                key={appt.id}
                className="bg-white/70 backdrop-blur-md border border-[#5EE6FE]/30 p-4 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all cursor-pointer"
                onClick={() => handleViewDetails(appt)}
              >
                {/* LEFT: DATE */}
                <div className="flex flex-col items-center justify-center w-16 text-center bg-[#EFFFFF] rounded-lg py-2 border border-[#5EE6FE]/20 shadow-sm">
                  {formattedDate ? (
                    <>
                      <span className="text-xs font-semibold text-[#5EE6FE] uppercase tracking-wide">
                        {formattedDate.month}
                      </span>
                      <span className="text-xl font-bold text-gray-800 leading-tight">
                        {formattedDate.day}
                      </span>
                      <span className="text-[10px] text-gray-500 capitalize">
                        {formattedDate.weekday}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">Invalid Date</span>
                  )}
                </div>

                {/* RIGHT: DETAILS */}
                <div className="flex justify-between items-center flex-1 ml-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {appt.petName} — {appt.type}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <i className="fa-solid fa-clock text-[#5EE6FE]"></i>
                      {time} &nbsp;•&nbsp; 
                      <span className={`font-medium ${
                        appt.status === 'Upcoming' ? 'text-green-600' :
                        appt.status === 'Pending' ? 'text-yellow-600' :
                        appt.status === 'Done' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {appt.status || "Upcoming"}
                      </span>
                    </p>
                    {appt.ownerName && (
                      <p className="text-xs text-gray-400 mt-1">
                        <i className="fa-solid fa-user text-[#5EE6FE]"></i>
                        {appt.ownerName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card click
                      handleViewDetails(appt);
                    }}
                    className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#3ecbe0] transition-all whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AppointmentTab;