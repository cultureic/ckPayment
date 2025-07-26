import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollIndicator = () => {
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'use-cases', label: 'Use Cases' },
    { id: 'security', label: 'Security' },
    { id: 'pricing', label: 'Pricing' },
  ];

  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const navbarHeight = 80;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight + 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  if (location.pathname !== '/') return null;

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-background/80 backdrop-blur-lg border border-border/30 rounded-full p-2 shadow-lg">
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-3 h-3 rounded-full transition-all duration-300 relative group ${
                activeSection === section.id 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
              aria-label={`Go to ${section.label} section`}
            >
              {/* Tooltip */}
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm border border-border/30 rounded-md px-2 py-1 text-xs font-medium text-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                {section.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;