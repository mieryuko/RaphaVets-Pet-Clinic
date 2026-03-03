import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="home" className="relative min-h-screen bg-white py-12">
      {/* Minimal background shape (light accent) */}
      <div className="absolute top-24 right-12 w-40 h-40 bg-[#5EE6FE]/10 rounded-full blur-2xl" />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 min-h-screen flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-center w-full"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <img
                src="/images/rapha-logo.png"
                alt="RaphaVets Logo"
                className="w-32 sm:w-40 lg:w-48 mx-auto lg:mx-0"
              />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
            >
              Caring for Your
              <span className="text-[#5EE6FE]"> Furry Friends</span>
            </motion.h1>

            <motion.h2
              variants={itemVariants}
              className="font-['Baloo_Chettan_2'] italic text-xl sm:text-2xl text-gray-600 mb-8"
            >
              Healing paws, wagging tails, and happy hearts.
            </motion.h2>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#5EE6FE] text-white px-8 py-4 rounded-full font-medium hover:bg-[#5cdffd] transition-colors duration-300"
              >
                Schedule a visit
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            variants={itemVariants}
            className="relative hidden lg:block"
          >
            <div className="relative w-[400px] h-[400px] mx-auto">
              {/* Simple circle frame */}
              <div className="absolute inset-0 rounded-full border border-gray-200" />
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <img
                  src="/images/home-dogcat.png"
                  alt="Happy pets"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;