import { ReactNode, useEffect, useRef, useState } from 'react';
import { fadeInUp, useScrollAnimation } from '@/lib/animations';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection = ({ children, className = '', delay = 0 }: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      timeoutRef.current = setTimeout(() => {
        setHasAnimated(true);
      }, delay);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, delay, hasAnimated]);

  const animationStyle = {
    opacity: hasAnimated ? 1 : 0,
    transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, 
                 transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  };

  return (
    <div 
      ref={ref}
      className={`${className}`}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
