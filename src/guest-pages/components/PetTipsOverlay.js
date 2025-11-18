import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PetTipsOverlay({ onClose }) {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [confirmLink, setConfirmLink] = useState(null);

  const tips = [
    {
      id: 1,
      title: "Brush Your Dog’s Fur Daily",
      short: "Prevents mats and reduces shedding.",
      long: "Use a suitable brush...",
      icon: "fa-scissors",
      category: "Hygiene",
      url: "https://lila-loves-it.com/en/magazine/brushing-dogs-why-it-is-so-important/",
    },
    {
      id: 2,
      title: "Trim Your Cat’s Nails Weekly",
      short: "Avoids scratching injuries.",
      long: "Use cat-specific nail clippers...",
      icon: "fa-cut",
      category: "Hygiene",
      url: "https://www.petmd.com/news/view/how-often-should-you-trim-cats-nails-37807",
    },
    {
      id: 3,
      title: "Give 30-Minute Walks Daily",
      short: "Keeps your dog healthy.",
      long: "Walk your dog twice a day...",
      icon: "fa-dumbbell",
      category: "Exercise",
      url: "https://vcahospitals.com/know-your-pet/the-benefits-of-walking-your-dog",
    },
    {
      id: 4,
      title: "Offer Fresh Water Multiple Times a Day",
      short: "Prevents dehydration.",
      long: "Change your pet’s water 2–3 times daily. Clean bowls thoroughly to avoid bacteria. Proper hydration keeps pets energetic and prevents kidney and urinary issues.",
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
    {
      id: 7,
      title: "Use Puzzle Toys to Stimulate Your Pet",
      short: "Keeps their mind sharp.",
      long: "Introduce treat puzzles, hide-and-seek games, or interactive toys. Mental stimulation prevents boredom, improves behavior, and strengthens your bond.",
      icon: "fa-puzzle-piece",
      category: "Exercise",
      url: "https://vmc.vet.osu.edu/sites/default/files/documents/behavioral-med-puzzle-toys-2024.pdf",
    },
  ];

  const cardColors = ["#E3FAF7", "#FCE7F3", "#FFF4E5", "#E6F4EA", "#E5E7FF","#FFF1F0"];

  const categories = ["All", "Health", "Nutrition", "Exercise", "Hygiene"];

  const filteredTips = tips.filter(
    (tip) =>
      (filter === "All" || tip.category === filter) &&
      (tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.short.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      
      {/* Outer Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 bg-gray-200 hover:bg-gray-300 text-black px-3 py-1 rounded-full"
        >
          ✕
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#2FA394] mb-6 text-center">
          Pet Care Tips
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search tips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-3xl px-4 py-2 text-sm w-full mb-5"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                filter === cat
                  ? "bg-[#2FA394] text-white border-[#2FA394]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-[#E3FAF7]"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map((tip, idx) => (
            <motion.div
              key={tip.id}
              whileHover={{ scale: 1.04 }}
              onClick={() => setSelectedTip(tip)}
              style={{ backgroundColor: cardColors[idx % cardColors.length] }}
              className="cursor-pointer p-5 rounded-xl shadow-lg"
            >
              <div className="text-2xl text-[#2FA394] mb-3">
                <i className={`fa-solid ${tip.icon}`}></i>
              </div>
              <h3 className="font-semibold">{tip.title}</h3>
              <p className="text-sm text-gray-700">{tip.short}</p>
            </motion.div>
          ))}
        </div>

        {/* Tip Modal */}
        <AnimatePresence>
          {selectedTip && (
            <div className="fixed inset-0 z-[120000] flex items-center justify-center">
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTip(null)}
              />

              <motion.div
                className="relative bg-white rounded-2xl p-6 max-w-md w-[90%] shadow-xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h2 className="text-xl font-bold text-[#2FA394] mb-3">
                  {selectedTip.title}
                </h2>

                <p className="text-gray-600 mb-4">{selectedTip.long}</p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => window.open(selectedTip.url, "_blank")}
                    className="bg-[#2FA394] text-white px-4 py-2 rounded-lg"
                  >
                    Learn More
                  </button>

                  <button
                    onClick={() => setSelectedTip(null)}
                    className="bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
