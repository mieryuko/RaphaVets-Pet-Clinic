import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  
  const linkClasses = "text-gray-400 hover:text-[#5EE6FE] transition-colors duration-300 cursor-pointer";
  const serviceLinkClasses = "text-gray-400 hover:text-[#5EE6FE] transition-colors duration-300 cursor-default";

  // Handle quick link clicks for smooth scrolling
  const handleQuickLinkClick = (e, href) => {
    e.preventDefault();
    
    if (href === "/home") {
      navigate("/home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // For anchor links (#services, #about, etc.)
      const id = href.replace("#", "");
      navigate("/home", { state: { scrollTo: id } });
    }
  };

  return (
    <footer className="relative bg-gray-800 text-white">
      {/* minimal top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo and branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="/images/rapha-logo.png"
              alt="RaphaVets Logo"
              className="h-16 w-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-1">RaphaVets</h3>
            <p className="text-sm text-gray-400 tracking-widest">PET CLINIC</p>
            <p className="text-gray-400 text-sm mt-4">
              Providing exceptional veterinary care with compassion and expertise.
            </p>
          </motion.div>

          {/* Quick Links - Now Working */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/home" 
                  onClick={(e) => handleQuickLinkClick(e, "/home")}
                  className={linkClasses}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  onClick={(e) => handleQuickLinkClick(e, "#services")}
                  className={linkClasses}
                >
                  Services
                </a>
              </li>
              <li>
                <a 
                  href="#aboutus" 
                  onClick={(e) => handleQuickLinkClick(e, "#aboutus")}
                  className={linkClasses}
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleQuickLinkClick(e, "#contact")}
                  className={linkClasses}
                >
                  Contact
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => handleQuickLinkClick(e, "#faq")}
                  className={linkClasses}
                >
                  FAQ
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Services - Not clickable but can hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><span className={serviceLinkClasses}>Consultation</span></li>
              <li><span className={serviceLinkClasses}>Vaccination</span></li>
              <li><span className={serviceLinkClasses}>Surgery</span></li>
              <li><span className={serviceLinkClasses}>Laboratory</span></li>
              <li><span className={serviceLinkClasses}>Dental Care</span></li>
            </ul>
          </motion.div>

          {/* Social Media - Icons now white */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-bold mb-4">Connect With Us</h4>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/RaphaVets/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-[#5EE6FE] transition-colors"
              >
                <i className="fab fa-facebook-f text-white text-lg w-5" />
                <span>RaphaVets Pet Clinic</span>
              </a>
              <a
                href="https://www.instagram.com/explore/locations/106483752003308/raphavets-pet-clinic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-[#5EE6FE] transition-colors"
              >
                <i className="fab fa-instagram text-white text-lg w-5" />
                <span>raphavetspetclinic</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Contact bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-[#5EE6FE]" />
                Block 3, Lot 22 Camia, Taguig
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-phone text-[#5EE6FE]" />
                0910 124 9052
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-envelope text-[#5EE6FE]" />
                raphavets.clinic@gmail.com
              </span>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>&copy; {new Date().getFullYear()} RaphaVets Pet Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;