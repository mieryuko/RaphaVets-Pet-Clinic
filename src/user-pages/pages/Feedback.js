import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";
import api from "../../api/axios";
import { Filter } from "glin-profanity";
import filipinoBadwords from "filipino-badwords-list";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    message: "",
    rating: 5,
    isAnonymous: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [averageRating, setAverageRating] = useState("0.0");
  
  const filter = new Filter({
    allLanguages: true,
    customWords: filipinoBadwords.array,
    replaceWith: "@!#*"
  });
  
  // sample feedback data
  const sampleFeedbacks = [
    {
      id: 1,
      message: "The veterinary staff was incredibly caring and professional. My dog received excellent care during his surgery. The follow-up calls to check on his recovery were much appreciated!",
      rating: 5,
      isAnonymous: false,
      createdAt: "2026-01-10T14:30:00Z",
      user: {
        name: "Vanerie Lyza Parcon"
      }
    },
    {
      id: 2,
      message: "Emergency service saved my cat's life! Quick response and skilled veterinarians. A bit expensive but worth every penny for the quality of care.",
      rating: 4,
      isAnonymous: true,
      createdAt: "2026-01-08T09:15:00Z",
      user: null
    },
    {
      id: 3,
      message: "Very clean facility and friendly staff. My dog's dental procedure went smoothly. Dr. Eric explained everything clearly and answered all my questions patiently.",
      rating: 5,
      isAnonymous: false,
      createdAt: "2026-01-05T16:45:00Z",
      user: {
        name: "Mark Mapili"
      }
    },
    {
      id: 4,
      message: "Appointment booking through the website was easy. However, the wait time was longer than expected. The vet was thorough though.",
      rating: 3,
      isAnonymous: false,
      createdAt: "2026-01-03T11:20:00Z",
      user: {
        name: "Miguel Rojero"
      }
    },
    {
      id: 5,
      message: "The grooming service is fantastic! My poodle always looks beautiful after visiting. The groomers are gentle and know exactly how to handle anxious pets.",
      rating: 5,
      isAnonymous: false,
      createdAt: "2026-01-01T13:10:00Z",
      user: {
        name: "Fionah Irish"
      }
    }
  ];

  const fetchedOnce = useRef(false);

  const fetchFeedbacks = async () => {
    try{
      console.log("Fetching feedbacks from API...");
      const res = await api.get('/feedback');
      const data = await res.data.feedbacks;
      console.log("Fetched feedbacks:", data);
      setFeedbacks(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedbacks, loading sample data:", error);
      setFeedbacks(sampleFeedbacks);
      setLoading(false);
    }
  }

  const fetchAverageRating = async () => {
    try {
      const res = await api.get('/feedback/average');
      const data = res.data.average ?? 0;
      setAverageRating(data.toFixed(1));
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  }

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (feedbacks.length === 0) {
      setAverageRating("0.0");
      return;
    }
    fetchAverageRating();
  }, [feedbacks]);

  // form submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const containsProfanity = filter.isProfane(newFeedback.message);
    if (containsProfanity) {
      alert("Any inappropriate language from your feedback will be censored.");
    }
    if (!newFeedback.message.trim()) {
      alert("Please enter your feedback message");
      return;
    }
    
    setSubmitting(true);
      
    const formData = {
      rating: newFeedback.rating,
      message: newFeedback.message,
      isAnonymous: newFeedback.isAnonymous
    };
    
    try {
      const res = await api.post('/feedback', formData);
      console.log("Feedback submitted:", res.data);
      fetchFeedbacks();
      
      setNewFeedback({
        message: "",
        rating: 5,
        isAnonymous: false
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again later.");
    } finally {
      setShowModal(false);
      setSubmitting(false);
    }
  };

  // format date
  const formatDate = (dateString) => {
    try {
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
    } catch (error) {
      return "Recently";
    }
  };

  const renderStars = (rating, size = "w-4 h-4") => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`${size} ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  //skeleton
  if (loading) {
    return (
      <ClientLayout>
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 mt-4 sm:mt-6 shadow-lg border border-gray-100">
            {/* header skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="w-full sm:w-auto">
                <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="h-3 sm:h-4 w-64 sm:w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 sm:h-12 w-full sm:w-48 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* stats skeleton */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-100 rounded-xl animate-pulse">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="h-6 sm:h-8 w-8 sm:w-12 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 sm:h-8 w-8 sm:w-12 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* feedbacks skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-pulse">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-200 rounded"></div>
                        <div className="h-3 w-12 sm:w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 w-20 sm:w-24 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-200 rounded"></div>
                      <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
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
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 overflow-y-auto max-h-[calc(100vh-120px)]">
        <div className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 mt-4 sm:mt-6 shadow-lg border border-gray-100">
          {/* header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Feedback & Reviews</h1>
              <p className="text-xs sm:text-sm text-gray-600">Read what our clients say about our services</p>
            </div>
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center shadow-md hover:shadow-lg transition-all"
            >
              <i className="fa-solid fa-comment-medical text-sm sm:text-base"></i>
              Share Your Feedback
            </motion.button>
          </div>

          {/* Stats */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[#2FA394]/10 to-[#5EE6FE]/10 rounded-xl border border-[#2FA394]/20">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-[#2FA394]">{feedbacks.length}</div>
                <div className="text-[10px] sm:text-sm text-gray-600">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-[#2FA394]">{averageRating}</div>
                <div className="text-[10px] sm:text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Feedbacks List */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Recent Feedback
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[10px] sm:text-sm text-gray-600">
                  {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {feedbacks.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-5 hover:border-[#2FA394]/30 transition-colors shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {renderStars(feedback.rating, "w-4 h-4 sm:w-5 sm:h-5")}
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            {feedback.rating}.0
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>

                      {/* Name/Author */}
                      <div className="mb-2 sm:mb-3">
                        <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 ${feedback.user?.name === "You" ? 'bg-blue-100 text-blue-600' : 'bg-[#2FA394]/10 text-[#2FA394]'} rounded-full text-xs sm:text-sm font-medium`}>
                          <i className={`fa-solid ${feedback.user?.name === "You" ? 'fa-user-check' : 'fa-user'} text-[10px] sm:text-xs`}></i>
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {feedback.isAnonymous ? "Anonymous User" : (feedback.user?.name || "User")}
                          </span>
                        </span>
                      </div>

                      <div className="mb-2 sm:mb-3">
                        <p className="text-xs sm:text-sm text-gray-700 break-words">
                          {feedback.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💬</div>
                <h3 className="text-base sm:text-xl font-medium text-gray-700 mb-1 sm:mb-2">
                  No feedback yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 px-4">
                  Be the first to share your experience with RaphaVets!
                </p>
                <motion.button
                  onClick={() => setShowModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#2FA394] hover:bg-[#24907e] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
                >
                  <i className="fa-solid fa-comment-medical"></i>
                  Share Your Feedback
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-3 sm:px-4">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative z-[10000] bg-white rounded-xl sm:rounded-3xl w-full max-w-[95%] sm:max-w-md p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check-circle text-green-600 text-sm"></i>
                      <p className="text-green-700 text-xs sm:text-sm font-medium">
                        Thank you for your feedback! It has been submitted successfully.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 className="text-lg sm:text-xl font-bold text-[#2FA394] mb-3 sm:mb-4">
                Share Your Feedback
              </h2>
              
              <form onSubmit={handleSubmitFeedback} className="space-y-3 sm:space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Rating
                  </label>
                  <div className="flex flex-wrap items-center gap-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewFeedback({...newFeedback, rating: star})}
                          className="text-xl sm:text-3xl focus:outline-none transition-transform hover:scale-110"
                        >
                          <i className={`fa-star ${star <= newFeedback.rating ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'}`}></i>
                        </button>
                      ))}
                    </div>
                    <span className="ml-0 sm:ml-3 text-[10px] sm:text-sm text-gray-600">
                      {newFeedback.rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Your Feedback *
                  </label>
                  <textarea
                    value={newFeedback.message}
                    onChange={(e) => setNewFeedback({...newFeedback, message: e.target.value})}
                    required
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none resize-none transition-all"
                    placeholder="Share your thoughts about our services, staff, facilities, or any suggestions for improvement..."
                    maxLength="500"
                  />
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-right">
                    {newFeedback.message.length}/500 characters
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-start sm:items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newFeedback.isAnonymous}
                    onChange={(e) => setNewFeedback({...newFeedback, isAnonymous: e.target.checked})}
                    className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 text-[#2FA394] border-gray-300 rounded focus:ring-[#5EE6FE]"
                  />
                  <label htmlFor="anonymous" className="text-xs sm:text-sm text-gray-700">
                    Post anonymously (your name will not be displayed)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={submitting || !newFeedback.message.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm transition-all ${
                      submitting || !newFeedback.message.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#2FA394] hover:bg-[#24907e] text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-paper-plane"></i>
                        Submit Feedback
                      </span>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}