import React from "react";

const ViewDetailsModal = ({ appointment, closeModal }) => {

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Time TBD';
    
    if (timeStr.includes('PM') || timeStr.includes('AM')) {
      return timeStr;
    }
    
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatAppointmentDate = (dateString) => {
    try {
      let date;
      
      if (dateString.includes("•")) {
        const [datePart] = dateString.split(" • ");
        date = new Date(datePart);
      } else if (dateString.includes("-")) {
        const [datePart, timePart] = dateString.split(" - ");
        date = new Date(datePart);
        
        if (timePart && !timePart.includes('PM') && !timePart.includes('AM')) {
          const formattedTime = formatTime(timePart);
          return {
            month: date.toLocaleString("default", { month: "short" }),
            day: date.getDate(),
            weekday: date.toLocaleString("default", { weekday: "long" }),
            fullDate: date,
            displayDate: `${new Date(datePart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${formattedTime}`
          };
        }
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date)) {
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
      return null;
    }
  };

  const getFormattedDate = () => {
    const formatted = formatAppointmentDate(appointment.date);
    return formatted?.displayDate || appointment.date;
  };

  return (
    <>
      <div onClick={closeModal} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 animate-popUp p-4">
        <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[90%] sm:max-w-sm md:max-w-md text-gray-800 relative">
          <button 
            onClick={closeModal} 
            className="absolute top-2 right-3 sm:top-3 sm:right-4 text-gray-500 hover:text-gray-800 text-2xl sm:text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            ×
          </button>
          
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center text-[#00C3E3]">Appointment Details</h2>

          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-semibold min-w-[100px]">Pet Name:</span>
              <span className="break-words">{appointment.petName}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-semibold min-w-[100px]">Owner Name:</span>
              <span className="break-words">{appointment.ownerName}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-semibold min-w-[100px]">Service:</span>
              <span className="break-words">{appointment.type}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-semibold min-w-[100px]">Date & Time:</span>
              <span className="break-words text-xs sm:text-sm">{getFormattedDate()}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-semibold min-w-[100px]">Status:</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                appointment.status === "Upcoming" ? "bg-[#E0F9FF] text-[#00B8D4]" : 
                appointment.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                appointment.status === "Done" ? "bg-green-100 text-green-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {appointment.status}
              </span>
            </div>
            
            {appointment.notes && (
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Notes:</span>
                <span className="break-words text-xs sm:text-sm bg-gray-50 p-2 rounded-lg">{appointment.notes}</span>
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-5 flex justify-center">
            <button 
              onClick={closeModal} 
              className="bg-[#5EE6FE] text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-[#3ecbe0] transition-all text-sm sm:text-base w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDetailsModal;