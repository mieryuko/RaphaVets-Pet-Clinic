import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import HomePage from "./guest-pages/HomePage";
import ChangePassword from "./ChangePassword";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/*user*/}
        <Route path="/user-home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pet/:id" element={<PetDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/breed-detect" element={<BreedDetect />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/pet-tips" element={<PetTips />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/support" element={<Support />} />
        <Route path="/feedback" element={<Feedback />} />

        {/*admin*/}
        <Route path="/admin-pages" element={<AdminLayout />}>
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
        <Route path="/vet" element={<VetLayout />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;