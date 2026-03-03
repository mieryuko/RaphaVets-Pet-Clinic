import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const servicesData = [
  {
    id: 1,
    name: "Consultation",
    icon: "fa-stethoscope",
    description: "Expert veterinary consultations for your pet's health",
    details: [
      { name: "General Check-up", price: "₱500", description: "Complete physical examination and health assessment" },
      { name: "Specialist Consultation", price: "₱800", description: "Consultation with veterinary specialists" },
      { name: "Follow-up Visit", price: "₱300", description: "Follow-up consultation after treatment" }
    ]
  },
  {
    id: 2,
    name: "Vaccination",
    icon: "fa-syringe",
    description: "Essential vaccines to protect your pets",
    details: [
      { name: "5-in-1 Vaccine (Dog)", price: "₱600", description: "Protects against distemper, hepatitis, parainfluenza, parvovirus, and leptospirosis" },
      { name: "8-in-1 Vaccine (Dog)", price: "₱600", description: "Extended protection including coronavirus" },
      { name: "Anti-Rabies", price: "₱250", description: "Mandatory rabies vaccination" },
      { name: "Kennel Cough", price: "₱250", description: "Protects against Bordetella bronchiseptica" },
      { name: "4-in-1 Vaccine (Cat)", price: "₱850", description: "Feline viral rhinotracheitis, calicivirus, panleukopenia, and chlamydia" }
    ]
  },
  {
    id: 3,
    name: "Surgery",
    icon: "fa-syringe",
    description: "Safe and professional surgical procedures",
    details: [
      { name: "Basic Soft Tissue Surgery", price: "Varies", description: "Lump removal, wound repair, and minor surgeries" },
      { name: "Spay (Female Cat)", price: "₱1,200", description: "Ovariohysterectomy for cats" },
      { name: "Neuter (Male Cat)", price: "₱1,000", description: "Castration for cats" },
      { name: "Spay (Female Dog)", price: "₱2,500-₱5,500", description: "Varies by weight - includes pre-op bloodwork" },
      { name: "Neuter (Male Dog)", price: "₱2,250-₱5,000", description: "Varies by weight - includes pre-op bloodwork" }
    ]
  },
  {
    id: 4,
    name: "Laboratory",
    icon: "fa-flask",
    description: "Advanced diagnostic testing",
    details: [
      { name: "Blood Chemistry", price: "₱2,800", description: "Comprehensive organ function panel" },
      { name: "Complete Blood Count", price: "₱950", description: "Red/white blood cell analysis" },
      { name: "Urinalysis", price: "₱300", description: "Urine composition and infection screening" },
      { name: "Fecalysis", price: "₱250", description: "Parasite and gastrointestinal health check" }
    ]
  },
  {
    id: 5,
    name: "Dental Care",
    icon: "fa-tooth",
    description: "Professional dental services",
    details: [
      { name: "Dental Prophylaxis (1-10kg)", price: "₱5,000", description: "Complete dental cleaning for small pets" },
      { name: "Dental Prophylaxis (15-19kg)", price: "₱7,000", description: "Complete dental cleaning for medium pets" },
      { name: "Tooth Extraction", price: "Varies", description: "Per tooth extraction with anesthesia" }
    ]
  },
  {
    id: 6,
    name: "Preventive Care",
    icon: "fa-shield-alt",
    description: "Keep your pets healthy year-round",
    details: [
      { name: "Deworming", price: "₱150-₱500", description: "Based on weight - oral or injectable" },
      { name: "Microchipping", price: "Varies", description: "Permanent identification with registration" },
      { name: "Health Certificate", price: "₱750", description: "Official health certificate for travel" }
    ]
  },
  {
    id: 7,
    name: "Confinement",
    icon: "fa-hospital",
    description: "24/7 monitoring and care",
    details: [
      { name: "Daily Confinement", price: "₱800/day", description: "Standard hospitalization with monitoring" },
      { name: "ICU Monitoring", price: "₱1,500/day", description: "Intensive care with continuous monitoring" },
      { name: "Post-surgery Care", price: "₱1,000/day", description: "Recovery monitoring after procedures" }
    ]
  }
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const allServicesModalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.2 }
    }
  };

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#5EE6FE]">Services</span>
          </h2>
          <div className="w-24 h-1 bg-[#5EE6FE] mx-auto rounded-full" />
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Comprehensive veterinary care tailored to your pet's unique needs
          </p>
        </motion.div>

        {/* Service Names Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {servicesData.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              onHoverStart={() => setHoveredId(service.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => setSelectedService(service)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 cursor-pointer border border-gray-100 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 text-2xl mb-3 group-hover:bg-[#5EE6FE] group-hover:text-white transition-colors duration-300">
                  <i className={`fas ${service.icon}`} />
                </div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <motion.div
                  className="mt-2 text-[#5EE6FE] text-sm"
                  animate={hoveredId === service.id ? { opacity: 1 } : { opacity: 0 }}
                >
                  <i className="fas fa-chevron-right text-xs" />
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* See All Services Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={() => setShowAllServices(true)}
            className="bg-gradient-to-br from-[#5EE6FE] to-[#3ecbe0] rounded-xl shadow-md p-6 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl mb-3 group-hover:scale-110 transition-transform">
                <i className="fa-border-all" />
              </div>
              <h3 className="font-semibold text-white">See All Services</h3>
              <p className="text-white/80 text-sm mt-1">View details & pricing</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Schedule Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#5EE6FE] text-white px-8 py-4 rounded-full font-medium shadow-sm hover:shadow-md transition-colors duration-300"
          >
            Schedule a Visit
            <i className="fas fa-calendar-check" />
          </a>
        </motion.div>
      </div>

      {/* Single Service Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                    <i className={`fas ${selectedService.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedService.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i className="fas fa-times text-[#5E6C7A]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-[#5E6C7A] mb-6">{selectedService.description}</p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Service Details & Pricing</h4>
                  
                  <div className="space-y-3">
                    {selectedService.details.map((detail, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{detail.name}</span>
                          <span className="font-semibold text-[#5EE6FE]">{detail.price}</span>
                        </div>
                        <p className="text-sm text-[#5E6C7A]">{detail.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#5EE6FE]/10 rounded-lg p-4 mt-4">
                    <p className="text-sm text-[#5E6C7A] flex items-start gap-2">
                      <i className="fas fa-info-circle text-[#5EE6FE] mt-0.5" />
                      <span>Prices may vary based on specific pet needs. Please consult with our veterinarians for an accurate quote.</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      // Navigate to booking
                    }}
                    className="flex-1 bg-[#5EE6FE] text-white py-3 rounded-lg font-medium hover:bg-[#5EE6FE]/90 transition-colors"
                  >
                    Book This Service
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="flex-1 border border-gray-300 text-[#5E6C7A] py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Services Modal */}
      <AnimatePresence>
        {showAllServices && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAllServices(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            <motion.div
              variants={allServicesModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">All Services & Pricing</h3>
                <button
                  onClick={() => setShowAllServices(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i className="fas fa-times text-[#5E6C7A]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="space-y-8">
                  {servicesData.map((service) => (
                    <div key={service.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                          <i className={`fas ${service.icon}`} />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                      </div>
                      
                      <p className="text-[#5E6C7A] text-sm mb-4">{service.description}</p>
                      
                      <div className="grid gap-3">
                        {service.details.map((detail, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900">{detail.name}</span>
                              <span className="font-semibold text-[#5EE6FE]">{detail.price}</span>
                            </div>
                            <p className="text-sm text-[#5E6C7A]">{detail.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#5EE6FE]/10 rounded-lg p-4 mt-6">
                  <p className="text-sm text-[#5E6C7A] flex items-start gap-2">
                    <i className="fas fa-info-circle text-[#5EE6FE] mt-0.5" />
                    <span>Prices may vary based on specific pet needs. Please consult with our veterinarians for an accurate quote.</span>
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAllServices(false);
                      // Navigate to booking
                    }}
                    className="flex-1 bg-[#5EE6FE] text-white py-3 rounded-lg font-medium hover:bg-[#5EE6FE]/90 transition-colors"
                  >
                    Schedule a Visit
                  </button>
                  <button
                    onClick={() => setShowAllServices(false)}
                    className="flex-1 border border-gray-300 text-[#5E6C7A] py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;