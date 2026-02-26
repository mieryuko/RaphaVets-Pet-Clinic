import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ClientLayout from "../ClientLayout";
import api from "../../api/axios";

export default function PetTips() {
  const [selectedTip, setSelectedTip] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [confirmLink, setConfirmLink] = useState(null);
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For horizontal scroll
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
      setError('Failed to load pet care tips');
    } finally {
      setLoading(false);
    }
  };

  // Call fetchData when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Check scroll position for arrows
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScroll, 300);
    }
  };

  // Filter tips based on search and category
  const filteredTips = tips.filter(
    (tip) =>
      (filter === "All" || tip.category === filter) &&
      (tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.short.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <ClientLayout>
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-0">
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
              <div className="h-6 sm:h-7 md:h-8 w-32 sm:w-40 md:w-48 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 sm:h-9 md:h-10 w-full sm:w-56 md:w-64 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Filters Skeleton - Scrollable */}
            <div className="relative mb-4 sm:mb-5 md:mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                  <div
                    key={item}
                    className="h-7 sm:h-8 md:h-9 w-16 sm:w-18 md:w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
                    style={{ animationDelay: `${item * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Tips Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="p-4 sm:p-5 rounded-xl bg-gray-100 animate-pulse"
                  style={{ animationDelay: `${item * 0.1}s` }}
                >
                  <div className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 bg-gray-300 rounded-lg mb-2 sm:mb-3"></div>
                  <div className="h-4 sm:h-5 w-3/4 bg-gray-300 rounded mb-1 sm:mb-2"></div>
                  <div className="h-3 sm:h-4 w-full bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 sm:h-4 w-2/3 bg-gray-300 rounded"></div>
                  <div className="h-5 sm:h-6 w-16 sm:w-18 md:w-20 bg-gray-300 rounded-full mt-2 sm:mt-3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-base sm:text-lg md:text-xl text-red-500 text-center">
            Error: {error}
          </div>
        </div>
      </ClientLayout>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-0 overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)]"
      >
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6">
          {/* Header Section */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5"
          >
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#2FA394]">
                Pet Care Tips
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Helpful advice for your furry friends
              </p>
            </div>
            <div className="relative w-full sm:w-64 md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <motion.input
                type="text"
                placeholder="Search tips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5EE6FE] focus:outline-none"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>

          {/* Filters - Horizontally Scrollable with Arrows */}
          <div className="relative mb-4 sm:mb-5 md:mb-6 group">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                style={{ transform: 'translateY(-50%)' }}
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
            )}

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                style={{ transform: 'translateY(-50%)' }}
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            )}

            {/* Scrollable Filter Container */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat, index) => (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    filter === cat
                      ? "bg-[#2FA394] text-white border-[#2FA394] shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-[#E3FAF7]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tips Grid */}
          <AnimatePresence mode="wait">
            {filteredTips.length > 0 ? (
              <motion.div
                key={`tips-${filter}-${search}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
              >
                {filteredTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    variants={cardVariants}
                    onClick={() => setSelectedTip(tip)}
                    style={{ backgroundColor: cardColors[index % cardColors.length] }}
                    className="cursor-pointer p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all"
                    whileHover="hover"
                  >
                    <div className="text-xl sm:text-2xl mb-2 sm:mb-3 text-[#2FA394]">
                      <i className={`fa-solid ${tip.icon}`}></i>
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold mb-1 line-clamp-2">{tip.title}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">{tip.short}</p>
                    <span className="mt-2 sm:mt-3 inline-block text-[10px] sm:text-xs font-medium text-[#2FA394] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#2FA394]">
                      {tip.category}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8 sm:py-10 md:py-12 text-center text-gray-500"
              >
                <Search size={32} className="mx-auto text-gray-300 mb-2 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                <p className="text-sm sm:text-base">No tips found for this category or search.</p>
                <button 
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  className="mt-2 text-xs sm:text-sm text-[#2FA394] hover:underline"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* TIP DETAILS MODAL - Fully Responsive */}
      <AnimatePresence>
        {selectedTip && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
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
              className="relative z-[10000] bg-white rounded-xl sm:rounded-2xl md:rounded-3xl w-full max-w-md p-4 sm:p-5 md:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-[#2FA394] text-3xl sm:text-4xl mb-3 sm:mb-4 flex justify-center">
                <i className={`fa-solid ${selectedTip.icon}`}></i>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-[#2FA394] text-center">
                {selectedTip.title}
              </h2>
              
              {/* Category badge in modal */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <span className="inline-block text-xs font-medium text-[#2FA394] px-3 py-1 rounded-full border border-[#2FA394]">
                  {selectedTip.category}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm leading-relaxed">
                {selectedTip.long}
              </p>

              {/* Buttons Container */}
              <div className="flex flex-col xs:flex-row justify-center gap-2 sm:gap-3">
                {/* Learn More */}
                <motion.a
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmLink(selectedTip.url);
                  }}
                  className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.a>

                {/* Close */}
                <motion.button
                  onClick={() => setSelectedTip(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM LINK MODAL - Fully Responsive */}
      <AnimatePresence>
        {confirmLink && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-4">
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
              className="relative z-[10002] bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 max-w-sm w-[90%] shadow-2xl text-center"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-3xl sm:text-4xl mb-3 text-[#2FA394]">
                <i className="fa-solid fa-link"></i>
              </div>
              <p className="text-gray-700 mb-4 text-xs sm:text-sm">
                You are about to leave RVCare and visit an external website. Do you want to continue?
              </p>

              <div className="flex flex-col xs:flex-row justify-center gap-2 sm:gap-3">
                <motion.button
                  onClick={() => {
                    window.open(confirmLink, "_blank");
                    setConfirmLink(null);
                  }}
                  className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue
                </motion.button>
                <motion.button
                  onClick={() => setConfirmLink(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}