import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Palette,
  Image,
  Globe,
  Zap,
  Shield,
  BarChart3,
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
  Heart,
  TrendingUp,
  Eye,
  Share2,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

const NFTMarketplaces = () => {
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
    { value: "90%", label: "Lower Fees", icon: DollarSign, color: "text-orange-500" },
    { value: "100%", label: "Royalty Accuracy", icon: Crown, color: "text-red-500" },
    { value: "0.01s", label: "Mint Speed", icon: Zap, color: "text-orange-600" },
    { value: "∞", label: "Creator Tools", icon: Palette, color: "text-red-600" }
  ];

  const nftFeatures = [
    {
      icon: Crown,
      title: "Instant Royalty Distribution",
      description: "Automatic royalty payments to creators on every secondary sale",
      benefits: [
        "Real-time royalty splits",
        "Multi-creator support",
        "Transparent tracking",
        "Zero manual intervention"
      ],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Gem,
      title: "Low-Cost Minting",
      description: "Mint NFTs at a fraction of traditional blockchain costs",
      benefits: [
        "Sub-cent minting fees",
        "Batch minting support",
        "Eco-friendly process",
        "Instant confirmation"
      ],
      color: "from-red-500 to-orange-600",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Gift,
      title: "Creator Monetization",
      description: "Comprehensive tools for artists to monetize their digital creations",
      benefits: [
        "Direct fan support",
        "Subscription models",
        "Limited editions",
        "Auction mechanisms"
      ],
      color: "from-orange-600 to-red-400",
      bgColor: "bg-orange-600/10"
    },
    {
      icon: Network,
      title: "Cross-Chain Compatibility",
      description: "Trade NFTs across multiple blockchains seamlessly",
      benefits: [
        "Multi-chain support",
        "Bridge functionality",
        "Universal wallets",
        "Unified marketplace"
      ],
      color: "from-red-400 to-orange-500",
      bgColor: "bg-red-400/10"
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Initialize NFT SDK",
      description: "Set up the ckPayment NFT marketplace SDK with your configuration",
      code: `npm install @ckpayment/nft
// Initialize your marketplace
import { ckNFT } from '@ckpayment/nft';

ckNFT.init({
  marketplaceId: 'your-marketplace-id',
  chains: ['ICP', 'Ethereum', 'Polygon'],
  royaltyStandard: 'EIP-2981'
});`,
      time: "3 minutes"
    },
    {
      step: 2,
      title: "Create Collection",
      description: "Deploy your NFT collection with built-in royalty mechanisms",
      code: `// Create a new NFT collection
const collection = await ckNFT.createCollection({
  name: 'Digital Art Collection',
  symbol: 'DAC',
  description: 'Unique digital artworks',
  royaltyPercentage: 10, // 10% royalty
  maxSupply: 1000
});`,
      time: "5 minutes"
    },
    {
      step: 3,
      title: "Enable Trading",
      description: "Add marketplace functionality with automated payments",
      code: `// Enable marketplace trading
const marketplace = await ckNFT.enableTrading({
  collectionId: collection.id,
  features: ['auction', 'fixedPrice', 'offers'],
  paymentTokens: ['ICP', 'ckBTC', 'ckETH'],
  autoRoyalties: true
});`,
      time: "7 minutes"
    }
  ];

  const useCases = [
    {
      title: "Digital Art",
      description: "Galleries and individual artists selling unique digital creations",
      icon: Brush,
      examples: ["Digital paintings", "Generative art", "Photography", "3D sculptures"]
    },
    {
      title: "Gaming Assets",
      description: "In-game items, characters, and virtual real estate trading",
      icon: Award,
      examples: ["Character skins", "Weapons & items", "Virtual land", "Game cards"]
    },
    {
      title: "Music & Audio",
      description: "Musicians and audio creators monetizing their work",
      icon: Music,
      examples: ["Album releases", "Concert tickets", "Exclusive tracks", "Sound effects"]
    },
    {
      title: "Collectibles",
      description: "Digital collectibles and limited edition items",
      icon: Star,
      examples: ["Trading cards", "Sports memorabilia", "Celebrity items", "Brand collectibles"]
    }
  ];

  const competitiveAdvantages = [
    {
      traditional: "5-15% marketplace fees",
      ckPayment: "0.5% marketplace fees",
      icon: DollarSign,
      improvement: "90% cost reduction"
    },
    {
      traditional: "Manual royalty tracking",
      ckPayment: "Automatic royalties",
      icon: Crown,
      improvement: "100% accuracy"
    },
    {
      traditional: "$50-200 minting costs",
      ckPayment: "$0.01 minting costs",
      icon: Gem,
      improvement: "99.9% savings"
    },
    {
      traditional: "Single chain limitation",
      ckPayment: "Multi-chain by default",
      icon: Network,
      improvement: "Unlimited reach"
    }
  ];

  const marketplaceTypes = [
    {
      name: "Art Gallery",
      type: "Curated",
      focus: "High-quality digital art",
      features: ["Artist verification", "Curation process", "Premium collections"]
    },
    {
      name: "Gaming Hub",
      type: "Gaming",
      focus: "In-game assets & items",
      features: ["Game integration", "Asset bridging", "Player trading"]
    },
    {
      name: "Music Platform",
      type: "Audio",
      focus: "Music & audio NFTs",
      features: ["Streaming rights", "Concert tickets", "Fan engagement"]
    },
    {
      name: "Open Market",
      type: "General",
      focus: "All types of NFTs",
      features: ["Open minting", "Community driven", "Low barriers"]
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NFT Marketplace Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay with orange/red tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-background/20 to-red-500/5 pointer-events-none" style={{ zIndex: 5 }} />
      
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
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-orange-500/5 to-red-500/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 border-orange-500/30 text-orange-600 bg-orange-500/5 backdrop-blur-sm">
              <Palette className="h-3 w-3 mr-1" />
              NFT Marketplaces
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Empower Digital{" "}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                Creators
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Launch your NFT marketplace with instant royalty payments, 
              low minting costs, and comprehensive creator monetization tools.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                    <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Launch Marketplace
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-orange-500/30 text-orange-600 hover:bg-orange-500/10">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                NFT Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
      
{/* NFT Features */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for NFT Success</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, trade, and monetize NFTs in a sustainable ecosystem
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {nftFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
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
      <section className="py-20 bg-gradient-to-r from-orange-500/5 via-background/90 to-red-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-600">
              <Code className="h-3 w-3 mr-1" />
              Quick Setup
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Launch Your NFT Marketplace</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your NFT marketplace running in under 15 minutes with our comprehensive SDK
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {integrationSteps.map((step, index) => (
              <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
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
                      <ArrowRight className={`h-4 w-4 ${copiedCode === `step-${index}` ? 'text-orange-500' : 'text-muted-foreground'}`} />
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
            <Badge className="mb-4 bg-red-500/10 text-red-600 border-red-500/20">
              <Target className="h-3 w-3 mr-1" />
              NFT Categories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Support Every Type of NFT</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From digital art to gaming assets, our platform supports all NFT categories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-red-500/20 hover:border-red-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="p-3 rounded-xl bg-red-500/10 inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-red-600 transition-colors">
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

      {/* Marketplace Types */}
      <section className="py-20 bg-gradient-to-r from-red-500/5 via-background/90 to-orange-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-600">
              <Database className="h-3 w-3 mr-1" />
              Marketplace Templates
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Marketplace Style</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pre-built templates for different types of NFT marketplaces
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {marketplaceTypes.map((marketplace, index) => (
              <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-lg mb-1">{marketplace.name}</h3>
                <Badge variant="secondary" className="mb-2 text-xs">
                  {marketplace.type}
                </Badge>
                <p className="text-sm text-muted-foreground mb-3">{marketplace.focus}</p>
                <div className="space-y-1">
                  {marketplace.features.map((feature, idx) => (
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
            <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              Why Choose ckPayment for NFTs?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Creators & Collectors</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment revolutionizes NFT marketplaces compared to traditional platforms
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-muted-foreground">Traditional NFT</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.traditional}</p>
                    </div>
                    
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                      <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                        {advantage.improvement}
                      </Badge>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <span className="font-medium text-orange-600">ckPayment NFT</span>
                        <IconComponent className="h-6 w-6 text-orange-500" />
                      </div>
                      <p className="text-sm font-medium text-orange-600">{advantage.ckPayment}</p>
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
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 border-orange-500/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-orange-500/10 text-orange-600 border-orange-500/20">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Empower Creators?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Launch Your NFT Marketplace Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join the creator economy revolution with a marketplace that puts 
                artists first and collectors second, powered by fair economics.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Palette className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Creating
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-orange-500/30 text-orange-600 hover:bg-orange-500/10">
                  <Settings className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group text-orange-600 hover:bg-orange-500/10">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Crown className="h-3 sm:h-4 w-3 sm:w-4 text-orange-500 flex-shrink-0" />
                  <span>Automatic Royalties</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gem className="h-3 sm:h-4 w-3 sm:w-4 text-red-500 flex-shrink-0" />
                  <span>Low Minting Costs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Network className="h-3 sm:h-4 w-3 sm:w-4 text-orange-600 flex-shrink-0" />
                  <span>Multi-Chain Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-3 sm:h-4 w-3 sm:w-4 text-red-600 flex-shrink-0" />
                  <span>Creator First</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default NFTMarketplaces;