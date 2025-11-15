import React, { useState, useEffect, useRef } from "react";

//footer components
const MapPinIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const MailIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
);
const PhoneIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72 17.58 17.58 0 0 0 .1 1.67 2 2 0 0 1-.41 1.92l-1.84 1.84a18 18 0 0 0 8.64 8.64l1.84-1.84a2 2 0 0 1 1.92-.41 17.58 17.58 0 0 0 1.67.1A2 2 0 0 1 22 16.92z" />
    </svg>
);

// Fallback for image loading errors
const ImageFallback = ({ src, alt, className, fallbackText }) => (
    <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => { 
            e.target.onerror = null; 
            // Using a simple placeholder text on error
            e.target.src = `https://placehold.co/${e.target.width}x${e.target.height}/F3F4F6/9CA3AF?text=${fallbackText}`; 
            e.target.className = className + ' object-contain text-xs'; // Ensure placeholder text is visible
        }}
    />
);


const FooterContent = () => {
    
    const linkClasses = "text-gray-600 hover:text-[#5EE6FE] transition duration-200";
  
    const verticalDividerClasses = "absolute right-0 top-0 hidden md:block h-full w-0.5 bg-[#5EE6FE]";
    
    const contactDividerClasses = "absolute right-0 top-1/2 -translate-y-1/2 hidden md:block h-6 w-0.5 bg-[#5EE6FE]";

    return (
        <footer className="w-full bg-white text-gray-800">
            <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 md:gap-x-12 pb-8">
                    
                    {/* Column 1: Logo and Branding */}
                    <div className="md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left md:pl-20">
                        <ImageFallback 
                            src="/images/rapha-logo.png" 
                            alt="RaphaVets Pet Clinic Logo" 
                            className="h-20 w-auto mb-4"
                            fallbackText="Rapha Logo"
                        />
                        <h3 className="text-xl font-bold text-gray-800">RaphaVets</h3>
                        <p className="text-gray-600 text-sm tracking-widest">PET CLINIC</p>
                    </div>
                    
                    {/* Columns 2, 3 container  */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-12 md:gap-0">
                        
                        {/* Column 2: Quick Links */}
                        <div className="relative md:pl-8">
                          
                            <h4 className="text-lg font-bold mb-4 text-gray-800">Quick Links</h4>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <ul className="space-y-2">
                                    <li><a href="#" className={linkClasses}>Get Started</a></li>
                                    <li><a href="#" className={linkClasses}>About us</a></li>
                                    <li><a href="#" className={linkClasses}>Services</a></li>
                                    <li><a href="#" className={linkClasses}>Clinic Location</a></li>
                                </ul>
                                <ul className="space-y-2">
                                    <li><a href="#" className={linkClasses}>Pet Tips</a></li>
                                    <li><a href="#" className={linkClasses}>Contact us</a></li>
                                    <li><a href="#" className={linkClasses}>Frequently Asked Questions</a></li>
                                </ul>
                            </div>
                            {/* Vertical Separator for desktop  */}
                            <div className={verticalDividerClasses}></div>
                        </div>

                        {/* Column 3: Social Media Account */}
                        <div className="relative md:pl-16">
                            <h4 className="text-lg font-bold mb-4 text-gray-800">Social Media Account</h4>
                            <ul className="space-y-3">
                                {/* Facebook Link */}
                                <li className="flex items-center space-x-3">
                                    <ImageFallback 
                                        src="/images/fb-icon.png" 
                                        alt="Facebook Icon" 
                                        className="h-5 w-5 rounded-full"
                                        fallbackText="FB"
                                    />
                                    <a href="#" className={linkClasses}>RaphaVets Pet Clinic</a>
                                </li>
                                {/* Instagram Link */}
                                <li className="flex items-center space-x-3">
                                    <ImageFallback 
                                        src="/images/ig-icon.png" 
                                        alt="Instagram Icon" 
                                        className="h-5 w-5 rounded-full"
                                        fallbackText="IG"
                                    />
                                    <a href="#" className={linkClasses}>raphavetspetclinic</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Contact Information Bar */}
                <div className="flex flex-col md:flex-row justify-center items-center py-6 space-y-4 md:space-y-0 text-sm text-gray-600 border-t border-gray-200">
                    <div className="flex items-center space-x-2 md:pr-6 relative">
                        <MapPinIcon className="text-[#26B7D8]" />
                        <span>Blk 3, Lot 22, Camia st, Pembo, Taguig, Philippines</span>
                        {/* Vertical Separator for desktop */}
                        <div className={contactDividerClasses}></div>
                    </div>
                    <div className="flex items-center space-x-2 md:px-6 relative">
                        <MailIcon className="text-[#26B7D8]" />
                        <span>raphavets.clinic@gmail.com</span>
                      
                        <div className={contactDividerClasses}></div>
                    </div>
                    <div className="flex items-center space-x-2 md:pl-6">
                        <PhoneIcon className="text-[#26B7D8]" />
                        <span>0910 124 9052</span>
                    </div>
                </div>
                
            </div>
            
            {/* Copyright Bar */}
            <div className="w-full bg-[#5EE6FE] py-3 text-center">
                <p className="text-sm text-white">
                    &copy; 2025 RaphaVets Pet Clinic — All rights reserved.
                </p>
            </div>
        </footer>
    );
};


//end of footer






// CLINIC DATA & COMPONENTS

const CLINIC_LOCATION = { lat: 14.5473643, lng: 121.0610568 };
const CLINIC_PLACE_ID = "ChIJWdcfwG3JlzMR0YvkCG4NGT0"; 

function ClinicLocationMap() {
  // The Google Maps Embed 
  const EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d692.2658956036637!2d121.06040213950331!3d14.547320099402103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c96dc01fd759%3A0x3d190d6e08e48bd1!2sRaphaVets%20Pet%20Clinic!5e1!3m2!1sen!2sph!4v1761728215056!5m2!1sen!2sph";

  return (
    //  container with  full-width facade image
    <div
      className="w-full py-16 relative"
      style={{
        backgroundImage: "url(/images/raphavets-facade.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* white overlay */}
      <div className="absolute inset-0 bg-white opacity-60 z-0"></div>

      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-12">
        

        {/* Flex container (desktop) */}
        <div className="flex flex-col md:flex-row gap-8 mt-8 items-center md:items-stretch">
          
          {/* start of  Map Section */}
        
        
          <div className="w-full md:w-2/3 rounded-xl shadow-xl overflow-hidden border-4 border-[#5EE6FE]">
            
            
            <div className="w-full h-full min-h-[400px] md:min-h-[500px]">
              <iframe 
                title="RaphaVets Pet Clinic Location Map"
                src={EMBED_URL}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            
          </div>
     
          {/* Details Box */}
          <div className="w-full md:w-1/4 text-white bg-black/30 backdrop-blur-sm rounded-xl p-6 flex flex-col justify-center items-center text-center md:items-start md:text-left shadow-2xl">
            <h3 className="text-4xl font-bold text-[#5EE6FE]">
              Visit Us!
            </h3>
            
            {/* Address and Phone */}
            <p className="mt-4 text-lg">
              Block 3, Lot 22 Camia,
              <br />
              Taguig, Metro Manila
            </p>
            <p className="mt-4 text-lg">
              <strong>Phone:</strong> +63 910 124 9052
            </p>

            {/* "Get Directions" button */}
            <div className="mt-6 w-full">
              
              {/* "Get Directions" link using Place ID */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=place_id:${CLINIC_PLACE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#5EE6FE] text-white px-8 py-6 rounded-lg font-bold shadow-md transform transition duration-200 hover:shadow-3xl hover:-translate-y-0.5"
              >
                Get Directions &#8594;
              </a>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 
// TESTIMONIALS 
// 

const TestimonialSlider = () => {
  const testimonials = [
    {
      id: 1,
      text: "I'm so grateful for the excellent care provided by this veterinary clinic. The doctors and assistants were truly wonderful... The level of care and attention given to my lya was exceptional. The staff kept me well-informed throughout the process, providing regular updates. I wholeheartedly recommend this clinic for their outstanding service and care. Thank you so much RaphaVets Pet Clinic.",
      author: "Winona T",
    },
    {
      id: 2,
      text: "We are happy that this vet is open until 9pm. We’re almost losing hope where to bring our furbaby, Snow, after constant vomiting and refusing to eat. Doc and his assistant were very accommodating. We’re attended immediately, and some tests were performed right away. Some tests were much affordable compared to other vets within the area which closes early, and so the consultation fee. We found out that she has parasites and was dewormed right away. CBC test was also performed and she was suspected to be infected by some viral cat viruses but we’re happy that our baby recovered immediately, just following the instructions and meds given to her. Our baby was now healthy and active, thanks to this vet clinic.",
      author: "Roed M",
    },
    {
      id: 3,
      text: "I couldn’t be more grateful for the exceptional care my pet received at RaphaVets Pet Clinic! From the moment we walked in, the staff was warm, professional, and clearly passionate about animals. The clinic was clean, well-organized, and had a calming atmosphere that immediately put my pet at ease.",
      author: "Cherry B",
    },
    {
      id: 4,
      text: "Thankyou Raphavets, grabe asikaso at alaga nila sa furbaby ko. Nakasurvive sya sa parvo. 2nd life na nia ngyon 😍 hindi nila ako binigo and tinotoo nila ung sabi nila na sila na raw mastress sa pag alaga kay Pogi kaya wag na raw ako mastress. (Kasi preggy ako) Consistent sila sa mga updates with video pa kaya talagang worth it ang lahat . 1st night palang ng furbaby ko inexplain na nila lahat ng gagawin nila. Super duper thankyou po talaga kay Doc Eric and sa mga assistants nia sa pagcheck, alaga at asikaso sa furbaby ko... Highly recommended 🥰",
      author: "Myleen R",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="relative py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-[#263238] mb-12">
          What Pet Owners Say About Us
        </h2>

        <div className="relative flex items-center justify-center">
          {/* Previous Button */}
          <button
            onClick={goToPrevSlide}
            className="absolute left-0 z-10 p-3 rounded-full bg-[#5EE6FE] text-[#263238] 
                                    hover:bg-[#47D5E8] shadow-lg transition duration-200
                                    -ml-8 md:-ml-12 focus:outline-none focus:ring-4 focus:ring-[#5EE6FE]/50"
            aria-label="Previous Testimonial"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Testimonial Content */}
          <div className="relative w-full overflow-hidden">
            <div
              key={currentTestimonial.id}
              className="p-8 bg-white rounded-xl shadow-xl border border-gray-100 min-h-[250px] flex flex-col justify-center"
            >
              <p className="text-xl italic text-gray-700 mb-6 leading-relaxed">
                "{currentTestimonial.text}"
              </p>
              <p className="text-lg font-bold text-[#263238]">
                - {currentTestimonial.author}
              </p>
            </div>
          </div>

          {/* Next Button*/}
          <button
            onClick={goToNextSlide}
            className="absolute right-0 z-10 p-3 rounded-full bg-[#5EE6FE] text-[#263238] 
                                    hover:bg-[#47D5E8] shadow-lg transition duration-200
                                    -mr-8 md:-mr-12 focus:outline-none focus:ring-4 focus:ring-[#5EE6FE]/50"
            aria-label="Next Testimonial"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* TB Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <span
              key={index}
              className={`block w-3 h-3 rounded-full cursor-pointer transition-colors duration-300
                                        ${
                                          currentIndex === index
                                            ? "bg-[#5EE6FE]"
                                            : "bg-gray-300 hover:bg-gray-400"
                                        }
                                      `}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setShowNavbar((prev) => {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          return false;
        } else {
          return true;
        }
      });

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const serviceItems = [
    ["Consultation", "Vaccination"],
    ["Basic Soft Tissue Surgery", "Blood Chemistry"],
    ["Complete Blood Count", "Laboratory"],
    ["Microchipping", "Veterinary Health Certificate"],
    ["Capon", "Confinement"],
    ["Deworming", "Dental Prophylaxis"],
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="w-full bg-[#FFFBFB]/80 backdrop-blur-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 w-full justify-end">
              {/* Desktop Menu */}
              <div className="hidden md:flex md:items-center md:space-x-8 mr-4">
                {["Home", "Services", "Pet Tips", "About us"].map(
                  (item, index) => (
                    <a
                      key={index}
                      href={`#${item.toLowerCase().replace(" ", "")}`}
                      className="relative inline-block group text-black hover:text-gray-800 transform transition duration-200 ease-out hover:scale-105"
                    >
                      {item}
                      <span className="absolute left-0 -bottom-1 h-[2px] bg-[#5EE6FE] w-0 group-hover:w-full transition-all duration-200" />
                    </a>
                  )
                )}
              </div>

              {/* get started */}
              <div className="hidden md:block">
                <a
                  href="/"
                  className="bg-[#5EE6FE] text-white px-4 py-2 rounded-lg font-medium shadow-sm transform transition duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  Get Started
                </a>
              </div>

              {/* mobile menu but */}
              <button
                onClick={() => setMobileOpen((s) => !s)}
                className="md:hidden ml-3 inline-flex items-center justify-center p-2 rounded-md text-black focus:outline-none"
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* mble dropdown */}
          {mobileOpen && (
            <div className="md:hidden bg-white/95 border-t">
              <div className="px-4 pt-4 pb-4 space-y-2 text-right">
                {["Home", "Services", "Pet Tips", "About us"].map(
                  (item, index) => (
                    <a
                      key={index}
                      href={`#${item.toLowerCase().replace(" ", "")}`}
                      className="block text-black py-2 px-2 rounded hover:bg-gray-100 transform transition duration-150"
                    >
                      {item}
                    </a>
                  )
                )}
                <a
                  href="/"
                  className="block mt-2 w-full text-center bg-[#5EE6FE] text-white px-4 py-2 rounded-lg font-medium transform transition duration-150 hover:shadow-md"
                >
                  Get Started
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] pt-16">
        {/* LEFT SECTION */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-start px-6 md:px-12 lg:px-20 pt-12 md:pt-20">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <img
                src="/images/rapha-logo.png"
                alt="RaphaVets Logo"
                className="mx-auto w-36 sm:w-48 md:w-64 lg:w-80"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="font-[Baloo Chettan] italic text-lg sm:text-xl md:text-2xl text-gray-800">
                Healing paws, wagging tails, and happy hearts.
              </h2>
            </div>

            <div>
              <a
                href="#schedule"
                className="inline-block text-white bg-[#5EE6FE] px-6 py-3 rounded-md font-medium shadow-sm hover:shadow-md transform transition duration-150"
              >
                Schedule a visit →
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full md:w-1/2 flex items-center justify-center relative overflow-visible">
          <div
            aria-hidden="true"
            style={{
              "--circle-size": "clamp(250px, 45vw, 570px)",
            }}
            className="pointer-events-none w-full h-full relative"
          >
            {/* image layer */}
            <div className="relative z-30 pointer-events-auto">
              <img
                src="/images/home-dogcat.png"
                alt="dog and cat"
                className="relative z-30 w-auto h-auto max-w-full transform translate-x-24 translate-y-6 sm:translate-x-28 sm:translate-y-8 md:translate-x-32 md:translate-y-10 lg:translate-x-36 lg:translate-y-12 transition-transform duration-300"
              />
            </div>

            {/* circle bg */}
            <div
              className="absolute top-1/2 right-[calc(-1*var(--circle-size)/9)] -translate-y-1/2 rounded-full bg-[#FFFBFB]/10 border-[35px] border-[#5EE6FE]/40 shadow-lg z-10"
              style={{
                width: "var(--circle-size)",
                height: "var(--circle-size)",
              }}
            />
          </div>
        </div>
      </div>

      {/* NEW SERVICES SECTION (Shape divider and content) */}
      <div className="relative w-full overflow-x-hidden leading-[0] z-[5] -translate-y-[110px]">
        {/* Wave SVG for divider */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="block w-[calc(100%+1.3px)] h-[143px]"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19
                    c-82.26-17.34-168.06-16.33-250.45.39
                    -57.84,11.73-114,31.07-172,41.86
                    A600.21,600.21,0,0,1,0,27.35V120H1200V95.8
                    C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            fill="#E0F7FA"
          />
        </svg>

        <div className="relative w-full flex flex-col items-center pb-16 pt-8">
          {/* Background gradient for the service section */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, #E0F7FA 0%, #B2EBF2 43%, #FFFFFF 100%)",
            }}
          />

          {/* Title - Discover our services */}
          <h2 className="relative z-10 text-3xl sm:text-4xl font-semibold text-gray-800 mt-2 mb-8 md:mb-12">
            Discover our services
          </h2>

          {/* Wrapper for image and services box */}
          <div className="relative w-full max-w-7xl flex flex-col md:flex-row justify-center items-center gap-6 px-4 sm:px-8 md:px-12 lg:px-20">
            
            {/* The main container for the image and service box na may overlap */}
            <div className="relative flex flex-col md:flex-row items-center w-full max-w-4xl mx-auto mt-10 md:mt-20">
             
             
              {/* Masked Image Group ea sa bilog */}
              <div className="absolute left-0 -top-20 sm:-top-24 md:static md:w-auto md:h-auto md:self-center z-30">
                <div
                  className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px]
                                  bg-gray-200 rounded-full overflow-hidden shadow-2xl mx-auto md:ml-0 md:mr-4"
                >
                 
                  {/* ea na may circle container */}
                  <img
                    src="/images/home-female.png"
                    alt="Woman holding cat and dog"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center 40%" }}
                  />
                  <div className="absolute inset-0 rounded-full ring-8 ring-white/30 pointer-events-none"></div>
                </div>
              </div>

              {/* Black container ng services */}

              <div
                className="relative w-full max-w-xl md:max-w-2xl bg-black rounded-xl p-8 shadow-xl z-20 text-white
                                mt-36 sm:mt-40 md:mt-0 md:ml-[-120px] lg:ml-[-150px] xl:ml-[-160px] py-10 h-[350px]
                                md:pl-32 lg:pl-40"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {serviceItems.flat().map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 text-sm sm:text-base"
                    >
                      <img
                        src="/images/vertical-white-paws.png"
                        alt="White paw icon"
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="flex-1">{service}</span>
                    </div>
                  ))}
                </div>

                {/* Learn More Button */}
                <div className="mt-8 text-center sm:text-right">
                  <a
                    href="#contact"
                    className="inline-block bg-[#5EE6FE] text-white px-6 py-3 rounded-lg font-bold shadow-md transform transition duration-200 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAW STEPS SECTION */}
        <div className="w-full text-center py-16 px-4">
          {/* Section Title */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-10">
            Follow these simple steps to learn how
          </h2>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-10">
            to care for your dogs and cats.
          </h2>

          {/* Main Container for Image and Text Alignment */}
          <div className="relative max-w-5xl mx-auto flex flex-col items-center">
            {/* responsive image paw prints */}
            <div className="w-[85%] sm:w-[70%] md:w-[60%] lg:w-[50%] mb-4">
              <img
                src="/images/paw-steps-black.png"
                alt="Paw steps design element"
                className="w-full h-auto"
              />
            </div>

            {/* Text Labels Row () */}
            <div className="w-full max-w-[500px] flex justify-between px-4 sm:px-0">
              {/* linear texts below */}
              <div className="flex justify-between w-3/4 mr-2">
                <span className="text-sm sm:text-base font-medium text-black-700 w-1/4">
                  Feed right
                </span>
                <span className="text-sm sm:text-base font-medium text-black-700 w-1/4">
                  Stay clean
                </span>
                <span className="text-sm sm:text-base font-medium text-black-700 w-1/4">
                  Daily fun
                </span>
                <span className="text-sm sm:text-base font-medium text-black-700 w-1/4">
                  Check ups
                </span>
              </div>

              {/* Button/Link for "See all tips" */}
              <div className="w-1/4 flex justify-end">
                <a
                  href="#pettips"
                  className="text-sm sm:text-base font-bold text-black transition duration-200 hover:text-[#5EE6FE]"
                >
                  See all tips →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- START OF TAKE THE NEXT STEP SECTION --- */}

        <div className="relative w-full overflow-x-hidden leading-[0] z-[5] -translate-y-[1px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="block w-[calc(100%+1.3px)] h-[30px] -translate-y-px relative z-10"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19
        c-82.26-17.34-168.06-16.33-250.45.39
        -57.84,11.73-114,31.07-172,41.86
        A600.21,600.21,0,0,1,0,27.35V120H1200V95.8
        C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill="#fdfcfcff"
              transform="rotate(180 600 60)"
            />
          </svg>

          {/* Container for image */}
          <div
            className="relative w-full flex flex-col items-center pt-8 pb-16 px-4 -mt-7"
            style={{
              // default bg color.
              background: "#B2EBF2",
            }}
          >
            {/* bg image with Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/images/cat-paw-bg.png" //
                alt="Background large cat paw"
                className="w-full h-full object-cover object-center"
              />
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: "#79eef7af", //
                }}
              ></div>
            </div>

            {/* Content Text and Tools */}
            <div className="relative z-10 max-w-7xl mx-auto text-center">
              <h2
                className="text-3xl sm:text-4xl font-extrabold mb-2 text-white"
                style={{ color: "#ffffffff" }}
              >
                {" "}
                {/* Dark text color to match image */}
                TAKE THE NEXT STEP...
              </h2>
              <p
                className="text-lg sm:text-xl font-medium mb-12"
                style={{ color: "#ffffffff", opacity: 0.8 }}
              >
                {" "}
                {/* Dark text color to match image */}
                Explore tools designed to keep your pets healthy and happy.
              </p>

              {/* Tools/Features Grid (with fixed white icons) */}
              <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                {/* Tool 1: Cat & Dog Breed Detector */}
                <div className="flex flex-col items-center justify-start">
                  <div className="w-20 h-20 mb-4">
                    <img
                      src="/images/pet-scanner-img.png"
                      alt="Pet Scanner Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <a
                    href="#breed-detector"
                    className="bg-white text-[#5EE6FE] px-4 py-2 rounded-full font-bold shadow-lg text-sm sm:text-base hover:bg-gray-100 transition duration-200"
                  >
                    Cat & Dog Breed Detector
                  </a>
                </div>

                {/* Tool 2: AI Chatbot */}
                <div className="flex flex-col items-center justify-start">
                  <div className="w-20 h-20 mb-4">
                    <img
                      src="/images/chat-bot-icon.png"
                      alt="AI Chatbot Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <a
                    href="#chatbot"
                    className="bg-white text-[#5EE6FE] px-4 py-2 rounded-full font-bold shadow-lg text-sm sm:text-base hover:bg-gray-100 transition duration-200"
                  >
                    AI Chatbot
                  </a>
                </div>

                {/* Tool 3: Schedule a Visit */}
                <div className="flex flex-col items-center justify-start">
                  <div className="w-20 h-20 mb-4">
                    <img
                      src="/images/schedule-visit-icon.png"
                      alt="Schedule a Visit Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <a
                    href="#schedule"
                    className="bg-white text-[#5EE6FE] px-4 py-2 rounded-full font-bold shadow-lg text-sm sm:text-base hover:bg-gray-100 transition duration-200"
                  >
                    Schedule a Visit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* --- END OF TAKE THE NEXT STEP SECTION --- */}

      
        {/* TESTIMONIAL SLIDER PLACEMENT */}

        <TestimonialSlider />
        {/* --- END OF  SLIDER --- */}

        {/* --- where are we? - map area--- */}

        <ClinicLocationMap />

        {/* -thats it */}
      
                 
      
      
       
      


 {/* FAQ SECTION */}
<section id="faq" className="bg-white py-20 px-6 md:px-16 lg:px-32">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
    
    
    
    {/* LEFT SIDE — Title, Description, Buttons */}
    <div className="w-full md:w-1/3">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">FAQs</h2>
      <p className="text-gray-600 mb-6">
        Everything you need to know
      </p>

      <p className="text-gray-600 mb-6">
        about the features, clinic, and troubleshooting.
      </p>

      

      <div className="flex flex-wrap gap-3">
        <button className="bg-[#5EE6FE] text-white font-medium px-4 py-4 rounded-xl shadow-md hover:shadow-lg transition duration-200">
          Getting started
        </button>
        <button className="border border-gray-400 text-gray-800 px-4 py-4 rounded-xl shadow-sm hover:bg-gray-100 transition duration-200">
          Basic Information
        </button>
        <button className="border border-gray-400 text-gray-800 px-4 py-4 rounded-xl shadow-sm hover:bg-gray-100 transition duration-200">
          Pricing
        </button>
        <button className="border border-gray-400 text-gray-800 px-4 py-4 rounded-xl shadow-sm hover:bg-gray-100 transition duration-200">
          Book Request
        </button>
      </div>
    </div>

    {/* RIGHT SIDE — Questions */}
    <div className="w-full md:w-2/3">
      <div className="space-y-6">
        {[
          {
            question: "How do I sign up for an account?",
            answer:
              "Signing up is easy! Just click the Get Started button on top and follow the prompts. You can use your email address or Google to create your account.",
          },
          {
            question: "Do I need an account to use the clinic’s services?",
            answer:
              "No, you can still visit the clinic and avail walk-in services, but having an account helps you keep records, book appointments, and track your pet’s health history. You could also use some of our features by using guest account",
          },
          {
            question: "Can I register multiple pets under one account?",
            answer:
              "Absolutely! You can register and manage multiple pets under a single account for easier record keeping and appointment scheduling.",
          },
          {
            question: "I forgot my password. What should I do?",
            answer:
              "Click on Forgot Password on the login page, then follow the instructions sent to your registered email address to reset your password.",
          },
        ].map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800">
                {item.question}
                <span className="text-[#5EE6FE] text-2xl font-bold transition-all duration-200 group-open:rotate-0 group-open:text-[#d1e8ed]">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <div className="mt-3 ml-4 pl-4 border-l-2 border-[#5EE6FE] text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

{/* end of faqs */}


            


            {/* footer */}




      
      {/* end of footer */}
        
      </div>
       {/* start of svg  and still have questions area */}

           
<section className="relative w-full mt-20 overflow-hidden">
  
  {/* Curved Background SVG with Gradient*/}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 360"
    preserveAspectRatio="none"
    className="absolute top-0 left-0 w-full h-[400px]"
  >
    <defs>
      <linearGradient id="faqGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5EE6FE" stopOpacity="1" />
        <stop offset="100%" stopColor="#5EE6FE" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      fill="url(#faqGradient)"
       d="M0,250 C1,280 100,120 1600,250 L1440,400 L0,400 Z"
    ></path>
  </svg>

  {/* Content Section */}
  
  
  <div className="relative z-10 flex flex-col items-center justify-center pt-48 pb-20 px-6 text-center">
    {/* Title with White Paw Images */}
    <div className="flex items-center justify-center gap-3 mb-3 mt-6">
      <img
        src="/images/vertical-white-paws.png"
        alt="paws"
        className="h-8 w-auto opacity-90"
      />
      <h2 className="text-3xl sm:text-4xl font-bold text-[#26B7D8]">
        Still have questions?
      </h2>
      <img
        src="/images/vertical-white-paws.png"
        alt="paws"
        className="h-8 w-auto opacity-90"
      />
    </div>

    <p className="text-gray-600 max-w-xl mx-auto mb-10">
      Contact us and we will make sure everything is clear and intuitive for you!
    </p>

    {/* Contact Form Card */}
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg px-8 py-8 border-4 border-[#5EE6FE] ">
      <form className="space-y-4">
        {/* Name Fields */}
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <input
            type="text"
            placeholder="First name"
            className="w-full sm:w-1/2 border border-[#5EE6FE] shadow-xl rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]"
          />
          <input
            type="text"
            placeholder="Last name"
            className="w-full sm:w-1/2 border border-[#5EE6FE] shadow-xl rounded-md px-4 py-2 mt-4 sm:mt-0 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]"
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Your email"
          className="w-full border border-[#5EE6FE] shadow-xl rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]"
        />

        {/* Subject */}
        <input
          type="text"
          placeholder="Subject"
          className="w-full border border-[#5EE6FE] shadow-xl rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]"
        />

        {/* Message */}
         <textarea
                            placeholder="Your message"
                            rows="5"
                            className="w-full border border-[#5EE6FE] shadow-xl rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]"
         />

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 w-30% bg-[#5EE6FE] shadow-xl text-white font-semibold py-2 rounded-md shadow-md hover:bg-[#26B7D8] transition duration-200 flex items-center justify-center gap-2"
        >
          Paw it over{" "}
          <img
            src="/images/vertical-white-paws.png"
            alt="paw icon"
            className="h-5 w-auto"
          />
        </button>
      </form>
    </div>
  </div>
</section>
{/* end ng svg  and still have questions area */}
   
   


{/* footer */}

  <FooterContent />





   
   
    </div>
  );
}

export default App;
