import React from "react";

const DashboardCard = ({ title, description, icon, bg, text, onClick, url }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{ backgroundColor: bg, color: text }}
      className="p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-lg flex flex-col justify-between cursor-pointer hover:scale-[1.02] sm:hover:scale-105 transition-all h-auto min-h-[140px] sm:h-40"
    >
      <div>
        <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2">{title}</h3>
        <p className="text-xs sm:text-sm line-clamp-3 sm:line-clamp-2 opacity-90">{description}</p>
      </div>
      <div className="mt-2 sm:mt-3 flex justify-end text-xl sm:text-2xl">
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
};

export default DashboardCard;