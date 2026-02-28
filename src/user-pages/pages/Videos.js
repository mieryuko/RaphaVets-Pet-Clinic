import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight} from "lucide-react";
import api from "../../api/axios";
import ClientLayout from "../ClientLayout";
import socket from "../../socket"; // Add this import

export default function Videos() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openVideoId, setOpenVideoId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [filters, setFilters] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // WebSocket states
  const [newVideoNotification, setNewVideoNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  
  // For horizontal scroll
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // ===========================================
  // WEBSOCKET SETUP FOR REAL-TIME UPDATES
  // ===========================================
  useEffect(() => {
    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for new videos
    const onNewVideo = (newVideo) => {
      console.log('📨 Received new video via WebSocket:', newVideo);
      
      // Show notification
      setNewVideoNotification(newVideo);
      setShowNotification(true);
      
      // Add to videos list (avoid duplicates)
      setVideos(prevVideos => {
        const exists = prevVideos.some(v => v.id === newVideo.id);
        if (exists) {
          return prevVideos;
        }
        return [newVideo, ...prevVideos];
      });

      // Update filters if needed (add new category)
      if (newVideo.category && !filters.includes(newVideo.category) && newVideo.category !== 'All') {
        setFilters(prev => {
          if (!prev.includes(newVideo.category)) {
            return [...prev, newVideo.category];
          }
          return prev;
        });
      }

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    };

    // Listen for updated videos
    const onVideoUpdated = (updatedVideo) => {
      console.log('📨 Received updated video via WebSocket:', updatedVideo);
      
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === updatedVideo.id ? updatedVideo : video
        )
      );

      // Show brief notification
      setNewVideoNotification({ ...updatedVideo, action: 'updated' });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    // Listen for deleted videos
   // In Videos.js - Update the onVideoDeleted function

    // Listen for deleted videos
    const onVideoDeleted = ({ dbId }) => {  // Changed from { id } to { dbId }
      console.log('📨 Received deleted video via WebSocket dbId:', dbId);
      console.log('📨 Type of dbId:', typeof dbId);
      console.log('📨 Current videos in state:', videos.map(v => ({ 
        id: v.id, 
        dbId: v.dbId,
        title: v.title 
      })));
      
      setVideos(prevVideos => {
        console.log('📨 Filtering with dbId:', dbId);
        const filtered = prevVideos.filter(video => video.dbId !== dbId);
        console.log('📨 Videos after filter:', filtered.length);
        return filtered;
      });
      
      // Find and close modal if the deleted video was playing
      const deletedVideo = videos.find(v => v.dbId === dbId);
      if (deletedVideo && openVideoId === deletedVideo.id) {
        console.log('📨 Closing modal for deleted video:', deletedVideo.id);
        setOpenVideoId(null);
      }

      // Show brief notification
      setNewVideoNotification({ dbId, action: 'deleted' });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    // Register event listeners
    socket.on('new_video', onNewVideo);
    socket.on('video_updated', onVideoUpdated);
    socket.on('video_deleted', onVideoDeleted);

    // Cleanup on unmount
    return () => {
      socket.off('new_video', onNewVideo);
      socket.off('video_updated', onVideoUpdated);
      socket.off('video_deleted', onVideoDeleted);
    };
  }, [filters, openVideoId]);

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
  }, [filters]);

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
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-0">
          <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6 shadow-lg border border-gray-100">
            {/* Header + search skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
              <div className="w-full sm:w-auto">
                <div className="h-6 sm:h-7 md:h-8 w-40 sm:w-48 md:w-64 bg-gray-200 rounded-lg animate-pulse mb-1 sm:mb-2"></div>
                <div className="h-3 sm:h-4 w-48 sm:w-64 md:w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 sm:h-9 md:h-10 w-full sm:w-48 md:w-64 bg-gray-200 rounded-full animate-pulse mt-2 sm:mt-0"></div>
            </div>

            {/* Filters skeleton */}
            <div className="relative mb-4 sm:mb-5 md:mb-6">
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="h-6 sm:h-7 md:h-8 w-14 sm:w-16 md:w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
                    style={{ animationDelay: `${item * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Video grid skeleton */}
            <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100 bg-white p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-white animate-pulse"
                    style={{ animationDelay: `${item * 0.1}s` }}
                  >
                    {/* Thumbnail skeleton */}
                    <div className="w-full aspect-video bg-gray-300"></div>
                    
                    <div className="p-2 sm:p-3">
                      <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded mb-1 sm:mb-2"></div>
                      <div className="h-2 sm:h-3 w-12 sm:w-16 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-2 sm:h-3 w-16 sm:w-20 md:w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 sm:h-5 md:h-6 w-8 sm:w-10 md:w-12 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            Error loading videos: {error}
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
      {/* Real-time Notification Toast */}
      <AnimatePresence>
        {showNotification && newVideoNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#2FA394] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[300px]"
          >
            {newVideoNotification.action === 'deleted' ? (
              <>
                <span className="text-lg">🗑️</span>
                <span className="text-sm">A video was removed</span>
              </>
            ) : newVideoNotification.action === 'updated' ? (
              <>
                <span className="text-lg">📝</span>
                <span className="text-sm">"{newVideoNotification.title}" was updated</span>
              </>
            ) : (
              <>
                <span className="text-lg">✨</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">New Video Added!</p>
                  <p className="text-xs opacity-90">{newVideoNotification.title}</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-0 overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)]"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6 shadow-lg border border-gray-100"
        >
          {/* Header + search with connection status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2FA394]">
                  Pet Video Library
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Watch educational videos about pet care
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[280px] md:w-[320px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-[18px] sm:h-[18px]" />
                <motion.input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FA394]"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
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

            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filters.map((f, index) => (
                <motion.button
                  key={f}
                  variants={itemVariants}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeFilter === f 
                      ? "bg-[#2FA394] text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-[#E3FAF7]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {f}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Video grid */}
          <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100 bg-white p-3 sm:p-4">
            <AnimatePresence mode="wait">
              {filtered.length ? (
                <motion.div
                  key={`videos-${activeFilter}-${searchQuery}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5"
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
                        <img 
                          src={thumbUrl(v.id)} 
                          alt={v.title} 
                          className="object-cover w-full h-full transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = "/images/video-placeholder.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-1.5 sm:p-2 md:p-3 shadow">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#2FA394]" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6.21 5.23a.75.75 0 00-.96 1.16L9.5 10l-4.25 3.61a.75.75 0 10.96 1.16l5-4.25a.75.75 0 000-1.16l-5-4.25z" />
                            </svg>
                          </div>
                        </div>
                      </motion.button>

                      <div className="p-2 sm:p-3 text-left">
                        <h3 className="text-xs sm:text-sm font-semibold text-[#2FA394] mb-0.5 sm:mb-1 line-clamp-2">
                          {v.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
                          {v.category}
                        </p>

                        <div className="flex items-center justify-between gap-1">
                          <a 
                            href={watchUrl(v.id)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] sm:text-xs text-[#2FA394] hover:underline truncate"
                          >
                            Open on YouTube
                          </a>
                          <motion.button 
                            onClick={() => setOpenVideoId(v.id)} 
                            className="text-[10px] sm:text-xs bg-[#5EE6FE] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap"
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
                  className="py-8 sm:py-10 md:py-12 text-center text-gray-500"
                >
                  <Search size={32} className="mx-auto text-gray-300 mb-2 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  <p className="text-xs sm:text-sm">No videos found matching your search.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("All");
                    }}
                    className="mt-2 text-xs sm:text-sm text-[#2FA394] hover:underline"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-[10px] sm:text-xs text-gray-400 mt-3 sm:mt-4 text-center px-2">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-3 md:p-4"
            onClick={() => setOpenVideoId(null)}
          >
            <motion.div 
              initial={{ y: 20, scale: 0.95 }} 
              animate={{ y: 0, scale: 1 }} 
              exit={{ y: 20, scale: 0.95 }} 
              transition={{ duration: 0.2 }} 
              className="w-full max-w-4xl bg-black rounded-lg sm:rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
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

              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 p-2 sm:p-3 bg-white">
                <div className="text-xs sm:text-sm text-gray-700 truncate max-w-full">
                  <span className="font-medium">Now Playing:</span>{" "}
                  <span className="text-gray-500">
                    {videos.find(v => v.id === openVideoId)?.title || "Video"}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full xs:w-auto">
                  <a 
                    href={watchUrl(openVideoId)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs sm:text-sm text-[#2FA394] hover:underline whitespace-nowrap"
                  >
                    Open on YouTube
                  </a>
                  <motion.button 
                    onClick={() => setOpenVideoId(null)} 
                    className="px-2 sm:px-3 py-1 bg-gray-100 rounded-md text-xs sm:text-sm hover:bg-gray-200 transition-all"
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