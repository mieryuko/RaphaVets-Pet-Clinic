// src/user-pages/pages/Videos.js
import React, { useState, useEffect } from "react";
import Header from "../template/Header";
import Sidebar from "../template/SideBar";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

export default function Videos() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openVideoId, setOpenVideoId] = useState(null); // currently opened video in modal

  // Categories / filters
  const filters = ["All", "Training", "Health", "Grooming", "Nutrition", "Behavior"];

  // NOTE: use valid YouTube VIDEO IDs here (just the id, not the full URL).
  // Replace the sample ids with real ones when you want.
  const videos = [
    { id: "jFMA5ggFsXU", title: "Dog Training 101: How to Train ANY DOG the Basics", category: "Training" },
    { id: "ORtlZG_RU1s", title: "How to Bathe your Cat that Hates Water (6 Step Tutorial) | The Cat Butler", category: "Grooming" },
    { id: "qwKMf_5pU_Y", title: "Top 10 Best Foods for Dogs!!", category: "Nutrition" },
    { id: "rR6aXt-bRGs", title: "10 Signs Your Cat is Sick And Needs Help (A Vet's Advice)", category: "Health" },
    { id: "pZkzdsjtWc0", title: "How To Stop Your Dog Barking - You Can Do This Right Now", category: "Behavior" },
    { id: "VnJafu_NMoQ", title: "How to Trim Dog Nails Safely", category: "Grooming" },
    { id: "6cvxA1CMbMQ", title: "Cat Nutrition: The Food, The Bad & The Ugly: Part 1: Dry Food!", category: "Nutrition" },
  ];

  // filter + search
  const filtered = videos.filter(
    (v) =>
      (activeFilter === "All" || v.category === activeFilter) &&
      v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // dark mode read/save
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);
  useEffect(() => localStorage.setItem("darkMode", darkMode), [darkMode]);

  // Helper: thumbnail URL from id
  const thumbUrl = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  // Helper: watch URL (fallback)
  const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
  // Helper: embed src
  const embedSrc = (id) => `https://www.youtube.com/embed/${id}?autoplay=1`;

  return (
    <div className={`font-sansation min-h-screen ${darkMode ? "bg-[#121212] text-white" : "bg-[#FBFBFB]"}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} setIsMenuOpen={setIsMenuOpen} />

      <div className="flex flex-row gap-5 px-5 sm:px-10 lg:px-12">
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <div className={`w-full transition-all duration-300 ${!isMenuOpen ? "md:w-full" : "md:w-[calc(100%-250px)]"}`}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="bg-white rounded-3xl p-6 mt-6 shadow-lg border border-gray-100">
            {/* header + search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#2FA394]">Pet Video Library</h1>
                <p className="text-sm text-gray-600">Curated videos for pet care, training, grooming, and nutrition.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-[320px]">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search videos..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FA394]"
                  />
                </div>
              </div>
            </div>

            {/* filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    activeFilter === f ? "bg-[#2FA394] text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-[#E3FAF7]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* wrapper */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              {/* grid of thumbnails */}
              {filtered.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((v) => (
                    <motion.div key={v.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md group bg-white">
                      {/* Thumbnail (click opens modal) */}
                      <button
                        onClick={() => setOpenVideoId(v.id)}
                        className="relative block w-full aspect-video overflow-hidden"
                      >
                        <img src={thumbUrl(v.id)} alt={v.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-3 shadow">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2FA394]" viewBox="0 0 20 20" fill="currentColor"><path d="M6.21 5.23a.75.75 0 00-.96 1.16L9.5 10l-4.25 3.61a.75.75 0 10.96 1.16l5-4.25a.75.75 0 000-1.16l-5-4.25z" /></svg>
                          </div>
                        </div>
                      </button>

                      {/* meta */}
                      <div className="p-3 text-left">
                        <h3 className="text-sm font-semibold text-[#2FA394] mb-1">{v.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">{v.category}</p>

                        <div className="flex items-center justify-between">
                          <a href={watchUrl(v.id)} target="_blank" rel="noreferrer" className="text-xs text-[#2FA394] hover:underline">Open on YouTube</a>
                          <button onClick={() => setOpenVideoId(v.id)} className="text-xs bg-[#5EE6FE] text-white px-3 py-1 rounded-full">Play</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">No videos found.</div>
              )}
              
              <p className="text-xs text-gray-400 mt-3 text-center">
                © Videos embedded from YouTube. All rights belong to their respective creators.
              </p>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {openVideoId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} transition={{ duration: 0.2 }} className="w-full max-w-4xl bg-black rounded-xl overflow-hidden">
              <div className="relative pb-[56.25%]"> 
                {/* responsive iframe container */}
                <iframe
                  title="video-player"
                  src={embedSrc(openVideoId)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* action bar */}
              <div className="flex items-center justify-between p-3 bg-white">
                <div className="text-sm text-gray-700">Playing video</div>
                <div className="flex items-center gap-2">
                  <a href={watchUrl(openVideoId)} target="_blank" rel="noreferrer" className="text-sm text-[#2FA394]">Open on YouTube</a>
                  <button onClick={() => setOpenVideoId(null)} className="px-3 py-1 bg-gray-100 rounded-md">Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
