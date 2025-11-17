import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import api from "../../api/axios";
import ClientLayout from "../ClientLayout";

export default function Videos() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openVideoId, setOpenVideoId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [filters, setFilters] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch videos and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching videos data...');
      
      const [videosResponse, categoriesResponse] = await Promise.all([
        api.get('/videos'),
        api.get('/videos/categories')
      ]);

      console.log('✅ Videos data:', videosResponse.data);
      console.log('✅ Categories data:', categoriesResponse.data);

      if (videosResponse.data.success) {
        setVideos(videosResponse.data.data);
      }

      if (categoriesResponse.data.success) {
        setFilters(categoriesResponse.data.data);
      }

    } catch (err) {
      console.error('💥 Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter + search
  const filtered = videos.filter(
    (v) =>
      (activeFilter === "All" || v.category === activeFilter) &&
      v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper functions
  const thumbUrl = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
  const embedSrc = (id) => `https://www.youtube.com/embed/${id}?autoplay=1`;

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-[#2FA394]">Loading videos...</div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">Error loading videos: {error}</div>
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
        className="max-w-6xl mx-auto w-full"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 mt-6 shadow-lg border border-gray-100"
        >
          {/* Header + search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2FA394]">Pet Video Library</h1>
              <p className="text-sm text-gray-600">Curated videos for pet care, training, grooming, and nutrition.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[320px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <motion.input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FA394]"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <motion.div 
            variants={containerVariants}
            className="flex flex-wrap gap-2 mb-6"
          >
            {filters.map((f, index) => (
              <motion.button
                key={f}
                variants={itemVariants}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  activeFilter === f ? "bg-[#2FA394] text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-[#E3FAF7]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                {f}
              </motion.button>
            ))}
          </motion.div>

          {/* Video grid */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <AnimatePresence mode="wait">
              {filtered.length ? (
                <motion.div
                  key={`videos-${activeFilter}-${searchQuery}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {filtered.map((v, index) => (
                    <motion.div 
                      key={v.id} 
                      variants={cardVariants}
                      className="rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md group bg-white"
                      whileHover="hover"
                      transition={{ delay: index * 0.05 }}
                    >
                      <motion.button
                        onClick={() => setOpenVideoId(v.id)}
                        className="relative block w-full aspect-video overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                      >
                        <img src={thumbUrl(v.id)} alt={v.title} className="object-cover w-full h-full transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-3 shadow">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#2FA394]" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6.21 5.23a.75.75 0 00-.96 1.16L9.5 10l-4.25 3.61a.75.75 0 10.96 1.16l5-4.25a.75.75 0 000-1.16l-5-4.25z" />
                            </svg>
                          </div>
                        </div>
                      </motion.button>

                      <div className="p-3 text-left">
                        <h3 className="text-sm font-semibold text-[#2FA394] mb-1">{v.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">{v.category}</p>

                        <div className="flex items-center justify-between">
                          <a href={watchUrl(v.id)} target="_blank" rel="noreferrer" className="text-xs text-[#2FA394] hover:underline">Open on YouTube</a>
                          <motion.button 
                            onClick={() => setOpenVideoId(v.id)} 
                            className="text-xs bg-[#5EE6FE] text-white px-3 py-1 rounded-full"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Play
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-videos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-12 text-center text-gray-500"
                >
                  No videos found.
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-xs text-gray-400 mt-3 text-center">
              © Videos embedded from YouTube. All rights belong to their respective creators.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {openVideoId && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div 
              initial={{ y: 20 }} 
              animate={{ y: 0 }} 
              exit={{ y: 20 }} 
              transition={{ duration: 0.2 }} 
              className="w-full max-w-4xl bg-black rounded-xl overflow-hidden"
            >
              <div className="relative pb-[56.25%]"> 
                <iframe
                  title="video-player"
                  src={embedSrc(openVideoId)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white">
                <div className="text-sm text-gray-700">Playing video</div>
                <div className="flex items-center gap-2">
                  <a href={watchUrl(openVideoId)} target="_blank" rel="noreferrer" className="text-sm text-[#2FA394]">Open on YouTube</a>
                  <motion.button 
                    onClick={() => setOpenVideoId(null)} 
                    className="px-3 py-1 bg-gray-100 rounded-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}