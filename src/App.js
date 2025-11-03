  import React from "react";
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import LoginPage from "./LoginPage";
  import SignupPage from "./SignupPage";
  import HomePage from "./guest-pages/HomePage";

  import Home from "./user-pages/pages/Home";
  import Profile from "./user-pages/pages/Profile";
  import PetDetails from "./user-pages/pages/PetDetails";
  import Booking from "./user-pages/pages/Booking";

  import Dashboard from "./admin-pages/Dashboard";
  import AdminLayout from "./admin-pages/AdminLayout";
  import Appointments from "./admin-pages/Appointments";
  import Patients from "./admin-pages/Patients";
  import MissingPets from "./admin-pages/MissingPets";
  import ContentManager from "./admin-pages/ContentManager";
  import RegressionTool from "./admin-pages/RegressionTool";
  import Reports from "./admin-pages/Reports";
  import ChatLogs from "./admin-pages/ChatLogs";
  import Pets from "./admin-pages/Pets";

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

          /*admin*/
          <Route path="/admin-pages" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pets" element={<Pets />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="missing" element={<MissingPets />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="regression" element={<RegressionTool />} />
            <Route path="reports" element={<Reports />} />
            <Route path="chatlogs" element={<ChatLogs />} />
          </Route>

        </Routes>
      </BrowserRouter>
    );
  }

  export default App;