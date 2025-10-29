/* dl muna sa terminal npm install date-fns */

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isBefore,
  parseISO,
} from "date-fns";


const SERVICE_TYPES = [
  { id: "consult", label: "Consultation", note: "General check-up" },
  { id: "surgery", label: "Basic Soft Tissue Surgery", note: "Scheduled procedure" },
  { id: "cbc", label: "CBC", note: "Complete blood count" },
  { id: "microchip", label: "Microchipping", note: "Permanent ID implant" },
  { id: "deworm", label: "Deworming", note: "Parasite control" },
  { id: "vax", label: "Vaccination", note: "Routine vaccines" },
  { id: "chem", label: "Blood Chemistry Lab", note: "Detailed panel" },
  { id: "vhc", label: "Veterinary Health Certificate", note: "Travel & export docs" },
  { id: "confinement", label: "Confinement", note: "Overnight observation" },
  { id: "dental", label: "Dental Prophylaxis", note: "Cleaning & check" },
];

function Booking() {

  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [step, setStep] = useState(1);

  const [selectedService, setSelectedService] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [selectedTime, setSelectedTime] = useState("");

  const [petName, setPetName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerContact, setOwnerContact] = useState("");

  const [confirmed, setConfirmed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // generate calendar using date-fns
  const calendar = useMemo(() => {
    const startMonth = startOfMonth(currentMonth);
    const endMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 0 });
    const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });

    const rows = [];
    let day = startDate;
    while (day <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [currentMonth]);

  function getTimeSlotsForDate(date) {
    if (!date) return [];
    // disabled past dates
    const now = new Date();
    if (isBefore(date, new Date(now.getFullYear(), now.getMonth(), now.getDate()))) return [];

    const weekdaySlots = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
    ];
    const weekendSlots = ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];
    const day = date.getDay(); 
    return day === 0 || day === 6 ? weekendSlots : weekdaySlots;
  }

  // navigation
  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  // step helpers
  const goToStep = (s) => setStep(s);

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime("");
    setPetName("");
    setOwnerName("");
    setOwnerContact("");
    setConfirmed(false);
  };

  // on confirm
  const handleConfirm = () => {
    setConfirmed(true);
    setShowToast(true);
    setStep(5);
    setTimeout(() => setShowToast(false), 3500);
  };

  useEffect(() => {
    if (selectedService) setStep(2);
  }, [selectedService]);

  // UI helpers
  const isPast = (d) => {
    const today = new Date();
    const compare = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return isBefore(d, compare);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-40 w-full flex items-center justify-between backdrop-blur-lg bg-white/70 border border-white/50 shadow-md rounded-2xl px-6 py-4 mb-8"
        >
          {/* LEFT: LOGO + NAME */}
          <div className="flex items-center gap-3">
              <img src="./images/logo.png" alt="Sortify Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-gray-800">RaphaVets Pet Clinic</h1>
          </div>

          {/* CENTER: PAGE TITLE */}
          <div className="hidden sm:block text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              Book an Appointment
            </h2>
            <p className="text-sm text-gray-500">Schedule your pet’s next visit easily</p>
          </div>

          {/* RIGHT: ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all duration-300"
            >
              <i className="fa-solid fa-xmark"></i>
              <span>Cancel</span>
            </button>

            <button
              onClick={resetBooking}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5EE6FE] text-white font-semibold hover:bg-[#3ecbe0] shadow-md transition-all duration-300"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span>Reset</span>
            </button>
          </div>
        </motion.header>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stepper */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <StepPill number={1} active={step === 1} done={step > 1}>Select service</StepPill>
              <div className="flex-1 h-0.5 bg-gray-200 mx-3 relative">
                <div className="absolute left-0 top-[-6px]">
                  <div style={{ width: `${Math.min(((step - 1) / 3) * 100, 100)}%` }} className="h-0.5 bg-[#5EE6FE]" />
                </div>
              </div>
              <StepPill number={2} active={step === 2} done={step > 2}>Pick date & time</StepPill>
              <div className="flex-1 h-0.5 bg-gray-200 mx-3 relative">
                <div style={{ width: `${Math.min(((step - 2) / 3) * 100, 100)}%` }} className="h-0.5 bg-[#5EE6FE]" />
              </div>
              <StepPill number={3} active={step === 3} done={step > 3}>Your details</StepPill>
              <div className="flex-1 h-0.5 bg-gray-200 mx-3 relative hidden lg:block">
                <div style={{ width: `${Math.min(((step - 3) / 3) * 100, 100)}%` }} className="h-0.5 bg-[#5EE6FE]" />
              </div>
              <StepPill number={4} active={step === 4} done={step > 4}>Review</StepPill>
            </div>

            {/* step content card */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">Choose a service</h2>
                  <p className="text-sm text-gray-500">Tap a card to choose.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {SERVICE_TYPES.map((t) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedService(t)}
                        className={`relative text-left p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md focus:outline-none ${
                          selectedService?.id === t.id
                            ? "border-[#5EE6FE] bg-[#EAFBFD] shadow-lg"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white border border-gray-100">
                            <i className="fa-solid fa-paw text-[#5EE6FE]" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{t.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{t.note}</div>
                          </div>
                        </div>
                        <div className="absolute right-3 top-3 text-xs text-gray-400">
                          {t.id === "consult" ? "30–45 min" : "Varies"}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                      {/* weekdays */}
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
                        <div key={w} className="text-center text-xs text-gray-400 py-2">
                          {w}
                        </div>
                      ))}

                      {/* dates */}
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
                              className={`h-12 flex items-center justify-center rounded-md transition-all ${
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

                  {/* timeslot column */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-2">Available time slots</div>
                    {!selectedDate && <div className="text-sm text-gray-400">Choose a date to see slots</div>}

                    {selectedDate && (
                      <>
                        <div className="text-xs text-gray-500 mb-2">{format(selectedDate, "EEEE, MMM d")}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {getTimeSlotsForDate(selectedDate).map((slot) => {
                            const disabled = false; 
                            const active = selectedTime === slot;
                            return (
                              <button
                                key={slot}
                                onClick={() => !disabled && setSelectedTime(slot)}
                                className={`text-sm rounded-lg py-2 px-2 transition ${
                                  active
                                    ? "bg-[#5EE6FE] text-white shadow-md"
                                    : "bg-white border border-gray-100 hover:bg-[#EEF8FA]"
                                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4">
                          <button
                            disabled={!selectedTime}
                            onClick={() => setStep(3)}
                            className={`w-full py-3 rounded-lg font-semibold transition ${
                              selectedTime ? "bg-[#5EE6FE] text-white hover:bg-[#3ecbe0]" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Next: Your details
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">Pet & Owner details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Pet name</label>
                      <input
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="e.g., Milo"
                        className="w-full mt-2 p-3 border border-gray-100 rounded-lg focus:ring-1 focus:ring-[#5EE6FE]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Owner name</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g., Juan Dela Cruz"
                        className="w-full mt-2 p-3 border border-gray-100 rounded-lg focus:ring-1 focus:ring-[#5EE6FE]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-sm text-gray-600">Contact number</label>
                      <input
                        type="tel"
                        value={ownerContact}
                        onChange={(e) => setOwnerContact(e.target.value)}
                        placeholder="+63 9xx xxx xxxx"
                        className="w-full mt-2 p-3 border border-gray-100 rounded-lg focus:ring-1 focus:ring-[#5EE6FE]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      Back
                    </button>

                    <button
                      onClick={() => {
                        if (!petName || !ownerName || !ownerContact) return;
                        setStep(4);
                      }}
                      className={`px-6 py-3 rounded-lg font-semibold transition ${
                        petName && ownerName && ownerContact ? "bg-[#5EE6FE] text-white hover:bg-[#3ecbe0]" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Review
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">Review appointment</h2>
                  <div className="p-4 bg-white border border-gray-100 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Service</div>
                        <div className="font-semibold">{selectedService?.label}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Date</div>
                        <div className="font-semibold">{selectedDate ? format(selectedDate, "MMM d, yyyy") : "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Time</div>
                        <div className="font-semibold">{selectedTime || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Pet</div>
                        <div className="font-semibold">{petName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Owner</div>
                        <div className="font-semibold">{ownerName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Contact</div>
                        <div className="font-semibold">{ownerContact}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Back</button>
                    <button onClick={handleConfirm} className="px-6 py-3 rounded-lg bg-[#5EE6FE] text-white font-semibold hover:bg-[#3ecbe0]">
                      Confirm Appointment
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && confirmed && (
                <div className="text-center py-8">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block bg-[#E6FFFB] text-[#0f766e] px-4 py-3 rounded-lg mb-4 shadow-sm">
                    Appointment booked
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800">All set!</h3>
                  <p className="text-gray-500 mt-2">We've emailed the appointment details and added a record to your account.</p>

                  <div className="mt-6 flex justify-center gap-3">
                    <button onClick={() => { /* navigate to appointments screen if exists */ resetBooking(); }} className="px-5 py-2 rounded-lg border border-gray-200">Book another</button>
                    <button onClick={() => { /* view appointments */ }} className="px-5 py-2 rounded-lg bg-[#5EE6FE] text-white">View my appointments</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-500">Appointment summary</div>
              <div className="mt-3 space-y-2">
                <div className="text-xs text-gray-400">Service</div>
                <div className="font-semibold">{selectedService?.label || "-"}</div>

                <div className="text-xs text-gray-400 mt-3">Date & Time</div>
                <div className="font-semibold">{selectedDate ? `${format(selectedDate, "MMM d, yyyy")} • ${selectedTime || "—"}` : "-"}</div>

                <div className="text-xs text-gray-400 mt-3">Pet</div>
                <div className="font-semibold">{petName || "-"}</div>

                <div className="text-xs text-gray-400 mt-3">Contact</div>
                <div className="font-semibold">{ownerContact || "-"}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-500">Tips</div>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>• Arrive 10 minutes early for check-in.</li>
                <li>• Bring vaccination records for vaccines & surgery.</li>
                <li>• For surgeries, follow pre-op fasting guidance if provided.</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-600">
              <div className="font-semibold mb-2">Need help?</div>
              <div className="text-gray-500">Contact our clinic for adjustments and special requests.</div>
            </div>
          </aside>
        </div>
      </div>

      {/* toast */}
      {showToast && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fixed right-6 bottom-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
          Appointment scheduled
        </motion.div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[320px] shadow-lg text-center animate-popUp">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Cancel Booking?</h2>
            <p className="text-gray-600 text-sm mb-5">
              Your progress will be lost. Are you sure you want to return home?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                No
              </button>

              <button
                onClick={() => navigate("/user-home")}
                className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0] transition-all duration-300"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


function StepPill({ number, active, done, children }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${done ? "bg-[#5EE6FE] text-white" : active ? "bg-[#EAFBFD] text-[#0589a0]" : "bg-white text-gray-600 border border-gray-100"}`}>
        {number}
      </div>
      <div className={`text-sm ${active || done ? "text-gray-800" : "text-gray-500"}`}>{children}</div>
    </div>
  );
}

export default Booking;
