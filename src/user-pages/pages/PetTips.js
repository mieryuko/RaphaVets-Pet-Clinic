import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";

export default function PetTips() {
  const [selectedTip, setSelectedTip] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [confirmLink, setConfirmLink] = useState(null);

  const tips = [
    {
      id: 1,
      title: "Brush Your Dog's Fur Daily",
      short: "Prevents mats and reduces shedding.",
      long: "Use a suitable brush to remove loose hair and prevent tangles. This keeps your dog comfortable, prevents skin irritation, and helps detect lumps or skin issues early.",
      icon: "fa-scissors",
      category: "Hygiene",
      url: "https://lila-loves-it.com/en/magazine/brushing-dogs-why-it-is-so-important/",
    },
    {
      id: 2,
      title: "Trim Your Cat's Nails Weekly",
      short: "Avoids scratching injuries.",
      long: "Use cat-specific nail clippers. Gently trim the sharp tips, avoid the quick, and reward your cat afterwards. Regular trimming keeps them safe and prevents furniture damage.",
      icon: "fa-cut",
      category: "Hygiene",
      url: "https://www.petmd.com/news/view/how-often-should-you-trim-cats-nails-37807",
    },
    {
      id: 3,
      title: "Give 30-Minute Walks Daily",
      short: "Keeps your dog healthy and active.",
      long: "Walk your dog twice a day or a single 30-minute session. Walking supports physical fitness, reduces anxiety, and strengthens the bond with your pet.",
      icon: "fa-dumbbell",
      category: "Exercise",
      url: "https://vcahospitals.com/know-your-pet/the-benefits-of-walking-your-dog",
    },
    {
      id: 4,
      title: "Offer Fresh Water Multiple Times a Day",
      short: "Prevents dehydration.",
      long: "Change your pet's water 2–3 times daily. Clean bowls thoroughly to avoid bacteria. Proper hydration keeps pets energetic and prevents kidney and urinary issues.",
      icon: "fa-droplet",
      category: "Health",
      url: "https://www.wellnesspetfood.com/blog/how-often-should-you-change-your-pets-water/",
    },
    {
      id: 5,
      title: "Feed Measured Portions",
      short: "Controls weight and digestion.",
      long: "Use a measuring cup to feed your pet appropriate portions based on age, size, and activity level. Avoid free-feeding. Consult your vet for dietary adjustments if needed.",
      icon: "fa-bone",
      category: "Nutrition",
      url: "https://www.northpointpets.com/whyaccuratelymeasuringyourpetsfoodisessential/",
    },
    {
      id: 6,
      title: "Use Puzzle Toys to Stimulate Your Pet",
      short: "Keeps their mind sharp.",
      long: "Introduce treat puzzles, hide-and-seek games, or interactive toys. Mental stimulation prevents boredom, improves behavior, and strengthens your bond.",
      icon: "fa-puzzle-piece",
      category: "Exercise",
      url: "https://vmc.vet.osu.edu/sites/default/files/documents/behavioral-med-puzzle-toys-2024.pdf",
    },
  ];

  const cardColors = [
    "#E3FAF7", 
    "#FCE7F3", 
    "#FFF4E5", 
    "#E6F4EA", 
    "#E5E7FF", 
    "#FFF1F0", 
  ];

  const filteredTips = tips.filter(
    (tip) =>
      (filter === "All" || tip.category === filter) &&
      (tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.short.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ["All", "Health", "Nutrition", "Exercise", "Hygiene"];

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
        className="max-w-6xl mx-auto w-full bg-white shadow-md rounded-xl p-6 relative"
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