import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Blocks, 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  Smartphone,
  CreditCard,
  Lock,
  Gauge,
  Users,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Play,
  Download,
  BookOpen,
  Github,
  MousePointer,
  Eye,
  Layers,
  Rocket,
  Menu,
  X,
  Home,
  FileText,
  HelpCircle,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Smooth entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Auto-rotate featured items
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % mainFeatures.length);
    }, 4000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const stats = [
    { value: "99.9%", label: "Uptime", icon: TrendingUp, color: "text-green-500" },
    { value: "<1s", label: "Transaction Speed", icon: Zap, color: "text-yellow-500" },
    { value: "200+", label: "Countries", icon: Globe, color: "text-blue-500" },
    { value: "0%", label: "Hidden Fees", icon: Award, color: "text-purple-500" }
  ];

  const mainFeatures = [
    {
      icon: Blocks,
      title: "Blockchain Native",
      description: "Built on Internet Computer Protocol for true decentralization",
      benefits: [
        "No intermediaries or third parties",
        "Immutable transaction records",
        "Transparent and auditable",
        "Censorship resistant"
      ],
      category: "Architecture",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-second transaction processing with minimal fees",
      benefits: [
        "< 1 second confirmation times",
        "Near-zero transaction fees",
        "High throughput capacity",
        "Real-time settlement"
      ],
      category: "Performance",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Military-grade security with multi-layer protection",
      benefits: [
        "End-to-end encryption",
        "Multi-signature wallets",
        "Smart contract audits",
        "Bug bounty program"
      ],
      category: "Security",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Code,
      title: "Developer First",
      description: "Simple integration with comprehensive documentation",
      benefits: [
        "One-line JavaScript integration",
        "RESTful API endpoints",
        "SDK for popular frameworks",
        "Extensive code examples"
      ],
      category: "Developer Experience",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Available worldwide with multi-currency support",
      benefits: [
        "200+ countries supported",
        "Multiple cryptocurrency options",
        "Fiat on/off ramps",
        "Localized interfaces"
      ],
      category: "Accessibility",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Perfect experience across all devices and platforms",
      benefits: [
        "Responsive design",
        "Mobile wallet integration",
        "Touch-optimized interface",
        "Offline transaction queuing"
      ],
      category: "User Experience",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-500/10"
    }
  ];

  const technicalFeatures = [
    {
      icon: CreditCard,
      title: "Payment Processing",
      features: [
        "Instant payment confirmation",
        "Automatic refund handling",
        "Subscription management",
        "Recurring payments",
        "Split payments",
        "Escrow services"
      ]
    },
    {
      icon: Lock,
      title: "Security & Compliance",
      features: [
        "KYC/AML compliance",
        "PCI DSS Level 1",
        "SOC 2 Type II",
        "GDPR compliant",
        "Multi-factor authentication",
        "Fraud detection"
      ]
    },
    {
      icon: Gauge,
      title: "Analytics & Monitoring",
      features: [
        "Real-time dashboards",
        "Transaction analytics",
        "Performance metrics",
        "Custom reporting",
        "Webhook notifications",
        "API monitoring"
      ]
    },
    {
      icon: Users,
      title: "Business Tools",
      features: [
        "Multi-user accounts",
        "Role-based permissions",
        "White-label solutions",
        "Custom branding",
        "Bulk operations",
        "Export capabilities"
      ]
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading amazing features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay for better readability */}
      <div className="absolute inset-0 bg-background/20 pointer-events-none" style={{ zIndex: 5 }} />
      
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-lg sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back button (desktop) / Menu button (mobile) */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="hidden md:flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Center - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/42dcfff0-6a9c-4d69-908b-9729c5f9000b.png" 
                  alt="ckPayment Logo" 
                  className="h-8 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Right side - Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-5 w-5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-5 w-5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile placeholder for balance */}
            <div className="md:hidden w-10"></div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/30 z-40">
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-4">
                <Link 
                  to="/" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 text-primary" />
                  <span className="font-medium">Back to Home</span>
                </Link>
                
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span>Documentation</span>
                </button>
                
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span>Help & Support</span>
                </button>
                
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>Contact Us</span>
                </button>

                <div className="pt-4 border-t border-border/30">
                  <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-muted/10 to-background/90 overflow-hidden">
        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Complete Feature Overview
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Everything You Need for{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                  Web3 Payments
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed max-w-4xl mx-auto px-4 sm:px-0">
                Discover all the powerful features that make ckPayment the most comprehensive 
                Web3 payment solution for modern applications.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div 
                      key={index} 
                      className={`text-center p-3 sm:p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <IconComponent className={`h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group">
                  <Play className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Interactive Demo
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group">
                  <Download className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Download SDK
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group">
                  <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Highlight */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 relative z-10">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Eye className="h-3 w-3 mr-1" />
              Featured Spotlight
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Spotlight: {mainFeatures[activeFeature].title}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <Card className="p-6 sm:p-8 md:p-12 bg-background/80 backdrop-blur-sm border-primary/20 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${mainFeatures[activeFeature].color}`} />
              </div>
              
              <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="text-center md:text-left">
                  <div className={`inline-flex p-3 sm:p-4 rounded-2xl ${mainFeatures[activeFeature].bgColor} mb-4 sm:mb-6`}>
                    {React.createElement(mainFeatures[activeFeature].icon, { className: "h-10 sm:h-12 w-10 sm:w-12 text-primary" })}
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">{mainFeatures[activeFeature].title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">{mainFeatures[activeFeature].description}</p>
                  <Button className="group w-full sm:w-auto">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {mainFeatures[activeFeature].benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                      <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-sm sm:text-base">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Feature Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {mainFeatures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeFeature 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Layers className="h-3 w-3 mr-1" />
              Core Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Feature Set</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The fundamental capabilities that power your Web3 payment infrastructure
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-0">
            {mainFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const isHovered = hoveredCard === index;
              
              return (
                <Card 
                  key={index} 
                  className={`p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-500 group cursor-pointer relative overflow-hidden ${
                    isHovered ? 'sm:scale-105 shadow-2xl' : ''
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onTouchStart={() => setHoveredCard(index)}
                  onTouchEnd={() => setTimeout(() => setHoveredCard(null), 2000)}
                >
                  {/* Hover Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-all duration-300 mx-auto sm:mx-0`}>
                        <IconComponent className="h-7 sm:h-8 w-7 sm:w-8 text-primary" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">
                            {feature.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs mx-auto sm:mx-0 w-fit">
                            {feature.category}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4 text-sm sm:text-base">{feature.description}</p>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Hover Action - Always visible on mobile */}
                    <div className={`mt-4 sm:mt-6 transition-all duration-300 ${isHovered || window.innerWidth < 640 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <Button variant="ghost" size="sm" className="group/btn w-full sm:w-auto">
                        <MousePointer className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Explore Feature
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 bg-gradient-to-b from-muted/5 to-background/90 relative overflow-hidden z-10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Rocket className="h-3 w-3 mr-1" />
              Enterprise Grade
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Technical Capabilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced features for enterprise-grade payment processing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-0">
            {technicalFeatures.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={index} 
                  className="p-5 sm:p-6 bg-background/80 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="text-center mb-5 sm:mb-6">
                      <div className="inline-flex p-2.5 sm:p-3 rounded-xl bg-primary/10 mb-3 sm:mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <IconComponent className="h-6 sm:h-8 w-6 sm:w-8 text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                    </div>
                    
                    <ul className="space-y-2.5 sm:space-y-3">
                      {category.features.map((feature, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-start space-x-2 text-xs sm:text-sm opacity-80 group-hover:opacity-100 transition-all duration-300"
                          style={{ transitionDelay: `${idx * 0.05}s` }}
                        >
                          <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Feature Count Badge */}
                    <div className="mt-3 sm:mt-4 text-center">
                      <Badge variant="secondary" className="text-xs">
                        {category.features.length} Features
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Additional Info Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 px-4 sm:px-0">
            <Card className="p-5 sm:p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <Shield className="h-10 sm:h-12 w-10 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-bold mb-2">99.9% Uptime</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Enterprise-grade reliability with redundant infrastructure</p>
            </Card>
            
            <Card className="p-5 sm:p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <Zap className="h-10 sm:h-12 w-10 sm:w-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-bold mb-2">Sub-second Processing</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Lightning-fast transaction confirmation times</p>
            </Card>
            
            <Card className="p-5 sm:p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 sm:col-span-2 md:col-span-1">
              <Star className="h-10 sm:h-12 w-10 sm:w-12 text-purple-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-bold mb-2">24/7 Support</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Round-the-clock technical support and monitoring</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Preview */}
      <section className="py-20 bg-gradient-to-r from-background/90 via-muted/5 to-background/90 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Code className="h-3 w-3 mr-1" />
              Quick Integration
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how easy it is to integrate ckPayment into your application
            </p>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <Card className="p-6 sm:p-8 bg-background/80 backdrop-blur-sm border-border/30">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-center md:text-left">Simple Integration</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                      <span className="text-sm sm:text-base">Install the SDK</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                      <span className="text-sm sm:text-base">Add one line of code</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                      <span className="text-sm sm:text-base">Start accepting payments</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/10 rounded-lg p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto order-1 md:order-2">
                  <div className="text-muted-foreground mb-2 whitespace-nowrap">// Install ckPayment SDK</div>
                  <div className="text-green-400 whitespace-nowrap">npm install @ckpayment/web3</div>
                  <div className="mt-4 text-muted-foreground whitespace-nowrap">// Initialize payment</div>
                  <div className="text-blue-400 whitespace-nowrap">ckPayment.init()</div>
                  <div className="text-yellow-400 whitespace-nowrap">.render('#payment-modal')</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden z-10">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20 text-center backdrop-blur-sm relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                <span className="text-primary font-medium text-sm sm:text-base">Ready to Transform Your Payments?</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6">
                Join the Web3 Payment Revolution
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Join thousands of developers who are already building the future of payments with ckPayment. 
                Start your integration today and experience the power of true decentralization.
              </p>
              
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4 sm:px-0">
                <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group">
                  <Rocket className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Building Now
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group">
                  <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Documentation
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group">
                  <Github className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                  GitHub Repository
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-500 flex-shrink-0" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-3 sm:h-4 w-3 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>Global Scale</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-3 sm:h-4 w-3 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span>Zero Fees</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Features;