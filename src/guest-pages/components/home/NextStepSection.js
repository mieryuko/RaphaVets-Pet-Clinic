import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NextStepSection = () => {
  const tools = [
    {
      title: "Cat & Dog Breed Detector",
      icon: "fa-paw", 
      link: "/"
    },
    {
      title: "AI Chatbot",
      icon: "fa-robot", 
      link: "/"
    },
    {
      title: "Schedule a Visit",
      icon: "fa-calendar-check", 
      link: "/"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2 }
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-gray-100 rounded-full text-gray-600 text-sm font-medium mb-4">
            Next Steps
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Take the Next Step
          </h2>
          <div className="w-24 h-1 bg-gray-200 mx-auto rounded-full mb-6" />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore tools designed to keep your pets healthy and happy
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 p-6 cursor-pointer"
              onClick={() => window.location.href = tool.link}
            >
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-[#5EE6FE]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#5EE6FE] transition-colors duration-300">
                  <i className={`fas ${tool.icon} text-3xl text-[#5EE6FE] group-hover:text-white transition-colors duration-300`} />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-center mb-2 text-gray-800">
                {tool.title}
              </h3>
              
              <p className="text-gray-500 text-sm text-center leading-relaxed">
                {index === 0 && "Identify your pet's breed instantly with our AI-powered scanner"}
                {index === 1 && "Get instant answers to your pet care questions 24/7"}
                {index === 2 && "Book appointments easily with our online scheduling system"}
              </p>

              {/* Subtle arrow indicator on hover */}
              <motion.div 
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <i className="fas fa-arrow-right text-[#5EE6FE] text-sm" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <i className="fas fa-paw text-gray-300" />
            All tools are free for registered users
            <i className="fas fa-paw text-gray-300" />
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default NextStepSection;