import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import HomePage from "./guest-pages/HomePage";

import Home from "./user-pages/pages/Home";
import Profile from "./user-pages/pages/Profile";
import PetDetails from "./user-pages/pages/PetDetails";
import Booking from "./user-pages/pages/Booking";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/user-home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pet/:id" element={<PetDetails />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;