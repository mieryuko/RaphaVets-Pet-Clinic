import React from "react";

const ViewDetailsModal = ({ appointment, closeModal }) => {

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
            displayDate: `${datePart} • ${formattedTime}`
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
        fullDate: date,
        displayDate: dateString
      };
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Get formatted date for display
  const getFormattedDate = () => {
    const formatted = formatAppointmentDate(appointment.date);
    return formatted?.displayDate || appointment.date;
  };

  return (
    <>
      <div onClick={closeModal} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 animate-popUp">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[400px] text-gray-800 relative">
          <button onClick={closeModal} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl">×</button>
          <h2 className="text-lg font-bold mb-4 text-center text-[#00C3E3]">Appointment Details</h2>

          <div className="space-y-3 text-sm">
            <p><span className="font-semibold">Pet Name:</span> {appointment.petName}</p>
            <p><span className="font-semibold">Owner Name:</span> {appointment.ownerName}</p>
            <p><span className="font-semibold">Service:</span> {appointment.type}</p>
            <p><span className="font-semibold">Date & Time:</span> {getFormattedDate()}</p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                appointment.status === "Upcoming" ? "bg-[#E0F9FF] text-[#00B8D4]" : 
                appointment.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                appointment.status === "Done" ? "bg-green-100 text-green-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {appointment.status}
              </span>
            </p>
            {appointment.notes && <p><span className="font-semibold">Notes:</span> {appointment.notes}</p>}
          </div>

          <div className="mt-5 flex justify-center">
            <button onClick={closeModal} className="bg-[#5EE6FE] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#3ecbe0] transition-all">Close</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDetailsModal;