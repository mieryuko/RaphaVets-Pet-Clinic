import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";
import api from "../../api/axios";

function FAQs() {
  const [activeCategory, setActiveCategory] = useState("");
  const [openFAQ, setOpenFAQ] = useState(null);
  const [search, setSearch] = useState("");
  const [faqData, setFaqData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch FAQs and categories from backend
  useEffect(() => {
    const fetchFAQsData = async () => {
      try {
        setLoading(true);
        const faqRes = await api.get("/faqs");

        // Group FAQs by categoryName
        const grouped = {};
        const categorySet = new Set();
        
        faqRes.data.forEach((faq) => {
          const cat = faq.categoryName || faq.faqsCategory || "General";
          categorySet.add(cat);
          
          if (!grouped[cat]) {
            grouped[cat] = [];
          }
          grouped[cat].push(faq);
        });
        
        setFaqData(grouped);
        const uniqueCategories = Array.from(categorySet);
        setCategories(uniqueCategories);
        
        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0]);
        }
        setError(null);
      } catch (err) {
        setError("Failed to load FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFAQsData();
  }, []);

  // Filter FAQs based on search
  const filteredFAQs = search 
    ? Object.entries(faqData).reduce((acc, [category, faqs]) => {
        const filtered = faqs.filter(faq => 
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[category] = filtered;
        }
        return acc;
      }, {})
    : { [activeCategory]: faqData[activeCategory] };

  // Toggle FAQ
  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Clear search
  const clearSearch = () => {
    setSearch("");
    setOpenFAQ(null);
  };

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
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const accordionVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      marginTop: "0.5rem",
      marginBottom: "0",
      paddingTop: "0.25rem",
      paddingBottom: "1rem",
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, ease: "easeInOut" }
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
        className="max-w-6xl mx-auto w-full px-3 sm:px-4 overflow-y-auto max-h-[calc(100vh-120px)]"
      >
        <div className="bg-white shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
          {/* Loading State */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#2FA394] border-t-transparent rounded-full mx-auto mb-3 sm:mb-4"
                />
              </div>
              <p className="text-sm sm:text-base text-gray-600">Loading FAQs...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12 text-red-600"
            >
              <i className="fa-solid fa-circle-exclamation text-3xl sm:text-4xl mb-3"></i>
              <p className="text-sm sm:text-base">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-[#2FA394] text-white rounded-lg text-sm"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <>
              {/* Header Section */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#2FA394]">
                    Frequently Asked Questions
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Find answers to common questions about our veterinary services
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <motion.input
                    type="text"
                    placeholder="Search FAQs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-full pl-9 pr-10 py-2.5 sm:py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent focus:outline-none"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                  {search && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Search Results Header */}
              {search && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#2FA394]">
                      Search Results:
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {Object.values(filteredFAQs).reduce((acc, faqs) => acc + faqs.length, 0)} found
                    </span>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-xs text-gray-500 hover:text-[#2FA394] underline"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}

              {/* Category Filters */}
              {!search && (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide pb-2"
                >
                  {categories && categories.length > 0 ? (
                    categories.map((cat, index) => {
                      const isActive = activeCategory === cat;
                      return (
                        <motion.button
                          key={cat}
                          variants={filterVariants}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap flex-shrink-0 transition-all ${
                            isActive
                              ? "bg-[#2FA394] text-white border-[#2FA394] shadow-md"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-[#E3FAF7] hover:border-[#2FA394]"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {cat}
                        </motion.button>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-sm">No categories available</div>
                  )}
                </motion.div>
              )}

              {/* FAQs Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={search ? 'search' : activeCategory}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="w-full"
                >
                  {search ? (
                    // Search Results View
                    Object.entries(filteredFAQs).length > 0 ? (
                      Object.entries(filteredFAQs).map(([category, faqs]) => (
                        <motion.div key={category} className="mb-6 sm:mb-8">
                          <h2 className="text-base sm:text-lg font-semibold text-[#2FA394] mb-3 sm:mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-folder-open text-sm"></i>
                            {category} 
                            <span className="text-xs text-gray-500 font-normal">({faqs.length})</span>
                          </h2>
                          <div className="space-y-3 sm:space-y-4">
                            {faqs.map((faq) => (
                              <motion.div
                                key={faq.id}
                                variants={itemVariants}
                                className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:border-[#2FA394]/30 transition-colors"
                              >
                                <button
                                  onClick={() => toggleFAQ(faq.id)}
                                  className="w-full text-left p-3 sm:p-4 flex justify-between items-center gap-2 hover:bg-gray-50 transition-colors"
                                >
                                  <span className="font-medium text-gray-800 text-xs sm:text-sm flex-1">
                                    {faq.question}
                                  </span>
                                  <motion.span
                                    animate={{ rotate: openFAQ === faq.id ? 45 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-[#2FA394] text-lg sm:text-xl flex-shrink-0 w-5 h-5 flex items-center justify-center"
                                  >
                                    +
                                  </motion.span>
                                </button>
                                <AnimatePresence>
                                  {openFAQ === faq.id && (
                                    <motion.div
                                      variants={accordionVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                      className="px-3 sm:px-4 pb-3 sm:pb-4"
                                    >
                                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                        {faq.answer}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      // No Search Results
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 sm:py-12"
                      >
                        <div className="text-3xl sm:text-4xl mb-3">🔍</div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                          No FAQs found
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                          Try searching with different keywords or browse by category
                        </p>
                        <button
                          onClick={clearSearch}
                          className="px-4 py-2 bg-[#2FA394] text-white rounded-lg text-sm font-medium hover:bg-[#24907e] transition-colors"
                        >
                          Browse All Categories
                        </button>
                      </motion.div>
                    )
                  ) : (
                    // Category View
                    <div className="space-y-3 sm:space-y-4">
                      {faqData[activeCategory]?.map((faq) => (
                        <motion.div
                          key={faq.id}
                          variants={itemVariants}
                          className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:border-[#2FA394]/30 transition-colors"
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full text-left p-3 sm:p-4 flex justify-between items-center gap-2 hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-800 text-xs sm:text-sm flex-1">
                              {faq.question}
                            </span>
                            <motion.span
                              animate={{ rotate: openFAQ === faq.id ? 45 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-[#2FA394] text-lg sm:text-xl flex-shrink-0 w-5 h-5 flex items-center justify-center"
                            >
                              +
                            </motion.span>
                          </button>
                          <AnimatePresence>
                            {openFAQ === faq.id && (
                              <motion.div
                                variants={accordionVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="px-3 sm:px-4 pb-3 sm:pb-4"
                              >
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Contact CTA */}
              <motion.div
                variants={itemVariants}
                className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-[#E3FAF7] to-[#F0F7FF] rounded-xl border border-[#2FA394]/20"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div className="text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2FA394] mb-1">
                      Still have questions?
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Can't find what you're looking for? Contact our support team.
                    </p>
                  </div>
                  <motion.button
                    onClick={() => window.location.href = "/support"}
                    className="w-full sm:w-auto bg-[#2FA394] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium text-sm hover:bg-[#24907e] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fa-solid fa-headset"></i>
                    Contact Support
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </ClientLayout>
  );
}

export default FAQs;