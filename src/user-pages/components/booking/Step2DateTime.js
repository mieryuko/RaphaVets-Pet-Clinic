import React, { useEffect, useState } from "react";
import { format, isSameMonth, isSameDay } from "date-fns";
import api from "../../../api/axios";

export default function Step2DateTime({
  selectedService,
  currentMonth,
  prevMonth,
  nextMonth,
  calendar,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  goToStep,
  isPast
}) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [pastSlots, setPastSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch time slots from backend
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const res = await api.get("/appointment/time");
        
        const slots = res.data.map(slot => ({
          raw: slot.scheduleTime,
          formatted: formatTime(slot.scheduleTime)
        }));
        
        setTimeSlots(slots);
      } catch (err) {
        console.error("❌ Failed to load time slots:", err);
      }
    };
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const res = await api.get(`/appointment/booked-slots?date=${formattedDate}`);
        
        // Handle the new response structure
        setBookedSlots(res.data.bookedSlots || []);
        setPastSlots(res.data.pastSlots || []);
        
        // Clear selected time if it's now unavailable
        if (selectedTime) {
          if (res.data.bookedSlots.includes(selectedTime) || 
              res.data.pastSlots.includes(selectedTime)) {
            setSelectedTime("");
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch booked slots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, selectedTime, setSelectedTime]);

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const isTimeSlotAvailable = (rawTime) => {
    return !bookedSlots.includes(rawTime) && !pastSlots.includes(rawTime);
  };

  const getTimeSlotStatus = (rawTime) => {
    if (bookedSlots.includes(rawTime)) return 'booked';
    if (pastSlots.includes(rawTime)) return 'past';
    return 'available';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
      {/* Calendar */}
      <div className="lg:flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Selected service</div>
            <div className="text-sm sm:text-md font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-full">
              {selectedService?.label || "-"}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button onClick={prevMonth} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100">
              <i className="fa-solid fa-chevron-left text-xs sm:text-sm" />
            </button>
            <div className="text-xs sm:text-sm font-semibold whitespace-nowrap">{format(currentMonth, "MMMM yyyy")}</div>
            <button onClick={nextMonth} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100">
              <i className="fa-solid fa-chevron-right text-xs sm:text-sm" />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-xs sm:text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
            <div key={w} className="text-center text-[10px] sm:text-xs text-gray-400 py-1 sm:py-2">{w}</div>
          ))}

          {calendar.map((week, wi) =>
            week.map((day, di) => {
              const isDisabled = isPast(day) || !isSameMonth(day, currentMonth);
              const selected = selectedDate && isSameDay(day, selectedDate);
              return (
                <button
                  key={`${wi}-${di}`}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedDate(day);
                      setSelectedTime("");
                    }
                  }}
                  className={`h-8 sm:h-10 md:h-12 flex items-center justify-center rounded-md transition text-xs sm:text-sm ${
                    !isSameMonth(day, currentMonth) ? "text-gray-300" : ""
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-[#EEF8FA]"} ${
                    selected ? "bg-[#5EE6FE] text-white" : "bg-white"
                  }`}
                >
                  <div>{format(day, "d")}</div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Time slots */}
      <div className="lg:w-64 xl:w-72 bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="text-xs sm:text-sm text-gray-500 mb-2">Available time slots</div>
        {!selectedDate && <div className="text-xs sm:text-sm text-gray-400">Choose a date to see slots</div>}

        {selectedDate && (
          <>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-2 truncate">
              {format(selectedDate, "EEEE, MMM d")}
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#5EE6FE] border-r-transparent"></div>
                <div className="text-xs text-gray-400 mt-2">Loading slots...</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {timeSlots.length === 0 ? (
                  <div className="col-span-2 text-gray-400 text-xs sm:text-sm py-2 text-center">No time slots available</div>
                ) : (
                  timeSlots.map((slot) => {
                    const status = getTimeSlotStatus(slot.raw);
                    const active = selectedTime === slot.raw;
                    const isDisabled = status !== 'available';
                    
                    let buttonClass = "text-xs sm:text-sm rounded-lg py-1.5 sm:py-2 px-1 sm:px-2 transition ";
                    
                    if (active) {
                      buttonClass += "bg-[#5EE6FE] text-white shadow-md";
                    } else if (status === 'booked') {
                      buttonClass += "bg-gray-100 text-gray-400 cursor-not-allowed";
                    } else if (status === 'past') {
                      buttonClass += "bg-gray-100 text-gray-400 cursor-not-allowed";
                    } else {
                      buttonClass += "bg-white border border-gray-100 hover:bg-[#EEF8FA] cursor-pointer";
                    }
                    
                    return (
                      <button
                        key={slot.raw}
                        onClick={() => !isDisabled && setSelectedTime(slot.raw)}
                        disabled={isDisabled}
                        className={buttonClass}
                      >
                        <span className="block text-center">{slot.formatted}</span>
                        {status === 'booked' && (
                          <span className="block text-[8px] sm:text-[10px] text-red-400"></span>
                        )}
                        {status === 'past' && (
                          <span className="block text-[8px] sm:text-[10px] text-gray-400"></span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            <div className="mt-3 sm:mt-4">
              <button
                disabled={!selectedTime || loading}
                onClick={() => goToStep(3)}
                className={`w-full py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition ${
                  selectedTime && !loading
                    ? "bg-[#5EE6FE] text-white hover:bg-[#3ecbe0]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next: Your details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}