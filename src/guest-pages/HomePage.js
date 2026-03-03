import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import HeroSection from "./components/home/HeroSection";
import ServicesSection from "./components/home/ServicesSection";
import AboutSection from "./components/home/AboutSection";
import PetTipsSection from "./components/home/PetTipsSection";
import NextStepSection from "./components/home/NextStepSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import LocationSection from "./components/home/LocationSection";
import FAQSection from "./components/home/FAQSection";
import ContactSection from "./components/home/ContactSection";
import Footer from "./components/home/FooterSection";

const HomePage = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY <= lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const id = location.state.scrollTo;
      // small delay to ensure DOM has rendered
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // clear the navigation state so repeated mounts don't re-scroll
        navigate(location.pathname, { replace: true, state: {} });
      }, 70);
    }
  }, [location, navigate]);

  return (
    <div className="relative min-h-screen bg-white">
      <Header showNavbar={showNavbar} />
      
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <PetTipsSection />
        <NextStepSection />
        <TestimonialsSection />
        <LocationSection />
        <FAQSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;