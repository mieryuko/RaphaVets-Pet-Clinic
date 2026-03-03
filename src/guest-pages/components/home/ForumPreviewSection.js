import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../../api/axios"; // Fixed import path - go up 3 levels to root

const ForumPreviewSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  const openLightbox = (images, startIndex = 0) => {
    setLightbox({ open: true, images, index: startIndex });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, images: [], index: 0 });
  };

  useEffect(() => {
    const fetchPreviewPosts = async () => {
      try {
        const res = await api.get("/forum?limit=3"); // Get only 3 latest posts
        setPosts(res.data.posts.slice(0, 3)); // Ensure only 3 posts
      } catch (err) {
        console.error("Error fetching forum posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewPosts();
  }, []);

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

  // Add ID for navigation
  return (
    <section id="forum-preview" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Lost & Found <span className="text-[#5EE6FE]">Pets</span>
          </h2>
          <div className="w-24 h-1 bg-[#5EE6FE] mx-auto rounded-full mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help reunite missing pets with their families. Check out recent posts from our community.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-3">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <i className="fa-solid fa-paw text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No posts yet. Be the first to help!</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => {
                  if (post.images?.length > 0) {
                    const urls = post.images.map(x => x.url || x);
                    openLightbox(urls, 0);
                  }
                }}
              >
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#E3FAF7] flex items-center justify-center text-[#05A1B6] font-bold text-xs">
                        {post.user?.[0] || "U"}
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-800">{post.user || "Anonymous"}</span>
                        <p className="text-[10px] text-gray-400">{post.date}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        post.type === "Lost"
                          ? "bg-[#FFE5E5] text-[#C62828]"
                          : "bg-[#E0F2F1] text-[#00695C]"
                      }`}
                    >
                      {post.type}
                    </span>
                  </div>
                </div>

                {/* Images Grid */}
                {post.images?.length > 0 && (
                  <div
                    className={`grid gap-1 p-2 ${
                      post.images.length === 1
                        ? "grid-cols-1"
                        : post.images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    {post.images.slice(0, 3).map((img, i) => (
                      <div key={i} className="relative aspect-square">
                        <img
                          src={img.url || img}
                          alt={`pet-${i}`}
                          className="rounded-lg w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder-pet.png'; // Add a placeholder image
                          }}
                        />
                        {post.images.length > 3 && i === 2 && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            +{post.images.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="p-4">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {post.desc}
                  </p>
                  
                  {/* Contact Icons */}
                  {(post.contact || post.email) && (
                    <div className="flex items-center gap-3 mt-3 text-gray-400 text-xs">
                      {post.contact && <i className="fa-solid fa-phone" title={post.contact}></i>}
                      {post.email && <i className="fa-solid fa-envelope" title={post.email}></i>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white border-2 border-[#5EE6FE] text-[#5EE6FE] px-8 py-3 rounded-full font-medium hover:bg-[#5EE6FE] hover:text-white transition-all duration-300 group"
          >
            <span>View Full Forum</span>
            <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            Sign in to post about lost or found pets
          </p>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full"
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(l => ({
                      ...l,
                      index: (l.index + 1) % l.images.length
                    }));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </>
            )}
            <img
              src={lightbox.images[lightbox.index]}
              alt="lightbox"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ForumPreviewSection;