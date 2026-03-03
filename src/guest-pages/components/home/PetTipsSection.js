import React, { useState } from "react";
import { motion } from "framer-motion";
import PetTipsOverlay from "../../components/PetTipsOverlay";

const PetTipsSection = () => {
  const [showTipsOverlay, setShowTipsOverlay] = useState(false);

  const tips = [
    { step: "Feed right", icon: "fa-bowl-food" },
    { step: "Stay clean", icon: "fa-soap" },
    { step: "Daily fun", icon: "fa-futbol" },
    { step: "Check ups", icon: "fa-stethoscope" },
  ];

  return (
    <>
      <section id = "pettips" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Follow these simple steps to learn how
            </h2>
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              to care for your dogs and cats
            </h3>
            <div className="w-24 h-1 bg-[#5EE6FE] mx-auto mt-4 rounded-full" />
          </motion.div>

          <div className="relative">
            {/* Step labels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-8">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-[#5EE6FE] text-xl shadow-sm">
                    <i className={`fas ${tip.icon}`} />
                  </div>
                  <h4 className="font-semibold text-gray-800">{tip.step}</h4>
                </motion.div>
              ))}
            </div>

            {/* See all tips button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <button
                onClick={() => setShowTipsOverlay(true)}
                className="inline-flex items-center gap-2 text-[#5EE6FE] font-semibold transition-colors duration-300 hover:text-[#3ecbe0]"
              >
                <span>See all tips</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block"
                >
                  →
                </motion.span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {showTipsOverlay && (
        <PetTipsOverlay onClose={() => setShowTipsOverlay(false)} />
      )}
    </>
  );
};

export default PetTipsSection;