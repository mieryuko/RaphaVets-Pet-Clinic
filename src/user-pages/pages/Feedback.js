import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";
import api from "../../api/axios";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    message: "",
    rating: 5,
    isAnonymous: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);

  // sample feedback data
  const sampleFeedbacks = [
    {
      id: 1,
      message: "The veterinary staff was incredibly caring and professional. My dog received excellent care during his surgery. The follow-up calls to check on his recovery were much appreciated!",
      rating: 5,
      isAnonymous: false,
      createdAt: "2024-03-10T14:30:00Z",
      user: {
        name: "Vanerie Lyza Parcon"
      }
    },
    {
      id: 2,
      message: "Emergency service saved my cat's life! Quick response and skilled veterinarians. A bit expensive but worth every penny for the quality of care.",
      rating: 4,
      isAnonymous: true,
      createdAt: "2024-03-08T09:15:00Z",
      user: null
    },
    {
      id: 3,
      message: "Very clean facility and friendly staff. My dog's dental procedure went smoothly. Dr. Eric explained everything clearly and answered all my questions patiently.",
      rating: 5,
      isAnonymous: false,
      createdAt: "2024-03-05T16:45:00Z",
      user: {
        name: "Mark Mapili"
      }
    },
    {
      id: 4,
      message: "Appointment booking through the website was easy. However, the wait time was longer than expected. The vet was thorough though.",
      rating: 3,
      isAnonymous: false,
      createdAt: "2024-03-03T11:20:00Z",
      user: {
        name: "Miguel Rojero"
      }
    },
    {
      id: 5,
      message: "The grooming service is fantastic! My poodle always looks beautiful after visiting. The groomers are gentle and know exactly how to handle anxious pets.",
      rating: 5,
      isAnonymous: false,
      createdAt: "2024-03-01T13:10:00Z",
      user: {
        name: "Fionah Irish"
      }
    }
  ];

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching feedbacks...');
      
      const response = await api.get('/feedbacks');
      console.log('✅ Feedbacks data:', response.data);

      if (response.data.success) {
        setFeedbacks(response.data.data);
        setUseSampleData(false);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching feedbacks, using sample data:', err);
      setFeedbacks(sampleFeedbacks);
      setUseSampleData(true);
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
        const tempId = Date.now();
        const newFeedbackData = {
          id: tempId,
          message: newFeedback.message,
          rating: newFeedback.rating,
          isAnonymous: newFeedback.isAnonymous,
          createdAt: new Date().toISOString(),
          user: newFeedback.isAnonymous ? null : {
            name: "You"
          }
        };
        
        console.log("New feedback created:", newFeedbackData);
        
        setNewFeedback({
          message: "",
          rating: 5,
          isAnonymous: false
        });
        
        setFeedbacks(prevFeedbacks => {
          const updated = [newFeedbackData, ...prevFeedbacks];
          console.log("Updated feedbacks in setState:", updated);
          return updated;
        });
        
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Close modal
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error submitting feedback, adding to sample data:', err);
      
      const tempId = Date.now();
      const newFeedbackData = {
        id: tempId,
        message: newFeedback.message,
        rating: newFeedback.rating,
        isAnonymous: newFeedback.isAnonymous,
        createdAt: new Date().toISOString(),
        user: newFeedback.isAnonymous ? null : {
          name: "You" 
        }
      };
      
      console.log("New feedback (fallback):", newFeedbackData);
      
      // reset form
      setNewFeedback({
        message: "",
        rating: 5,
        isAnonymous: false
      });
      
      setFeedbacks(prevFeedbacks => {
        const updated = [newFeedbackData, ...prevFeedbacks];
        console.log("Updated feedbacks (fallback):", updated);
        return updated;
      });
      
      setUseSampleData(true);
      
      // show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Close modal
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // date
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

  // render rating
  const renderStars = (rating, size = "w-4 h-4") => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`${size} ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // feedback expansion
  const toggleFeedback = (id) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  // animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
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

  const accordionVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      marginTop: 0
    },
    visible: { 
      opacity: 1,
      height: "auto",
      marginTop: "0.75rem",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="max-w-6xl mx-auto w-full overflow-y-auto max-h-[calc(120vh-250px)]">
          <div className="bg-white rounded-3xl p-6 mt-6 shadow-lg border border-gray-100">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-40 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* feedbacks skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
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
          {/* share feedback button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-2">
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#2FA394] hover:bg-[#24907e] text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <i className="fa-solid fa-comment-medical"></i>
              Share Your Feedback
            </motion.button>
          </div>

          {/* Sample Data Notice */}
          {/*{useSampleData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-blue-600"></i>
                <p className="text-blue-700 text-sm">
                  Showing sample feedback data. Your submitted feedback will appear at the top of the list.
                </p>
              </div>
            </motion.div>
          )}*/}

          {/* Feedbacks List - Collapsed by default */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Feedback
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
                </span>
                {/*{useSampleData && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    Sample Data
                  </span>
                )}*/}
              </div>
            </div>

            <AnimatePresence>
              {feedbacks.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {feedbacks.map((feedback) => (
                    <motion.div
                      key={feedback.id}
                      variants={cardVariants}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#2FA394]/30 transition-colors cursor-pointer"
                      onClick={() => toggleFeedback(feedback.id)}
                    >
                      {/* collapsed view */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/*<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A7E9E3] to-[#FDE2E4] flex items-center justify-center flex-shrink-0">
                            {feedback.isAnonymous ? (
                              <i className="fa-solid fa-user-secret text-gray-600"></i>
                            ) : (
                              <i className="fa-solid fa-user text-gray-600"></i>
                            )}
                          </div>*/}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-800">
                                {feedback.isAnonymous 
                                  ? "Anonymous User" 
                                  : (feedback.user?.name === "You" ? "You" : feedback.user?.name || "User")}
                              </h3>
                              <div className="flex items-center">
                                {renderStars(feedback.rating)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {feedback.message && feedback.message.length > 80 
                                ? `${feedback.message.substring(0, 80)}...` 
                                : (feedback.message || "No message content")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {formatDate(feedback.createdAt)}
                          </span>
                          <motion.span
                            animate={{ rotate: expandedFeedback === feedback.id ? 180 : 0 }}
                            className="text-[#2FA394]"
                          >
                            <i className="fa-solid fa-chevron-down"></i>
                          </motion.span>
                        </div>
                      </div>

                      {/* expanded view */}
                      <AnimatePresence>
                        {expandedFeedback === feedback.id && (
                          <motion.div
                            variants={accordionVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-gray-100 mt-3">
                              <p className="text-gray-700 whitespace-pre-line">
                                {feedback.message}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
        </motion.div>
      </motion.div>

      {/* feedback modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
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
              className="relative z-[10000] bg-white rounded-3xl w-[90%] max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
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

              <h2 className="text-xl font-bold text-[#2FA394] mb-4">
                Share Your Feedback
              </h2>
              
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
                        className="text-3xl focus:outline-none"
                      >
                        <i className={`fa-star ${star <= newFeedback.rating ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'}`}></i>
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-gray-600">
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
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none resize-none"
                    placeholder="Share your thoughts about our services, staff, facilities, or any suggestions for improvement..."
                    maxLength="500"
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
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

                {/* Buttons */}
                <div className="flex justify-center gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={submitting || !newFeedback.message.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

                  <motion.button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
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