import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "../ClientLayout";

function FAQs() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [openFAQ, setOpenFAQ] = useState(null);
  const [search, setSearch] = useState("");
  const [faqData, setFaqData] = useState([]);

  // FAQ Data
  /*
  const faqData = {
    "General": [
      {
        id: 1,
        question: "What services does RaphaVets offer?",
        answer: "We provide comprehensive veterinary services including consultations, vaccinations, Complete Blood Count, Microchipping, Deworming, Blood Chemistry Lab, Veterinary Health Certificate, Confinement, and Dental Prophylaxis for dogs and cats."
      },
      {
        id: 2,
        question: "What are your clinic hours?",
        answer: "We're open Monday to Saturday from 9:00 AM to 9:00 PM, and Sundays from 1:00 PM to 9:00 PM."
      },
      {
        id: 3,
        question: "Where is RaphaVets located?",
        answer: "Our clinic is located at Block 3, Lot 22 Camia, Pembo, Taguig Ciy. Get Direction now."
      },
      {
        id: 4,
        question: "Do you accept walk-in clients?",
        answer: "Yes, we accept walk-ins . However, we highly recommend booking appointments to ensure minimal waiting time."
      }
    ],
    "Booking": [
      {
        id: 5,
        question: "How do I book an appointment?",
        answer: "You can book through our website portal. Online bookings are available 24/7."
      },
      {
        id: 6,
        question: "Can I reschedule or cancel my booking?",
        answer: "Yes, you can reschedule or cancel up to 24 hours before your appointment without any charges through your booking dashboard."
      },
      {
        id: 7,
        question: "How early should I book?",
        answer: "We recommend booking at least 2-3 days in advance for regular checkups and 1-2 weeks for specialized services or specific veterinarians."
      },
      {
        id: 8,
        question: "Do you accept emergency cases?",
        answer: "Yes, we prioritize emergency cases. Please call us immediately at 0910 124 9052 for emergencies during clinic hours or visit our emergency contact page for after-hours emergencies."
      }
    ],
    "Pricing": [
      {
        id: 9,
        question: "Are consultation fees fixed?",
        answer: "Basic consultation fees are fixed, but additional services (tests, medications, procedures) may vary based on your pet's needs."
      },
      {
        id: 10,
        question: "Do prices vary per service?",
        answer: "Yes, prices vary depending on the service type, complexity, and duration. We provide transparent pricing estimates before any procedure."
      },
      {
        id: 11,
        question: "What payment methods are accepted?",
        answer: "We accept cash, credit/debit cards, and online transfers."
      },
      {
        id: 12,
        question: "Are there additional charges for emergencies?",
        answer: "Emergency services may have a premium fee due to immediate care and after-hours staffing. We'll always inform you of costs before treatment."
      }
    ],
    "Privacy": [
      {
        id: 13,
        question: "Is my personal information safe?",
        answer: "Absolutely. We use encrypted systems and follow strict data protection protocols in compliance with privacy laws."
      },
      {
        id: 14,
        question: "How is my pet's medical record handled?",
        answer: "Medical records are stored securely in our digital system and are only accessible to authorized veterinary staff for treatment purposes."
      },
      {
        id: 15,
        question: "Who can access my data?",
        answer: "Only our veterinary team and authorized administrative staff have access. We never share data without your explicit consent."
      },
      {
        id: 16,
        question: "Do you share data with third parties?",
        answer: "We only share data when required by law or with pet insurance providers you've authorized, and only the minimum necessary information."
      }
    ],
    "Services": [
      {
        id: 17,
        question: "What animals do you treat?",
        answer: "We treat dogs and cats only."
      },
      {
        id: 18,
        question: "Do you offer vaccinations and grooming?",
        answer: "Yes! We provide complete vaccination schedules and professional grooming services by trained staff."
      },
      {
        id: 19,
        question: "Do you provide surgery services?",
        answer: "We offer various surgical procedures from routine spaying/neutering to more complex operations, all performed by our experienced veterinary surgeons."
      },
      {
        id: 20,
        question: "Are lab tests available on-site?",
        answer: "Yes, we have a fully equipped laboratory for immediate blood tests, urinalysis, and other diagnostics to provide quick results."
      }
    ]
  };
  */
  // Categories for filtering
  const categories = ["General", "Booking", "Pricing", "Privacy", "Services"];

  // Filter FAQs based on search
  const filteredFAQs = search 
    ? Object.entries(faqData).reduce((acc, [category, faqs]) => {
        const filtered = faqs.filter(faq => 
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[category] = filtered;
        }
        return acc;
      }, {})
    : { [activeCategory]: faqData[activeCategory] };

  // Toggle FAQ
  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

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
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const accordionVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      marginTop: "0.5rem",
      marginBottom: "0",
      paddingTop: "0.25rem",
      paddingBottom: "1rem",
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, ease: "easeInOut" },
        padding: { duration: 0.3 },
        margin: { duration: 0.3 }
      }
    }
  };

  const filterVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto w-full bg-white shadow-md rounded-xl p-6"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-semibold text-[#2FA394]">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 mt-1">
              Find answers to common questions about our veterinary services
            </p>
          </div>
          <motion.input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE] focus:outline-none mt-3 sm:mt-0 w-full sm:w-64"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div 
          variants={containerVariants}
          className="flex flex-wrap gap-3 mb-8"
        >
          {search && (
            <motion.button
              variants={filterVariants}
              onClick={() => setSearch("")}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#2FA394] text-white border border-[#2FA394]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Search
            </motion.button>
          )}
          
          {categories.map((cat, index) => (
            <motion.button
              key={cat}
              variants={filterVariants}
              onClick={() => {
                if (search) {
                  setSearch("");
                  setActiveCategory(cat);
                } else {
                  setActiveCategory(cat);
                }
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                (!search && activeCategory === cat) || 
                (search && filteredFAQs[cat]?.length > 0)
                  ? "bg-[#2FA394] text-white border-[#2FA394]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-[#E3FAF7]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              {cat} {search && `(${filteredFAQs[cat]?.length || 0})`}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQs Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={search || activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {search ? (
              // Search Results View
              Object.entries(filteredFAQs).map(([category, faqs]) => (
                <motion.div key={category} className="mb-8">
                  <h2 className="text-lg font-semibold text-[#2FA394] mb-4">
                    {category} ({faqs.length})
                  </h2>
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <motion.div
                        key={faq.id}
                        variants={itemVariants}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-800">
                            {faq.question}
                          </span>
                          <motion.span
                            animate={{ rotate: openFAQ === faq.id ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[#2FA394] text-xl"
                          >
                            +
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {openFAQ === faq.id && (
                            <motion.div
                              variants={accordionVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="px-4 pb-4"
                            >
                              <p className="text-gray-600">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              // Category View
              <div className="space-y-4">
                {faqData[activeCategory]?.map((faq) => (
                  <motion.div
                    key={faq.id}
                    variants={itemVariants}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800">
                        {faq.question}
                      </span>
                      <motion.span
                        animate={{ rotate: openFAQ === faq.id ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#2FA394] text-xl"
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openFAQ === faq.id && (
                        <motion.div
                          variants={accordionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="px-4 pb-4"
                        >
                          <p className="text-gray-600">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* No Results Message */}
        {search && Object.keys(filteredFAQs).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-4">🐾</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No FAQs found
            </h3>
            <p className="text-gray-500">
              Try searching with different keywords or browse by category
            </p>
          </motion.div>
        )}

        {/* Contact CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-12 p-6 bg-gradient-to-r from-[#E3FAF7] to-[#F0F7FF] rounded-xl border border-[#2FA394]/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#2FA394]">
                Still have questions?
              </h3>
              <p className="text-gray-600">
                Can't find what you're looking for? Contact our support team.
              </p>
            </div>
            <motion.button
              onClick={() => window.location.href = "/support"}
              className="mt-4 md:mt-0 bg-[#2FA394] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#24907e] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </ClientLayout>
  );
}

export default FAQs;