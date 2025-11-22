import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="max-w-6xl mx-auto w-full bg-white shadow-md rounded-xl p-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-64 bg-gray-200 rounded-full animate-pulse mt-3 sm:mt-0"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-9 w-20 bg-gray-200 rounded-full animate-pulse"
                style={{ animationDelay: `${item * 0.1}s` }}
              ></div>
            ))}
          </div>

          {/* Tips Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="p-5 rounded-xl shadow-sm bg-gray-100 animate-pulse"
                style={{ animationDelay: `${item * 0.1}s` }}
              >
                <div className="h-8 w-8 bg-gray-300 rounded-lg mb-3"></div>
                <div className="h-5 w-3/4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                <div className="h-6 w-20 bg-gray-300 rounded-full mt-3"></div>
              </div>
            ))}
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">Error: {error}</div>
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
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  const filterVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto w-full bg-white shadow-md rounded-xl p-6 relative overflow-y-auto max-h-[calc(120vh-250px)]"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5"
        >
          <h1 className="text-2xl font-semibold text-[#2FA394]">
            Pet Care Tips
          </h1>
          <motion.input
            type="text"
            placeholder="Search tips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE] focus:outline-none mt-3 sm:mt-0 w-full sm:w-64"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Filters */}
        <motion.div 
          variants={containerVariants}
          className="flex flex-wrap gap-3 mb-6"
        >
        {categories.map((cat, index) => (
            <motion.button
              key={cat}
              variants={filterVariants}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                filter === cat
                  ? "bg-[#2FA394] text-white border-[#2FA394]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-[#E3FAF7]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Tips Grid */}
        <AnimatePresence mode="wait">
          {filteredTips.length > 0 ? (
            <motion.div
              key={`tips-${filter}-${search}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  variants={cardVariants}
                  onClick={() => setSelectedTip(tip)}
                  style={{ backgroundColor: cardColors[index % cardColors.length] }}
                  className="cursor-pointer p-5 rounded-xl shadow-sm"
                  whileHover="hover"
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
            </motion.div>
          ) : (
            <motion.p 
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mt-10 text-gray-500 text-lg flex flex-col items-center gap-2"
            >
              No tips found for this category or search.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

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
              className="relative z-[10000] bg-white rounded-3xl w-[90%] max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-[#2FA394] text-4xl mb-4 flex justify-center">
                <i className={`fa-solid ${selectedTip.icon}`}></i>
              </div>
              <h2 className="text-xl font-bold mb-3 text-[#2FA394] text-center">
                {selectedTip.title}
              </h2>
              <p className="text-gray-700 mb-6 text-sm">
                {selectedTip.long}
              </p>

              {/* Buttons Container */}
              <div className="flex justify-center gap-4">
                {/* Learn More */}
                <motion.a
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmLink(selectedTip.url);
                  }}
                  className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.a>

                {/* Close */}
                <motion.button
                  onClick={() => setSelectedTip(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg text-sm font-medium"
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

      {/* CONFIRM LINK MODAL */}
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
              className="relative z-[10002] bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl text-center"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <p className="text-gray-700 mb-4">
                You are about to leave RaphaVet Pets Clinic and visit an external website. Do you want to continue?
              </p>

              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() => {
                    window.open(confirmLink, "_blank");
                    setConfirmLink(null);
                  }}
                  className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 py-2 rounded-lg text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue
                </motion.button>
                <motion.button
                  onClick={() => setConfirmLink(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg text-sm font-medium"
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