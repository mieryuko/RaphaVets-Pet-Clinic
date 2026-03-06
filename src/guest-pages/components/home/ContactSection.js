import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/axios";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\-.][\p{L}\p{M}]+)*$/u;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstName = String(formData.firstName || "").trim();
    const lastName = String(formData.lastName || "").trim();
    const email = String(formData.email || "").trim();
    const subject = String(formData.subject || "").trim();
    const message = String(formData.message || "").trim();

    if (!NAME_PATTERN.test(firstName) || !NAME_PATTERN.test(lastName)) {
      setFeedback({
        type: "error",
        text: "Names can include letters, spaces, apostrophes, hyphens, and accented characters.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback({ type: "", text: "" });

      await api.post("/support/guest", {
        name: `${firstName} ${lastName}`.trim(),
        email,
        subject,
        message,
      });

      setFeedback({ type: "success", text: "Message sent successfully. We will reply soon." });
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.response?.data?.message || "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left side - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Get in <span className="text-[#5EE6FE]">Touch</span>
              </h2>
              <div className="w-24 h-1 bg-[#5EE6FE] rounded-full mb-6" />
              <p className="text-gray-600">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            {/* Contact info cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                  <i className="fas fa-phone" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">0910 124 9052</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                  <i className="fas fa-envelope" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">raphavets.clinic@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                  <i className="fas fa-map-marker-alt" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">Block 3, Lot 22 Camia, Taguig</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                  <i className="fas fa-clock" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Clinic Hours</p>
                  <p className="font-medium text-gray-900">Mon-Sat: 9AM-9PM</p>
                  <p className="font-medium text-gray-900">Sun: 1PM-9PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Send us a message</h3>

            {feedback.text && (
              <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {feedback.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full bg-[#5EE6FE] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#5cdffd] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;