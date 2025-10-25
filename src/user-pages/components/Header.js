import React from "react";

function Header({ darkMode, setDarkMode, setIsMenuOpen }) {
  return (
    <div className="pt-5 pb-2 px-5 sm:px-10 flex flex-row justify-between items-center animate-fadeSlideDown">
      <div className="flex flex-row items-center gap-3">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="text-3xl text-gray-700 focus:outline-none transition-transform duration-300 hover:scale-110"
        >
          ☰
        </button>
        <img
          src="/images/logo.png"
          className="w-[40px] sm:w-[60px] md:w-[80px] transition-transform duration-300 hover:scale-105"
          alt="Logo"
        />
        <div className="flex flex-col">
          <div className="font-baloo text-2xl leading-none">
            <span className="text-[#000000]">Rapha</span>
            <span className="text-[#5EE6FE]">Vets</span>
          </div>
          <span className="font-sansation text-sm">Pet Clinic</span>
        </div>
      </div>

      {/* RIGHT SIDE - NOTIF + FORUM + MODE TOGGLE */}
      <div className="flex flex-row justify-end items-center gap-5 sm:gap-8 text-gray-700 animate-fadeSlideDown delay-100">
        <span className="text-2xl transition-transform duration-300 hover:scale-110 cursor-pointer">
          <i className="fa-solid fa-bell"></i>
        </span>
        <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 cursor-pointer">
          <i className="fa-solid fa-users"></i>
          <span className="font-semibold">Forum</span>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Mode</span>
          <div
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 flex items-center rounded-full p-[2px] cursor-pointer transition-all duration-300 ${
              darkMode ? "bg-[#5EE6FE]" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                darkMode ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
