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

  // Fetch time slots from backend
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const res = await api.get("/appointment/time");
        console.log('Time slots response:', res.data);
        
        // Store both raw and formatted times
        const slots = res.data.map(slot => ({
          raw: slot.scheduleTime, // "08:00:00" - using scheduleTime field
          formatted: formatTime(slot.scheduleTime) // "8:00 AM"
        }));
        
        setTimeSlots(slots);
      } catch (err) {
        console.error("❌ Failed to load time slots:", err);
      }
    };
    fetchTimeSlots();
  }, []);

  // Fetch booked slots whenever date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;
      
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const res = await api.get(`/appointment/booked-slots?date=${formattedDate}`);
        console.log('Booked slots response:', res.data);
        
        // Store booked slots in raw format for comparison
        setBookedSlots(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch booked slots:", err);
      }
    };

    fetchBookedSlots();
  }, [selectedDate]);

  // Helper to format "08:00:00" → "8:00 AM"
  const formatTime = (timeStr) => {
    const [hour, minute, second] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(second || 0);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Helper to check if a time slot is booked
  const isTimeBooked = (rawTime) => {
    return bookedSlots.includes(rawTime);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar (unchanged) */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Selected service</div>
            <div className="text-md font-semibold text-gray-800">{selectedService?.label}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100">
              <i className="fa-solid fa-chevron-left" />
            </button>
            <div className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</div>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100">
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
            <div key={w} className="text-center text-xs text-gray-400 py-2">{w}</div>
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
                  className={`h-12 flex items-center justify-center rounded-md transition ${
                    !isSameMonth(day, currentMonth) ? "text-gray-300" : ""
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-[#EEF8FA]"} ${
                    selected ? "bg-[#5EE6FE] text-white" : "bg-white"
                  }`}
                >
                  <div className="text-sm">{format(day, "d")}</div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Time slots */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Available time slots</div>
        {!selectedDate && <div className="text-sm text-gray-400">Choose a date to see slots</div>}

        {selectedDate && (
          <>
            <div className="text-xs text-gray-500 mb-2">{format(selectedDate, "EEEE, MMM d")}</div>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.length === 0 ? (
                <div className="text-gray-400 text-sm">No time slots available</div>
              ) : (
                timeSlots.map((slot) => {
                  const active = selectedTime === slot.raw;
                  const isBooked = isTimeBooked(slot.raw);
                  
                  return (
                    <button
                      key={slot.raw}
                      onClick={() => !isBooked && setSelectedTime(slot.raw)}
                      disabled={isBooked}
                      className={`text-sm rounded-lg py-2 px-2 transition ${
                        active
                          ? "bg-[#5EE6FE] text-white shadow-md"
                          : isBooked
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-100 hover:bg-[#EEF8FA]"
                      }`}
                    >
                      {slot.formatted}
                      {isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-4">
              <button
                disabled={!selectedTime}
                onClick={() => goToStep(3)}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  selectedTime
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