import React, { useState } from "react";
import Header from "../components/Header";
import SideBar from "../components/SideBar";

function Profile() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [pets, setPets] = useState([]); // still pass this if you need it for sidebar
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="font-sansation min-h-screen bg-[#FBFBFB] relative">
      {/* HEADER */}
      <Header />

      {/* MAIN LAYOUT */}
      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp">
        {/* SIDEBAR */}
        <SideBar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          pets={pets}
          setShowModal={setShowModal}
        />

        {/* PAGE CONTENT */}
        <div
          className={`transition-all duration-500 ease-in-out flex flex-col gap-7 rounded-xl p-5 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"
          }`}
        >
          <div className="p-6 bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <h1 className="text-2xl font-bold text-[#5EE6FE] mb-3">Profile</h1>
            <p className="text-gray-700">
              rtry
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
