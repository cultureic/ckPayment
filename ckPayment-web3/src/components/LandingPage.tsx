import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ScrollIndicator from "./ScrollIndicator";
import ProblemCards from "./ProblemCards";
import SolutionSection from "./SolutionSection";
import SecurityTrustSection from "./SecurityTrustSection";
import UseCasesSection from "./UseCasesSection";
import PricingSection from "./PricingSection";
import HowItWorksSection from "./HowItWorksSection";
import GameChangerSection from "./GameChangerSection";
import Footer from "./Footer";
import IntegrationSteps from "./IntegrationSteps";
import ComparisonSection from "./ComparisonSection";
import FAQSection from "./FAQSection";
import EnhancedCTASection from "./EnhancedCTASection";
import AnimatedBackground from "./AnimatedBackground";

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('loading');
    
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);

    if (location.hash) {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('loading');
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          const navbarHeight = 80;
          const elementPosition = element.offsetTop - navbarHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
      return () => {
        clearTimeout(timer);
        document.documentElement.classList.remove('loading');
      };
    } else {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('loading');
      }, 500);
      
      return () => {
        clearTimeout(timer);
        document.documentElement.classList.remove('loading');
      };
    }
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollIndicator />
      <AnimatedBackground />
      <main className="relative z-10 space-y-0">
        <HeroSection />
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <ProblemCards />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <SolutionSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <HowItWorksSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <IntegrationSteps />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <ComparisonSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <UseCasesSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <SecurityTrustSection />
          </div>
        </div>
    
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;