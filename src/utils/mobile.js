import { useState, useEffect } from 'react';

export const isMobile = () => {
  return window.innerWidth < 768;
};

export const isSmallMobile = () => {
  return window.innerWidth < 640;
};

export const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isSmallMobile };
};

export const closeMobileMenu = (setIsMenuOpen) => {
  if (window.innerWidth < 768) {
    setIsMenuOpen(false);
  }
};