import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, ExternalLink, LayoutDashboard, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, principal } = useAuth();

  const scrollToSection = (id: string) => {
    // Handle docs navigation
    if (id === 'docs') {
      navigate('/docs');
      setIsMenuOpen(false);
      return;
    }
    
    if (id === 'community') {
      window.open('https://github.com/ckpayment', '_blank');
      setIsMenuOpen(false);
      return;
    }

    // If we're not on the home page and trying to navigate to a section, go to home first
    if (location.pathname !== '/' && ['features', 'how-it-works', 'use-cases', 'security', 'pricing'].includes(id)) {
      navigate(`/#${id}`);
      return;
    }

    // For internal sections, scroll with offset to compensate for fixed navbar
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80; // Height of fixed navbar
      const elementPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Track active section on home page
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const sections = ['features', 'how-it-works', 'use-cases', 'security', 'pricing'];
      const navbarHeight = 80;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight + 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navItems = [
    { id: 'features', label: 'Features', hasPage: true },
    { id: 'how-it-works', label: 'How it Works', hasPage: true },
    { id: 'use-cases', label: 'Use Cases', hasPage: false },
    { id: 'security', label: 'Security & Trust', hasPage: false },
    { id: 'pricing', label: 'Pricing', hasPage: false },
    { id: 'docs', label: 'Docs', hasPage: true },
    { id: 'community', label: 'Community', hasPage: false, external: true },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/42dcfff0-6a9c-4d69-908b-9729c5f9000b.png" 
              alt="ckPayment Logo" 
              className="h-8 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === '/' && activeSection === item.id;
              const isDocsPage = location.pathname === '/docs' && item.id === 'docs';
              
              if (item.hasPage) {
                const isCurrentPage = (item.id === 'features' && location.pathname === '/features') || 
                                    (item.id === 'how-it-works' && location.pathname === '/how-it-works') ||
                                    (item.id === 'docs' && location.pathname === '/docs');
                
                return (
                  <div key={item.id} className="relative group">
                    {item.id === 'docs' ? (
                      <Link
                        to="/docs"
                        className={`text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 ${
                          isDocsPage ? 'text-primary' : ''
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <>
                        <button 
                          onClick={() => scrollToSection(item.id)}
                          className={`text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 ${
                            isActive || isCurrentPage ? 'text-primary' : ''
                          }`}
                          aria-label={`Navigate to ${item.label} section`}
                        >
                          <span>{item.label}</span>
                        </button>
                        {/* Dropdown for pages with both section and dedicated page */}
                        <div className="absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-lg border border-border/30 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="p-2">
                            <button
                              onClick={() => scrollToSection(item.id)}
                              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                            >
                              View on Homepage
                            </button>
                            <Link
                              to={`/${item.id}`}
                              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors flex items-center space-x-2"
                            >
                              <span>Detailed {item.label}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              }
              
              return (
                <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 ${
                    isActive ? 'text-primary' : ''
                  }`}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  <span>{item.label}</span>
                  {item.external && <ExternalLink className="h-3 w-3" />}
                </button>
              );
            })}
            
            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              className={`text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 ${
                location.pathname === '/dashboard' ? 'text-primary' : ''
              }`}
              title={isAuthenticated ? `Dashboard (${principal?.slice(0, 8)}...)` : 'Access Dashboard'}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
              {isAuthenticated && (
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Authenticated" />
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* CTA Button */}
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-soft hover:shadow-glow-primary transition-all duration-300 hidden md:inline-flex"
              onClick={() => scrollToSection('get-started')}
              aria-label="Get started with ckPayment"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="fixed inset-0 top-16 bg-background z-40 p-4 md:hidden animate-in fade-in duration-200"
        >
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => {
              const isActive = location.pathname === '/' && activeSection === item.id;
              const isDocsPage = location.pathname === '/docs' && item.id === 'docs';
              
              if (item.hasPage) {
                const isCurrentPage = (item.id === 'features' && location.pathname === '/features') || 
                                    (item.id === 'how-it-works' && location.pathname === '/how-it-works') ||
                                    (item.id === 'docs' && location.pathname === '/docs');
                
                return (
                  <div key={item.id} className="space-y-2">
                    {item.id === 'docs' ? (
                      <Link
                        to="/docs"
                        className={`py-3 px-4 text-left hover:bg-muted rounded-md transition-colors w-full ${
                          isDocsPage ? 'text-primary bg-muted/50' : 'text-foreground'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`py-3 px-4 text-left hover:bg-muted rounded-md transition-colors w-full ${
                            isActive || isCurrentPage ? 'text-primary bg-muted/50' : 'text-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                        <Link
                          to={`/${item.id}`}
                          className="py-2 px-6 text-left hover:bg-muted rounded-md transition-colors text-muted-foreground text-sm flex items-center space-x-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>View Detailed {item.label}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </>
                    )}
                  </div>
                );
              }
              
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`py-3 px-4 text-left hover:bg-muted rounded-md transition-colors flex items-center space-x-2 ${
                    isActive ? 'text-primary bg-muted/50' : 'text-foreground'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.external && <ExternalLink className="h-3 w-3" />}
                </button>
              );
            })}
            
            {/* Dashboard Link - Mobile */}
            <Link
              to="/dashboard"
              className={`py-3 px-4 text-left hover:bg-muted rounded-md transition-colors flex items-center space-x-2 w-full ${
                location.pathname === '/dashboard' ? 'text-primary bg-muted/50' : 'text-foreground'
              }`}
              onClick={() => setIsMenuOpen(false)}
              title={isAuthenticated ? `Dashboard (${principal?.slice(0, 8)}...)` : 'Access Dashboard'}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
              {isAuthenticated && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" title="Authenticated" />
              )}
            </Link>
            
            <Button 
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-soft hover:shadow-glow-primary transition-all duration-300"
              onClick={() => scrollToSection('get-started')}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;