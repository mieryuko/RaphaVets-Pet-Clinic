import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Header from "./components/Header";
import Footer from "./components/home/FooterSection";

function PublicForum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const openLightbox = (images, startIndex = 0) => {
    setLightbox({ open: true, images, index: startIndex });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, images: [], index: 0 });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/forum");
        setPosts(res.data.posts);
      } catch (err) {
        console.error("Error fetching forum posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((p) => {
    const matchesFilter = filter === "All" ? true : p.type === filter;
    const matchesSearch =
      p.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user && p.user?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.contact && p.contact?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.email && p.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header showNavbar={true} />
      
      <main className="pt-28 pb-10 px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
              <i className="fa-solid fa-paw text-[#5EE6FE] text-sm"></i>
              <span className="text-sm font-medium text-gray-600">Community Forum</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Lost Pets <span className="text-[#5EE6FE]">Board</span>
            </h1>
            <div className="w-32 h-1.5 bg-gradient-to-r from-[#5EE6FE] to-[#2FA394] mx-auto rounded-full mb-6" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Help reunite missing pets with their families. Browse through community posts below.
            </p>
          </motion.div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex gap-3 w-full md:w-auto">
              {["All", "Lost", "Found"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    filter === tab
                      ? "bg-gradient-to-r from-[#5EE6FE] to-[#2FA394] text-white shadow-md shadow-[#5EE6FE]/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by description, name, or contact..."
                className="w-full border border-gray-200 rounded-full py-3 pl-11 pr-4 text-sm text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Stats Bar 
          {!loading && filteredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-white p-4 rounded-xl mb-8 border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-newspaper text-[#5EE6FE]"></i>
                <span className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredPosts.length}</span> posts
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  <i className="fa-regular fa-clock mr-1"></i> Latest first
                </span>
              </div>
            </motion.div>
          )}*/}

          {/* Posts Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="aspect-square bg-gray-200 rounded-lg"></div>
                    <div className="aspect-square bg-gray-200 rounded-lg"></div>
                    <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-paw text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We couldn't find any posts matching your criteria. Try adjusting your search or filter.
              </p>
              <button
                onClick={() => {
                  setFilter("All");
                  setSearchQuery("");
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#5EE6FE] to-[#2FA394] text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedPost(post);
                    setShowViewModal(true);
                  }}
                >
                  {/* Image Cover - Show first image as cover if exists */}
                  {post.images?.length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.images[0].url || post.images[0]}
                        alt="post cover"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                            post.type === "Lost"
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {post.type}
                        </span>
                      </div>

                      {/* Image Count */}
                      {post.images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <i className="fa-regular fa-images"></i>
                          <span>{post.images.length}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E3FAF7] to-[#C5F0E8] flex items-center justify-center text-[#05A1B6] font-bold text-sm flex-shrink-0">
                        {post.user?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {post.user || "Anonymous"}
                        </h4>
                        <p className="text-xs text-gray-400">
                          <i className="fa-regular fa-calendar mr-1"></i>
                          {post.date}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {post.desc}
                    </p>

                    {/* Contact Info - Now Working */}
                    {(post.contact || post.email) && (
                      <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-xl">
                        {post.contact && (
                          <div className="flex items-center gap-2 text-sm">
                            <i className="fa-solid fa-phone text-[#5EE6FE] w-4"></i>
                            <span className="text-gray-700 font-medium truncate">{post.contact}</span>
                          </div>
                        )}
                        {post.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <i className="fa-solid fa-envelope text-[#5EE6FE] w-4"></i>
                            <span className="text-gray-700 font-medium truncate">{post.email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        <i className="fa-regular fa-eye mr-1"></i>
                        Click to view details
                      </span>
                      <i className="fa-solid fa-arrow-right text-[#5EE6FE] group-hover:translate-x-2 transition-transform"></i>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Login Prompt - Redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5EE6FE] to-[#2FA394] p-1"
          >
            <div className="relative bg-white rounded-3xl p-12 text-center">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#5EE6FE]/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2FA394]/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-[#5EE6FE] to-[#2FA394] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <i className="fa-solid fa-paw text-white text-3xl"></i>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Join Our Community</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Help reunite lost pets with their families. Sign up to post about lost or found pets and connect with other pet lovers.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#5EE6FE] to-[#2FA394] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 group"
                  >
                    <i className="fa-solid fa-right-to-bracket group-hover:translate-x-1 transition-transform"></i>
                    <span>Sign In / Register</span>
                  </Link>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <i className="fa-regular fa-circle-check text-[#5EE6FE]"></i>
                      Free to join
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="fa-regular fa-circle-check text-[#2FA394]"></i>
                      Help the community
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* View Post Modal - Enhanced */}
      {showViewModal && selectedPost && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowViewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Cover Image if exists */}
            {selectedPost.images?.length > 0 && (
              <div className="relative h-64 overflow-hidden">
                <img
                  src={selectedPost.images[0].url || selectedPost.images[0]}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Type Badge */}
                <div className="absolute top-6 right-6">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                      selectedPost.type === "Lost"
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {selectedPost.type}
                  </span>
                </div>

                {/* User Info on Cover */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-lg border-2 border-white/50">
                    {selectedPost.user?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{selectedPost.user || "Anonymous"}</h3>
                    <p className="text-white/80 text-sm">
                      <i className="fa-regular fa-calendar mr-1"></i>
                      {selectedPost.date}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* If no cover image, show header without image */}
            {(!selectedPost.images || selectedPost.images.length === 0) && (
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E3FAF7] to-[#C5F0E8] flex items-center justify-center text-[#05A1B6] font-bold text-lg">
                      {selectedPost.user?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{selectedPost.user || "Anonymous"}</h3>
                      <p className="text-sm text-gray-400">
                        <i className="fa-regular fa-calendar mr-1"></i>
                        {selectedPost.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedPost.type === "Lost"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {selectedPost.type}
                  </span>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Image Gallery */}
              {selectedPost.images?.length > 1 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fa-regular fa-images text-[#5EE6FE]"></i>
                    Photos ({selectedPost.images.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedPost.images.slice(1).map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square cursor-zoom-in rounded-xl overflow-hidden"
                        onClick={() => {
                          const urls = selectedPost.images.map(x => x.url || x);
                          openLightbox(urls, i + 1);
                        }}
                      >
                        <img
                          src={img.url || img}
                          alt={`gallery-${i}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fa-regular fa-file-lines text-[#5EE6FE]"></i>
                  Description
                </h4>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.desc}
                  </p>
                </div>
              </div>

              {/* Contact Information - Now Working */}
              {(selectedPost.contact || selectedPost.email) && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fa-regular fa-address-card text-[#5EE6FE]"></i>
                    Contact Information
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="grid gap-4">
                      {selectedPost.contact && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-phone text-blue-600"></i>
                          </div>
                          <div>
                            <p className="text-xs text-blue-600 font-medium">Phone Number</p>
                            <a 
                              href={`tel:${selectedPost.contact}`}
                              className="text-gray-800 font-semibold hover:text-[#5EE6FE] transition-colors"
                            >
                              {selectedPost.contact}
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedPost.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-envelope text-indigo-600"></i>
                          </div>
                          <div>
                            <p className="text-xs text-indigo-600 font-medium">Email Address</p>
                            <a 
                              href={`mailto:${selectedPost.email}`}
                              className="text-gray-800 font-semibold hover:text-[#5EE6FE] transition-colors"
                            >
                              {selectedPost.email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
                >
                  Close
                </button>
                {/*{(selectedPost.contact || selectedPost.email) && (
                  <button
                    onClick={() => {
                      if (selectedPost.contact) {
                        window.location.href = `tel:${selectedPost.contact}`;
                      } else if (selectedPost.email) {
                        window.location.href = `mailto:${selectedPost.email}`;
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#5EE6FE] to-[#2FA394] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
                  >
                    <i className="fa-regular fa-message mr-2"></i>
                    Contact
                  </button>
                )}*/}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(l => ({
                      ...l,
                      index: (l.index - 1 + l.images.length) % l.images.length
                    }));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
                >
                  <i className="fa-solid fa-chevron-left text-xl"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(l => ({
                      ...l,
                      index: (l.index + 1) % l.images.length
                    }));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
                >
                  <i className="fa-solid fa-chevron-right text-xl"></i>
                </button>
              </>
            )}
            
            <div className="text-center">
              <img
                src={lightbox.images[lightbox.index]}
                alt="lightbox"
                className="max-w-full max-h-[85vh] mx-auto rounded-lg shadow-2xl"
              />
              
              {/* Image Counter */}
              {lightbox.images.length > 1 && (
                <p className="text-white/70 text-sm mt-4">
                  {lightbox.index + 1} / {lightbox.images.length}
                </p>
              )}
            </div>

            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default PublicForum;