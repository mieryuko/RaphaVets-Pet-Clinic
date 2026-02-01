import React, { useState } from "react";
import { motion } from "framer-motion";
import ClientLayout from "../ClientLayout";

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("Support form submitted:", formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "fa-phone",
      title: "Phone",
      details: "0910 124 9052",
      subtitle: "Mon-Sat: 9AM-9PM, Sun: 1PM-9PM"
    },
    {
      icon: "fa-envelope",
      title: "Email",
      details: "support@rvcare.com",
      subtitle: "Response within 24 hours"
    },
    {
      icon: "fa-location-dot",
      title: "Location",
      details: "Block 3, Lot 22 Camia, Pembo, Taguig City",
      subtitle: "Get directions."
    }
  ];

  const animationVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      }
    },
    card: {
      hidden: { opacity: 0, scale: 0.95 },
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
    }
  };

  return (
    <ClientLayout>
      <motion.div
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto w-full overflow-y-auto max-h-[calc(120vh-250px)]"
      >
        <motion.div 
          variants={animationVariants.item}
          className="bg-white rounded-3xl p-6 mt-6 shadow-lg border border-gray-100"
        >
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2FA394] mb-2">
              Support Center
            </h1>
            <p className="text-gray-600">
              We're here to help! Contact us for any questions or concerns about our services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-[#E3FAF7] to-[#F0F7FF] rounded-xl p-5 border border-[#2FA394]/20">
                <h2 className="text-lg font-semibold text-[#2FA394] mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      variants={animationVariants.card}
                      whileHover="hover"
                      className="flex items-start gap-3 p-3 bg-white/50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#2FA394]/10 flex items-center justify-center flex-shrink-0">
                        <i className={`fa-solid ${info.icon} text-[#2FA394]`}></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{info.title}</h3>
                        <p className="text-gray-700">{info.details}</p>
                        <p className="text-sm text-gray-500 mt-1">{info.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* FAQ Link */}
              <motion.div
                variants={animationVariants.item}
                className="text-center"
              >
                <p className="text-gray-600 mb-3">
                  Check our comprehensive FAQ section
                </p>
                <motion.a
                  href="/faqs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 text-[#2FA394] font-medium hover:text-[#24907e] transition-colors"
                >
                  <i className="fa-solid fa-circle-question"></i>
                  Browse All FAQs
                </motion.a>
              </motion.div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-[#FFF5E4] to-[#FFF0F7] rounded-xl p-6 border border-[#FFB6C1]/20">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Send us a Message
                </h2>
                <p className="text-gray-600 mb-6">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                {/* Success Message */}
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <i className="fa-solid fa-check text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">Message Sent!</h3>
                        <p className="text-green-600 text-sm">
                          Thank you for contacting us. We'll respond within 24 hours.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent outline-none resize-none"
                      placeholder="Please describe your issue in detail..."
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-6 py-3 rounded-lg font-medium ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#2FA394] hover:bg-[#24907e] text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-paper-plane"></i>
                          Send Message
                        </span>
                      )}
                    </motion.button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({
                        name: "",
                        email: "",
                        subject: "",
                        message: ""
                      })}
                      className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Clear Form
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    * Required fields. We respect your privacy and will not share your information.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ClientLayout>
  );
}