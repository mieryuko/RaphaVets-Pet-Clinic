  import React from "react";
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import LoginPage from "./LoginPage";
  import SignupPage from "./SignupPage";
  import HomePage from "./guest-pages/HomePage";

  import Home from "./user-pages/pages/Home";
  import Profile from "./user-pages/pages/Profile";
  import PetDetails from "./user-pages/pages/PetDetails";
  import Booking from "./user-pages/pages/Booking";
  import BreedDetect from "./user-pages/pages/BreedDetect";
  import Videos from "./user-pages/pages/Videos";
  import PetTips from "./user-pages/pages/PetTips";
  import Forum from "./user-pages/pages/Forum";

  /*admin*/
  import AdminLayout from "./admin-pages/AdminLayout";
  import Dashboard from "./admin-pages/pages/Dashboard";
  import PetPatientManagement from "./admin-pages/pages/PetPatientManagement";
  import Appointments from "./admin-pages/pages/Appointments";
  import Tools from "./admin-pages/pages/DiagnosticTools";
  import ContentManager from "./admin-pages/pages/ContentManagement";
  import Reports from "./admin-pages/pages/Reports";
  import AdminSettings from "./admin-pages/pages/AdminSetting";

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />

          /*user*/
          <Route path="/user-home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/breed-detect" element={<BreedDetect />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/pet-tips" element={<PetTips />} />
          <Route path="/forum" element={<Forum />} />

          /*admin*/
          <Route path="/admin-pages" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pet-management" element={<PetPatientManagement />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="tools" element={<Tools />} />
            <Route path="content-manager" element={<ContentManager />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

        </Routes>
      </BrowserRouter>
    );
  }

  export default App;