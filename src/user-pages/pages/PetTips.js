import React, { useState, useEffect } from "react";
import Header from "../template/Header";
import Sidebar from "../template/SideBar";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";


export default function PetTips() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [confirmLink, setConfirmLink] = useState(null);
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardColors = [
    "#E3FAF7", 
    "#FCE7F3", 
    "#FFF4E5", 
    "#E6F4EA", 
    "#E5E7FF", 
    "#FFF1F0", 
  ];



// Fetch pet care tips and categories
const fetchData = async () => {
  try {
    setLoading(true);
    console.log('🔄 Attempting to fetch from API...');
    
    const [tipsResponse, categoriesResponse] = await Promise.all([
      api.get('/pet-care-tips'),
      api.get('/pet-care-tips/categories')
    ]);

    console.log('📥 API Responses:');
    console.log('Tips data:', tipsResponse.data);
    console.log('Categories data:', categoriesResponse.data);

    if (tipsResponse.data.success) {
      setTips(tipsResponse.data.data);
    }

    if (categoriesResponse.data.success) {
      setCategories(categoriesResponse.data.data);
    }

  } catch (err) {
    console.error('💥 Error in fetchData:', err);
    console.error('Error details:', err.response?.data || err.message);

  } finally {
    setLoading(false);
  }
};

  // Call fetchData when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Filter tips based on search and category
  const filteredTips = tips.filter(
    (tip) =>
      (filter === "All" || tip.category === filter) &&
      (tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.short.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#2FA394]">Loading pet care tips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`font-sansation min-h-screen relative ${darkMode ? "bg-[#1E1E1E] text-white" : "bg-[#FBFBFB]"}`}>
      {/* HEADER */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* MAIN LAYOUT */}
      <div className="flex flex-row gap-5 px-5 sm:px-12 animate-fadeSlideUp relative z-10">
        {/* SIDEBAR */}
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        {/* MAIN CONTENT */}
        <div className={`transition-all duration-500 ease-in-out flex flex-col gap-7 rounded-xl p-6 w-full ${!isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"}`}>
          <div className="max-w-6xl mx-auto w-full bg-white shadow-md rounded-xl p-6 relative">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
              <h1 className="text-2xl font-semibold text-[#2FA394]">
                Pet Care Tips {/*tips.length > 0 && `(${tips.length})`*/}
              </h1>
              <input
                type="text"
                placeholder="Search tips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE] focus:outline-none mt-3 sm:mt-0 w-full sm:w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                    filter === cat
                      ? "bg-[#2FA394] text-white border-[#2FA394]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-[#E3FAF7]"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>

            {/* Tips Grid */}
            {filteredTips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedTip(tip)}
                    style={{ backgroundColor: cardColors[index % cardColors.length] }}
                    className="cursor-pointer p-5 rounded-xl shadow-sm transition-all"
                  >
                    <div className="text-2xl mb-3 text-[#2FA394]">
                      <i className={`fa-solid ${tip.icon}`}></i>
                    </div>
                    <h2 className="text-lg font-semibold mb-1">{tip.title}</h2>
                    <p className="text-sm text-gray-600">{tip.short}</p>
                    <span className="mt-3 inline-block text-xs font-medium text-[#2FA394] px-3 py-1 rounded-full border border-[#2FA394]">
                      {tip.category}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center mt-10 text-gray-500 text-lg flex flex-col items-center gap-2">
                No tips found for this category or search.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedTip && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTip(null)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative z-[10000] bg-white dark:bg-[#2C2C2C] rounded-3xl w-[90%] max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
            >
              <div className="text-[#2FA394] text-4xl mb-4 flex justify-center">
                <i className={`fa-solid ${selectedTip.icon}`}></i>
              </div>
              <h2 className="text-xl font-bold mb-3 text-[#2FA394] text-center">
                {selectedTip.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm">
                {selectedTip.long}
              </p>

              {/* Buttons Container */}
              <div className="flex justify-center gap-4">
                {/* Learn More */}
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmLink(selectedTip.url);
                  }}
                  className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
                >
                  Learn More
                </a>

                {/* Close */}
                <button
                  onClick={() => setSelectedTip(null)}
                  className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmLink && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmLink(null)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative z-[10002] bg-white dark:bg-[#2C2C2C] rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl text-center"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
            >
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You are about to leave RaphaVet Pets Clinic and visit an external website. Do you want to continue?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    window.open(confirmLink, "_blank");
                    setConfirmLink(null);
                  }}
                  className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Continue
                </button>
                <button
                  onClick={() => setConfirmLink(null)}
                  className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}