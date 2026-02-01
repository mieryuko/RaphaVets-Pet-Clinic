import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";
import api from "../../api/axios";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    message: "",
    rating: 5,
    isAnonymous: false
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching feedbacks...');
      
      const response = await api.get('/feedbacks');
      console.log('✅ Feedbacks data:', response.data);

      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (err) {
      console.error('💥 Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Handle form submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!newFeedback.message.trim()) {
      alert("Please enter your feedback message");
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await api.post('/feedbacks', {
        message: newFeedback.message,
        rating: newFeedback.rating,
        isAnonymous: newFeedback.isAnonymous
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Reset form
        setNewFeedback({
          message: "",
          rating: 5,
          isAnonymous: false
        });
        
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Refresh feedbacks
        fetchFeedbacks();
      }
    } catch (err) {
      console.error('💥 Error submitting feedback:', err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Animation variants
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
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="max-w-6xl mx-auto w-full overflow-y-auto max-h-[calc(120vh-250px)]">
          <div className="bg-white rounded-3xl p-6 mt-6 shadow-lg border border-gray-100">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Feedback form skeleton */}
            <div className="bg-gradient-to-br from-[#FFF5E4] to-[#FFF0F7] rounded-xl p-6 border border-[#FFB6C1]/20 mb-8">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Feedbacks skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto w-full overflow-y-auto max-h-[calc(120vh-250px)]"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 mt-6 shadow-lg border border-gray-100"
        >
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2FA394] mb-2">
              Share Your Feedback
            </h1>
            <p className="text-gray-600">
              We value your opinion! Share your experience with RaphaVets and read what others have to say.
            </p>
          </div>

          {/* Add Feedback Form */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-[#E3FAF7] to-[#F0F7FF] rounded-xl py-2 px-6 border border-[#2FA394]/20 mb-8"
          >
            <h2 className="text-lg font-semibold text-[#2FA394]">
              Share Your Experience
            </h2>

            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-check-circle text-green-600"></i>
                    <p className="text-green-700 text-sm font-medium">
                      Thank you for your feedback! It has been submitted successfully.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedback({...newFeedback, rating: star})}
                      className="text-2xl focus:outline-none"
                    >
                      <i className={`fa-star ${star <= newFeedback.rating ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'}`}></i>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {newFeedback.rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Feedback *
                </label>
                <textarea
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({...newFeedback, message: e.target.value})}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none resize-none"
                  placeholder="Share your thoughts about our services, staff, facilities, or any suggestions for improvement..."
                  maxLength="500"
                />
                <div className="text-xs text-gray-500 text-right">
                  {newFeedback.message.length}/500 characters
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newFeedback.isAnonymous}
                  onChange={(e) => setNewFeedback({...newFeedback, isAnonymous: e.target.checked})}
                  className="w-4 h-4 text-[#2FA394] border-gray-300 rounded focus:ring-[#5EE6FE]"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                  Post anonymously (your name will not be displayed)
                </label>
              </div>

              {/* Submit Button */}
              <div className="">
                <motion.button
                  type="submit"
                  disabled={submitting || !newFeedback.message.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    submitting || !newFeedback.message.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#2FA394] hover:bg-[#24907e] text-white'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-paper-plane"></i>
                      Submit Feedback
                    </span>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Feedbacks List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Feedback
              </h2>
              <span className="text-sm text-gray-600">
                {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <AnimatePresence>
              {feedbacks.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {feedbacks.map((feedback, index) => (
                    <motion.div
                      key={feedback.id}
                      variants={cardVariants}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#2FA394]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A7E9E3] to-[#FDE2E4] flex items-center justify-center">
                            {feedback.isAnonymous ? (
                              <i className="fa-solid fa-user-secret text-gray-600"></i>
                            ) : feedback.user?.image ? (
                              <img 
                                src={`http://localhost:5000${feedback.user.image}`}
                                alt={feedback.user.name}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/images/default-avatar.png";
                                }}
                              />
                            ) : (
                              <i className="fa-solid fa-user text-gray-600"></i>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {feedback.isAnonymous ? "Anonymous User" : feedback.user?.name || "User"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(feedback.rating)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 whitespace-pre-line">
                        {feedback.message}
                      </p>
                      
                      {/* Reply from admin (if exists) */}
                      {feedback.reply && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pl-4 border-l-2 border-[#2FA394]"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-[#2FA394]/10 flex items-center justify-center">
                              <i className="fa-solid fa-headset text-[#2FA394] text-xs"></i>
                            </div>
                            <span className="text-sm font-medium text-[#2FA394]">
                              RaphaVets Team
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(feedback.updatedAt)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {feedback.reply}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No feedback yet
                  </h3>
                  <p className="text-gray-500">
                    Be the first to share your experience with RaphaVets!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Box */}
          <motion.div
            variants={itemVariants}
            className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
          </motion.div>
        </motion.div>
      </motion.div>
    </ClientLayout>
  );
}