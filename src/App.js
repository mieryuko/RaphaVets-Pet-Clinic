// App.js
import React from "react";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import HomePage from "./guest-pages/HomePage";
import ChangePassword from "./ChangePassword";

//Socket.io
import socket from "./socket";

/*user*/
import Home from "./user-pages/pages/Home";
import Profile from "./user-pages/pages/Profile";
import PetDetails from "./user-pages/pages/PetDetails";
import Booking from "./user-pages/pages/Booking";
import BreedDetect from "./user-pages/pages/BreedDetect";
import Videos from "./user-pages/pages/Videos";
import PetTips from "./user-pages/pages/PetTips";
import Forum from "./user-pages/pages/Forum";
import FAQs from "./user-pages/pages/FAQs";
import Support from "./user-pages/pages/Support";
import Feedback from "./user-pages/pages/Feedback";

/*admin*/
import AdminLayout from "./admin-pages/AdminLayout";
import Dashboard from "./admin-pages/pages/Dashboard";
import PetPatientManagement from "./admin-pages/pages/PetPatientManagement";
import Appointments from "./admin-pages/pages/AppointmentsVisits";
import ContentManager from "./admin-pages/pages/ContentManagement";
import Reports from "./admin-pages/pages/Reports";
import AdminSettings from "./admin-pages/pages/AdminSetting";
import AddAppointment from "./admin-pages/pages/AddAppointment";
import AddVisit from "./admin-pages/pages/AddVisit";

/*vet*/
import VetLayout from "./vet-pages/VetLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import MobileBlockPage from "./MobileBlockPage"; 

const ScreenSizeGuard = ({ children }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isLargeScreen) {
    return <MobileBlockPage />;
  }

  return children;
};

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Connect socket
    socket.connect();

    // Listen once
    socket.on("connect", () => {
      console.log("Connected to WebSocket:", socket.id);
    });

    // Cleanup (VERY IMPORTANT)
    return () => {
      socket.off("connect");
      socket.disconnect();
    };

  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/*user*/}
        <Route path="/user-home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/pet/:id" element={<ProtectedRoute><PetDetails /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/breed-detect" element={<ProtectedRoute><BreedDetect /></ProtectedRoute>} />
        <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
        <Route path="/pet-tips" element={<ProtectedRoute><PetTips /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
        <Route path="/faqs" element={<ProtectedRoute><FAQs /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

        {/*admin*/}
        <Route path="/admin-pages" element={
          <ProtectedRoute>
            <ScreenSizeGuard>
              <AdminLayout />
            </ScreenSizeGuard>
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pet-management" element={<PetPatientManagement />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/add" element={<AddAppointment />} />
          <Route path="visits/add" element={<AddVisit />} />
          <Route path="content-manager" element={<ContentManager />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/*vet*/}
        <Route path="/vet" element={<ProtectedRoute><VetLayout /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;