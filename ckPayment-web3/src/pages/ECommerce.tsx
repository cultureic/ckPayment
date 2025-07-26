import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ShoppingCart,
  CreditCard,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  ExternalLink,
  Download,
  BookOpen,
  Github,
  Smartphone,
  Monitor,
  Wallet,
  Lock,
  BarChart3,
  Package,
  Truck,
  Star,
  DollarSign,
  Clock,
  Target,
  Sparkles,
  Rocket,
  Code,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

const ECommerce = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const stats = [
    { value: "15%", label: "Higher Conversion", icon: TrendingUp, color: "text-blue-500" },
    { value: "3x", label: "Faster Checkout", icon: Zap, color: "text-cyan-500" },
    { value: "0%", label: "Chargeback Risk", icon: Shield, color: "text-blue-600" },
    { value: "200+", label: "Countries", icon: Globe, color: "text-cyan-600" }
  ];

  const ecommerceFeatures = [
    {
      icon: ShoppingCart,
      title: "Instant Global Payments",
      description: "Accept payments from customers worldwide without traditional banking barriers",
      benefits: [
        "No geographic restrictions",
        "Instant settlement in any currency",
        "24/7 payment processing",
        "Multi-currency support"
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "Zero Chargeback Risk",
      description: "Eliminate fraudulent chargebacks and payment disputes permanently",
      benefits: [
        "Immutable blockchain transactions",
        "No payment reversals",
        "Fraud-proof payments",
        "Secure smart contracts"
      ],
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: DollarSign,
      title: "Lower Transaction Fees",
      description: "Reduce payment processing costs by up to 90% compared to traditional methods",
      benefits: [
        "No intermediary fees",
        "Transparent pricing",
        "Volume discounts available",
        "No hidden charges"
      ],
      color: "from-blue-600 to-cyan-400",
      bgColor: "bg-blue-600/10"
    },
    {
      icon: Zap,
      title: "Lightning Fast Checkout",
      description: "Reduce cart abandonment with sub-second payment processing",
      benefits: [
        "One-click payments",
        "Instant confirmation",
        "Mobile optimized",
        "Seamless UX"
      ],
      color: "from-cyan-400 to-blue-500",
      bgColor: "bg-cyan-400/10"
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Install ckPayment",
      description: "Add our lightweight SDK to your e-commerce platform",
      code: `npm install @ckpayment/ecommerce
// or via CDN
<script src="https://ckpayment.icp0.io/ecommerce.js"></script>`,
      time: "2 minutes"
    },
    {
      step: 2,
      title: "Configure Your Store",
      description: "Set up your store configuration with supported currencies",
      code: `ckPayment.init({
  storeId: 'your-store-id',
  currencies: ['ckBTC', 'ckETH', 'ICP'],
  theme: 'blue' // Match your brand
});`,
      time: "5 minutes"
    },
    {
      step: 3,
      title: "Add Payment Buttons",
      description: "Replace existing payment buttons with ckPayment",
      code: `// Replace your checkout button
ckPayment.createCheckout({
  amount: 99.99,
  currency: 'ckBTC',
  productId: 'premium-plan',
  onSuccess: handlePaymentSuccess
});`,
      time: "10 minutes"
    }
  ];

  const useCases = [
    {
      title: "Digital Products",
      description: "Software, courses, subscriptions, and digital downloads",
      icon: Download,
      examples: ["SaaS subscriptions", "Online courses", "Digital art", "Software licenses"]
    },
    {
      title: "Physical Goods",
      description: "Traditional e-commerce with global reach",
      icon: Package,
      examples: ["Electronics", "Fashion", "Home goods", "Collectibles"]
    },
    {
      title: "Services",
      description: "Professional services and consultations",
      icon: Users,
      examples: ["Consulting", "Design services", "Legal advice", "Coaching"]
    },
    {
      title: "Marketplaces",
      description: "Multi-vendor platforms and peer-to-peer trading",
      icon: Target,
      examples: ["NFT marketplaces", "Freelance platforms", "Rental services", "Auction sites"]
    }
  ];  
const competitiveAdvantages = [
    {
      traditional: "3-5% transaction fees",
      ckPayment: "0.1% transaction fees",
      icon: DollarSign,
      improvement: "95% cost reduction"
    },
    {
      traditional: "2-3 day settlement",
      ckPayment: "Instant settlement",
      icon: Clock,
      improvement: "Immediate liquidity"
    },
    {
      traditional: "Chargeback risk",
      ckPayment: "Zero chargebacks",
      icon: Shield,
      improvement: "100% fraud protection"
    },
    {
      traditional: "Limited global reach",
      ckPayment: "200+ countries",
      icon: Globe,
      improvement: "Unlimited expansion"
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading E-Commerce Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay with blue tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background/20 to-cyan-500/5 pointer-events-none" style={{ zIndex: 5 }} />
      
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-lg sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/42dcfff0-6a9c-4d69-908b-9729c5f9000b.png" 
                alt="ckPayment Logo" 
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>      {/*
 Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-blue-500/5 to-cyan-500/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-sm">
              <ShoppingCart className="h-3 w-3 mr-1" />
              E-Commerce Solutions
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Online Store
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Accept payments from anywhere in the world with zero chargebacks, 
              instant settlement, and fees up to 95% lower than traditional processors.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                    <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                View Integration Guide
              </Button>
            </div>
          </div>
        </div>
      </section> 
     {/* E-Commerce Features */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern E-Commerce</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to accept Web3 payments and grow your online business
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {ecommerceFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Integration Steps */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 via-background/90 to-cyan-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-600">
              <Code className="h-3 w-3 mr-1" />
              Quick Integration
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate ckPayment into your e-commerce platform in less than 20 minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {integrationSteps.map((step, index) => (
              <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {step.time}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  <div className="bg-muted/10 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(step.code, `step-${index}`)}
                      className="absolute top-2 right-2 p-2 rounded-md hover:bg-muted/20 transition-colors"
                    >
                      <ArrowRight className={`h-4 w-4 ${copiedCode === `step-${index}` ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    </button>
                    <pre className="text-sm font-mono text-foreground overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>  
    {/* Use Cases */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
              <Target className="h-3 w-3 mr-1" />
              Use Cases
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Every Business Model</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From digital products to physical goods, ckPayment scales with your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="p-3 rounded-xl bg-cyan-500/10 inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-600 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx}>• {example}</li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>      
{/* Competitive Advantages */}
      <section className="py-20 bg-gradient-to-r from-cyan-500/5 via-background/90 to-blue-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              Competitive Advantage
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ckPayment?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment compares to traditional payment processors
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-muted-foreground">Traditional</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.traditional}</p>
                    </div>
                    
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        {advantage.improvement}
                      </Badge>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <span className="font-medium text-blue-600">ckPayment</span>
                        <IconComponent className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-blue-600">{advantage.ckPayment}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>    
  {/* CTA Section */}
      <section className="py-20 relative overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-blue-600/10 border-blue-500/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Transform Your Store?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Start Accepting Web3 Payments Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of e-commerce businesses already using ckPayment to increase 
                conversions, reduce costs, and expand globally.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <ShoppingCart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                  <Settings className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group text-blue-600 hover:bg-blue-500/10">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 sm:h-4 w-3 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>Zero Chargebacks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-cyan-500 flex-shrink-0" />
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 flex-shrink-0" />
                  <span>Global Reach</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-3 sm:h-4 w-3 sm:w-4 text-cyan-600 flex-shrink-0" />
                  <span>95% Lower Fees</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ECommerce;