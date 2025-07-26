import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Heart,
  Users,
  Globe,
  Zap,
  Shield,
  BarChart3,
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
  Package,
  Truck,
  Star,
  DollarSign,
  Clock,
  Target,
  Sparkles,
  Rocket,
  Code,
  Settings,
  PieChart,
  Repeat,
  Calculator,
  LineChart,
  Activity,
  Layers,
  Database,
  Network,
  Banknote,
  Percent,
  Crown,
  Award,
  Gem,
  Camera,
  Brush,
  Music,
  Video,
  FileImage,
  TrendingUp,
  Eye,
  Share2,
  Gift,
  MessageCircle,
  ThumbsUp,
  Coffee,
  Mic,
  Film,
  Headphones,
  Palette,
  Rss,
  UserPlus,
  CreditCard,
  Coins
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

const CreatorEconomy = () => {
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
    { value: "95%", label: "Creator Retention", icon: Heart, color: "text-pink-500" },
    { value: "0%", label: "Platform Fees", icon: DollarSign, color: "text-rose-500" },
    { value: "∞", label: "Fan Reach", icon: Users, color: "text-pink-600" },
    { value: "24/7", label: "Monetization", icon: Clock, color: "text-rose-600" }
  ];

  const creatorFeatures = [
    {
      icon: Heart,
      title: "Direct Fan-to-Creator Payments",
      description: "Enable your fans to support you directly without intermediaries",
      benefits: [
        "Instant tip payments",
        "Custom tip amounts",
        "Fan message support",
        "Global accessibility"
      ],
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: Rss,
      title: "Subscription Management",
      description: "Create tiered subscription models with exclusive content access",
      benefits: [
        "Multiple tier options",
        "Recurring payments",
        "Content gating",
        "Subscriber analytics"
      ],
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-500/10"
    },
    {
      icon: Coffee,
      title: "Tip Jar Functionality",
      description: "Simple one-click tipping system for spontaneous fan support",
      benefits: [
        "One-click donations",
        "Custom tip messages",
        "Real-time notifications",
        "Thank you automation"
      ],
      color: "from-pink-600 to-rose-400",
      bgColor: "bg-pink-600/10"
    },
    {
      icon: Shield,
      title: "Zero Platform Fees",
      description: "Keep 100% of your earnings with transparent, minimal transaction costs",
      benefits: [
        "No revenue sharing",
        "Transparent pricing",
        "Direct wallet deposits",
        "Full earning control"
      ],
      color: "from-rose-400 to-pink-500",
      bgColor: "bg-rose-400/10"
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Setup Creator SDK",
      description: "Initialize the ckPayment creator economy SDK with your platform",
      code: `npm install @ckpayment/creator
// Initialize your creator platform
import { ckCreator } from '@ckpayment/creator';

ckCreator.init({
  creatorId: 'your-creator-id',
  platforms: ['youtube', 'twitch', 'instagram'],
  monetization: ['tips', 'subscriptions', 'premium']
});`,
      time: "3 minutes"
    },
    {
      step: 2,
      title: "Enable Tipping System",
      description: "Add tip jar functionality to your content and social media",
      code: `// Create tip jar widget
const tipJar = await ckCreator.createTipJar({
  creatorWallet: 'creator-wallet-address',
  tipAmounts: [0.01, 0.05, 0.1, 0.5], // Preset amounts
  customAmount: true,
  thankYouMessage: 'Thanks for supporting my work!',
  currencies: ['ICP', 'ckBTC']
});`,
      time: "5 minutes"
    },
    {
      step: 3,
      title: "Launch Subscriptions",
      description: "Create subscription tiers with exclusive content access",
      code: `// Setup subscription tiers
const subscriptions = await ckCreator.createSubscriptions({
  tiers: [
    { name: 'Supporter', price: 2.99, perks: ['Early access'] },
    { name: 'VIP', price: 9.99, perks: ['Exclusive content', 'Discord access'] },
    { name: 'Patron', price: 24.99, perks: ['1-on-1 calls', 'Custom content'] }
  ],
  billingCycle: 'monthly'
});`,
      time: "10 minutes"
    }
  ];

  const useCases = [
    {
      title: "Content Creators",
      description: "YouTubers, streamers, and social media influencers",
      icon: Video,
      examples: ["YouTube channels", "Twitch streams", "TikTok creators", "Instagram influencers"]
    },
    {
      title: "Artists & Musicians",
      description: "Visual artists, musicians, and performing artists",
      icon: Music,
      examples: ["Digital artists", "Musicians", "Podcasters", "Performers"]
    },
    {
      title: "Writers & Bloggers",
      description: "Authors, journalists, and content writers",
      icon: FileImage,
      examples: ["Newsletter writers", "Bloggers", "Authors", "Journalists"]
    },
    {
      title: "Educators & Coaches",
      description: "Online teachers, coaches, and mentors",
      icon: Users,
      examples: ["Online tutors", "Life coaches", "Fitness trainers", "Mentors"]
    }
  ];

  const competitiveAdvantages = [
    {
      traditional: "30% platform fees",
      ckPayment: "0% platform fees",
      icon: DollarSign,
      improvement: "100% earnings kept"
    },
    {
      traditional: "Limited payment methods",
      ckPayment: "Global crypto payments",
      icon: Globe,
      improvement: "Universal accessibility"
    },
    {
      traditional: "Delayed payouts",
      ckPayment: "Instant payments",
      icon: Zap,
      improvement: "Real-time earnings"
    },
    {
      traditional: "Platform dependency",
      ckPayment: "Creator ownership",
      icon: Crown,
      improvement: "Full independence"
    }
  ];

  const monetizationModels = [
    {
      name: "Tip-Based",
      type: "One-time payments",
      focus: "Spontaneous fan support",
      features: ["Custom amounts", "Message support", "Thank you automation"]
    },
    {
      name: "Subscription",
      type: "Recurring revenue",
      focus: "Predictable income stream",
      features: ["Multiple tiers", "Exclusive content", "Community access"]
    },
    {
      name: "Pay-Per-Content",
      type: "Premium access",
      focus: "High-value content",
      features: ["Content gating", "One-time purchases", "Exclusive releases"]
    },
    {
      name: "Hybrid Model",
      type: "Multiple streams",
      focus: "Diversified income",
      features: ["All monetization types", "Flexible pricing", "Maximum earnings"]
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Creator Economy Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay with pink/rose tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-background/20 to-rose-500/5 pointer-events-none" style={{ zIndex: 5 }} />
      
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
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-pink-500/5 to-rose-500/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-sm">
              <Heart className="h-3 w-3 mr-1" />
              Creator Economy
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Empower{" "}
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                Creators
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Build direct relationships with your fans through tips, subscriptions, 
              and premium content - all with zero platform fees and instant payouts.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                    <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Creating
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-pink-500/30 text-pink-600 hover:bg-pink-500/10">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Creator Guide
              </Button>
            </div>
          </div>
        </div>
      </section>    
  {/* Creator Features */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-500/10 text-pink-600 border-pink-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Creator Success</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monetize your content and build lasting fan relationships
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {creatorFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-pink-500/20 hover:border-pink-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-pink-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-pink-500 flex-shrink-0" />
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
      <section className="py-20 bg-gradient-to-r from-pink-500/5 via-background/90 to-rose-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-pink-500/30 text-pink-600">
              <Code className="h-3 w-3 mr-1" />
              Quick Setup
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Monetize Your Content</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your creator monetization system running in under 20 minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {integrationSteps.map((step, index) => (
              <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
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
                      <ArrowRight className={`h-4 w-4 ${copiedCode === `step-${index}` ? 'text-pink-500' : 'text-muted-foreground'}`} />
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
            <Badge className="mb-4 bg-rose-500/10 text-rose-600 border-rose-500/20">
              <Target className="h-3 w-3 mr-1" />
              Creator Categories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Every Creator</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From content creators to artists, support all types of creative professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-rose-500/20 hover:border-rose-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="p-3 rounded-xl bg-rose-500/10 inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-rose-600 transition-colors">
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

      {/* Monetization Models */}
      <section className="py-20 bg-gradient-to-r from-rose-500/5 via-background/90 to-pink-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-pink-500/30 text-pink-600">
              <Coins className="h-3 w-3 mr-1" />
              Monetization Models
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Revenue Stream</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible monetization options to match your content and audience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {monetizationModels.map((model, index) => (
              <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="font-bold text-lg mb-1">{model.name}</h3>
                <Badge variant="secondary" className="mb-2 text-xs">
                  {model.type}
                </Badge>
                <p className="text-sm text-muted-foreground mb-3">{model.focus}</p>
                <div className="space-y-1">
                  {model.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      • {feature}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-pink-500/30 text-pink-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              Why Choose ckPayment for Creators?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Creator Independence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment empowers creators compared to traditional platforms
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-muted-foreground">Traditional Platforms</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.traditional}</p>
                    </div>
                    
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                      <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/20">
                        {advantage.improvement}
                      </Badge>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <span className="font-medium text-pink-600">ckPayment Creator</span>
                        <IconComponent className="h-6 w-6 text-pink-500" />
                      </div>
                      <p className="text-sm font-medium text-pink-600">{advantage.ckPayment}</p>
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
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-pink-600/10 border-pink-500/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-pink-500/10 text-pink-600 border-pink-500/20">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Own Your Success?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Start Your Creator Journey Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of creators who have taken control of their monetization 
                with direct fan support and zero platform fees.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Creating
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-pink-500/30 text-pink-600 hover:bg-pink-500/10">
                  <Settings className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group text-pink-600 hover:bg-pink-500/10">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Heart className="h-3 sm:h-4 w-3 sm:w-4 text-pink-500 flex-shrink-0" />
                  <span>Direct Fan Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-3 sm:h-4 w-3 sm:w-4 text-rose-500 flex-shrink-0" />
                  <span>Zero Platform Fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-pink-600 flex-shrink-0" />
                  <span>Instant Payouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="h-3 sm:h-4 w-3 sm:w-4 text-rose-600 flex-shrink-0" />
                  <span>Creator Ownership</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CreatorEconomy;