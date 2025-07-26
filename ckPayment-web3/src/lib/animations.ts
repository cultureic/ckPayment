import { useState, useRef, useEffect } from 'react';

// Animation variants for framer-motion style animations without the library
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Custom hook for scroll-based animations
export const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
};

// Button hover animation styles
export const buttonHoverAnimation = `
  relative overflow-hidden group
  before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500 before:to-emerald-500 
  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
  after:absolute after:inset-0 after:bg-gradient-to-r after:from-green-600 after:to-emerald-600 
  after:opacity-0 hover:after:opacity-100 after:transition-all after:duration-700 after:scale-x-0 hover:after:scale-x-100 after:origin-left
  hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]
  transition-all duration-300
`;

export const buttonContent = `
  relative z-10 flex items-center justify-center
  transition-all duration-300
  group-hover:text-white
`;
