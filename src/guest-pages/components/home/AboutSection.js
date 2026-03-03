import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AboutSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    { value: "3+", label: "Years Experience", icon: "fa-calendar" },
    { value: "1k+", label: "Happy Pets", icon: "fa-paw" },
    { value: "24/7", label: "Emergency Care", icon: "fa-ambulance" },
    { value: "100%", label: "Client Satisfaction", icon: "fa-heart" },
  ];

  return (
    <section id="aboutus" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-[#5EE6FE]">Us</span>
          </h2>
          <div className="w-24 h-1 bg-[#5EE6FE] mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#5EE6FE]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className={`fas ${stat.icon} text-[#5EE6FE]`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right side - Content with justified text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-gray-600 leading-relaxed text-justify">
              Raphavets Pet Clinic is a highly trusted veterinary clinic known for its commitment to exceptional pet care and veterinary services. Whether your pet requires a simple wellness exam, vaccinations, diagnostics, surgery, or emergency assistance, the team at Raphavets Pet Clinic is fully prepared to help.
            </p>
            
            <p className="text-gray-600 leading-relaxed text-justify">
              A highly qualified veterinary team ensures that every pet receives personalized attention and the highest standards of care. The clinic prides itself on combining cutting-edge veterinary medicine with a genuine love for animals.
            </p>

            {/* Optional: Add a subtle divider or spacing element 
            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[#5EE6FE] font-medium hover:underline inline-flex items-center gap-2 transition-all"
              >
                Learn more about us
                <i className="fas fa-arrow-right text-sm" />
              </button>
            </div>*/}
          </motion.div>
        </div>
      </div>

      {/* About Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">More About RaphaVets</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i className="fas fa-times text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src="/images/raphavets-facade.png"
                      alt="Clinic facade"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#5EE6FE] mb-3">Our Mission & Vision</h4>
                    <p className="text-gray-600 text-justify">
                      RaphaVets Pet Clinic's mission is to administer economic, empathetic, and excellent veterinary care to ensure the health and safety of both companion animals and their owners.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 text-justify">
                    RaphaVets Pet Clinic in Taguig City stands as a beacon of excellence in veterinary care, dedicated to providing top-notch services for your beloved pets. With a team of highly skilled veterinarians and compassionate staff, RaphaVets ensures that every animal receives personalized attention tailored to their unique needs.
                  </p>
                  <p className="text-gray-600 text-justify">
                    From routine check-ups to advanced medical treatments, the clinic is equipped with state-of-the-art facilities that guarantee the highest standard of care. The commitment to animal welfare is evident in their proactive approach, emphasizing preventive care and early diagnosis to keep pets healthy and thriving.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Why Choose Us?</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-[#5EE6FE] mt-1" />
                      <span className="text-gray-600"><strong>Compassionate Staff:</strong> Our team is trained in fear-free handling techniques to reduce stress for your pet.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-[#5EE6FE] mt-1" />
                      <span className="text-gray-600"><strong>24/7 Emergency Support:</strong> We have a vet on call for those unexpected moments.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-[#5EE6FE] mt-1" />
                      <span className="text-gray-600"><strong>Holistic Approach:</strong> We believe in treating the whole pet, combining traditional medicine with nutritional counseling.</span>
                    </li>
                  </ul>
                </div>

                <div className="italic text-gray-600 p-4 bg-gray-50 rounded-lg border-l-4 border-[#5EE6FE] text-justify">
                  "We strive to be the partner you trust for your pet's lifelong health journey."
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-[#5EE6FE] text-white py-3 rounded-lg font-medium hover:bg-[#5EE6FE]/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AboutSection;