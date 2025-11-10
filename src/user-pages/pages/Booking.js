import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isBefore,
} from "date-fns";

import StepPill from "../components/booking/StepPill";
import Step1Service from "../components/booking/Step1Service";
import Step2DateTime from "../components/booking/Step2DateTime";
import Step3Details from "../components/booking/Step3Details";
import Step4Review from "../components/booking/Step4Review";
import Step5Success from "../components/booking/Step5Success";
import AppointmentSummary from "../components/booking/AppointmentSummary";
import TipsCard from "../components/booking/TipsCard";
import api from "../../api/axios"; // your axios instance

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

const getTimeSlotsForDate = (date) => {
  return ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"];
};

function Booking() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [confirmed, setConfirmed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // OWNER INFO
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
  });

  // Fetch pets
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/pets", { headers: { Authorization: `Bearer ${token}` } });
        setPets(res.data);
      } catch (err) {
        console.error("Failed to fetch pets:", err);
      }
    };
    fetchPets();
  }, []);

  // Fetch user profile once
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        if (!userId || !token) return;

        const res = await api.get(`/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // Calendar generation
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

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToStep = (s) => setStep(s);

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime("");
    setSelectedPet(null);
    setConfirmed(false);
  };

  const handleConfirm = () => {
  console.log("handleConfirm called");
  setConfirmed(true);
  setStep(5);
  console.log("Step after confirm:", step);
};


  useEffect(() => {
    if (selectedService) setStep(2);
  }, [selectedService]);

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
          <div className="flex items-center gap-3">
            <img src="./images/logo.png" alt="Sortify Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-gray-800">RaphaVets Pet Clinic</h1>
          </div>
          <div className="hidden sm:block text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Book an Appointment</h2>
            <p className="text-sm text-gray-500">Schedule your pet’s next visit easily</p>
          </div>
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
          {/* Left Column: Steps */}
          <div className="lg:col-span-2 space-y-6">
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

            <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              {step === 1 && (
                <Step1Service 
                  serviceTypes={SERVICE_TYPES} 
                  selectedService={selectedService} 
                  setSelectedService={setSelectedService} 
                  goToStep={goToStep}
                />
              )}

              {step === 2 && (
                <Step2DateTime
                  selectedService={selectedService}
                  currentMonth={currentMonth}
                  calendar={calendar}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  prevMonth={prevMonth}
                  nextMonth={nextMonth}
                  goToStep={goToStep}
                  isPast={isPast}
                  getTimeSlotsForDate={getTimeSlotsForDate} 
                />
              )}

              {step === 3 && (
                <Step3Details 
                  goToStep={goToStep} 
                  pets={pets} 
                  selectedPet={selectedPet} 
                  setSelectedPet={setSelectedPet} 
                  userData={userData} 
                />
              )}

              {step === 4 && (
                <Step4Review 
                  selectedService={selectedService} 
                  selectedDate={selectedDate} 
                  selectedTime={selectedTime} 
                  selectedPet={selectedPet}
                  handleConfirm={handleConfirm} 
                  goToStep={goToStep} 
                  ownerInfo={userData} 
                />
              )}

              {step === 5 && confirmed && (
                <Step5Success resetBooking={resetBooking} navigate={navigate} />
              )}
            </motion.div>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="space-y-4">
            <AppointmentSummary 
              step={step} 
              selectedService={selectedService} 
              selectedDate={selectedDate} 
              selectedTime={selectedTime} 
              selectedPet={selectedPet} 
              ownerInfo={userData} 
            />
            <TipsCard />
          </aside>
        </div>
      </div>

      {/* Toast */}
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
              <button onClick={() => setShowCancelModal(false)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300">
                No
              </button>
              <button onClick={() => navigate("/user-home")} className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0] transition-all duration-300">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;
