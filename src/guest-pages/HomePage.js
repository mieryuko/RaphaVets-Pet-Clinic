import React, { useState, useEffect } from "react";

function HomePage() {
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
                  href="/signup"
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

      {/* shape divider */}
      <div className="relative w-full overflow-x-hidden leading-[0] z-[5] -translate-y-[110px]">
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
            fill="#5EE6FE"
          />
        </svg>

        <div
          className="w-full h-[560px]"
          style={{
            background:
              "linear-gradient(to bottom, #5EE6FE 0%, #98DAE5 43%, #FFFFFF 100%)",
          }}
        ></div>
      </div>
    </div>
  );
}

export default HomePage;
