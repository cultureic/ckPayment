import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Send, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import ParticleNetwork from './ui/ParticleNetwork';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export default function EnhancedCTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if mobile with debounce
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Handle scroll for fixed mobile CTA with throttling
  const handleScroll = useCallback(() => {
    if (!sectionRef.current || !isMobile) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const isInView = rect.top <= window.innerHeight && rect.bottom >= 0;
    setIsScrolled(!isInView);
  }, [isMobile]);

  // Effect for mobile detection and scroll
  useEffect(() => {
    checkMobile();
    
    const onResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [checkMobile, handleScroll]);

  // Intersection Observer for animation
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Replace with actual API call
      console.log('Submitting email:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      setEmail('');
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMainCTA = () => (
    <motion.div 
      className="relative z-10 max-w-6xl mx-auto text-center px-6 py-16 md:py-24"
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "show" : "hidden"}
    >
      {/* Decorative elements */}
      <motion.div 
        className="absolute -top-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Main Content */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
          <Zap className="h-10 w-10 text-primary" fill="currentColor" />
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Ready to Build the Future of Payments?
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Join the decentralized payment revolution today. No credit card required.
        </p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        variants={itemVariants}
      >
        <Button 
          size="lg" 
          className="group relative overflow-hidden px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <span className="relative z-10 flex items-center">
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          className="group relative overflow-hidden px-8 py-6 text-lg font-medium border-2 border-border/30 bg-background/50 backdrop-blur-sm hover:bg-accent/5 hover:border-accent/50 text-foreground transition-all duration-300"
        >
          <span className="relative z-10 flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            View Documentation
          </span>
        </Button>
      </motion.div>

      {/* Trust Badge */}
      <motion.div 
        className="mb-12"
        variants={itemVariants}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 text-sm text-muted-foreground">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background" />
            ))}
          </div>
          <span>Trusted by 1,000+ developers</span>
        </div>
      </motion.div>

      {/* Email Form */}
      <motion.div 
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-border/30 shadow-xl"
        variants={itemVariants}
      >
        <h3 className="text-2xl font-semibold text-foreground mb-2">Get Early Access</h3>
        <p className="text-muted-foreground mb-6">Be the first to know when we launch</p>
        
        <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your email"
              className={`w-full px-6 py-4 rounded-xl bg-background/50 border ${
                error ? 'border-destructive' : 'border-border/50'
              } text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent shadow-sm transition-all duration-200`}
              disabled={isSubmitting || isSubmitted}
              aria-label="Email address"
              aria-invalid={!!error}
              aria-describedby={error ? 'email-error' : undefined}
            />
            {error && (
              <p id="email-error" className="mt-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          
          <Button 
            type="submit"
            size="lg"
            className="w-full py-6 text-base font-medium bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white transition-all duration-300"
            disabled={isSubmitting || isSubmitted}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isSubmitted ? (
              <>
                <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                You're on the list!
              </>
            ) : (
              'Get Early Access'
            )}
          </Button>
        </form>
        
        <p className="mt-4 text-xs text-muted-foreground text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </motion.div>
      
      {/* Trust Badges */}
      <motion.div 
        className="mt-12 pt-8 border-t border-border/20"
        variants={itemVariants}
      >
        <p className="text-sm text-muted-foreground mb-4">TRUSTED BY INNOVATORS AT</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          {['DFINITY', 'Internet Computer', 'Web3 Foundation', 'ICDevs'].map((company, i) => (
            <div key={i} className="text-muted-foreground/60 hover:text-foreground transition-colors">
              {company}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderFixedMobileCTA = () => (
    isMobile && isScrolled && (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-800 to-green-900 p-4 shadow-lg z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white">
            <p className="font-bold">Ready to get started?</p>
            <p className="text-sm text-green-200">Join the decentralized payment revolution</p>
          </div>
          <Button 
            asChild 
            size="sm"
            className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold"
          >
            <a href="https://github.com/your-org/ckpayment" target="_blank" rel="noopener noreferrer">
              Get Started
            </a>
          </Button>
        </div>
      </div>
    )
  );

  return (
    <>
      <section 
        ref={sectionRef}
        className="relative overflow-hidden bg-gradient-to-br from-green-900 to-green-800 text-white"
      >
        {/* Particle Network Background */}
        <div className="absolute inset-0 opacity-30">
          <ParticleNetwork 
            particleColor="rgba(134, 239, 172, 0.8)" 
            lineColor="rgba(134, 239, 172, 0.3)"
            particleAmount={isMobile ? 15 : 30}
          />
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent"></div>
        
        {/* Main Content */}
        {renderMainCTA()}
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>
      
      {/* Fixed Mobile CTA */}
      {renderFixedMobileCTA()}
    </>
  );
}
