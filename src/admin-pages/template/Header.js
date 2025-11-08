import { Sun, Moon, User } from "lucide-react";
import { useState, useEffect } from "react";

const Header = ({ title = "Dashboard" }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <header className="flex justify-between items-center bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl px-6 py-3 mb-4 transition-all">
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center justify-between bg-[#F5FCFF] dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all"
        >
          {darkMode ? (
            <>
              <Moon size={16} className="mr-2 text-[#5EE6FE]" /> Dark
            </>
          ) : (
            <>
              <Sun size={16} className="mr-2 text-yellow-400" /> Light
            </>
          )}
        </button>

        {/* User Icon */}
        <div className="w-9 h-9 bg-[#5EE6FE] dark:bg-[#2D88A5] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition">
          <User className="text-white" size={18} />
        </div>
      </div>
    </header>
  );
};

export default Header;
