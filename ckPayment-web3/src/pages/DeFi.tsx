import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  TrendingUp,
  Coins,
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
  Percent
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

const DeFi = () => {
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
    { value: "$2B+", label: "TVL Supported", icon: TrendingUp, color: "text-green-500" },
    { value: "50+", label: "DeFi Protocols", icon: Network, color: "text-emerald-500" },
    { value: "0.01%", label: "Protocol Fees", icon: Percent, color: "text-green-600" },
    { value: "24/7", label: "Automated Trading", icon: Activity, color: "text-emerald-600" }
  ];

  const defiFeatures = [
    {
      icon: Coins,
      title: "Programmable Payments",
      description: "Create complex financial instruments with smart contract automation",
      benefits: [
        "Automated yield farming",
        "Smart contract escrow",
        "Conditional payments",
        "Multi-signature wallets"
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Repeat,
      title: "Cross-Chain Liquidity",
      description: "Access liquidity across multiple blockchains seamlessly",
      benefits: [
        "Bridge multiple chains",
        "Unified liquidity pools",
        "Arbitrage opportunities",
        "Reduced slippage"
      ],
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: Calculator,
      title: "Yield Optimization",
      description: "Maximize returns with automated yield farming strategies",
      benefits: [
        "Auto-compounding rewards",
        "Strategy optimization",
        "Risk management",
        "Portfolio rebalancing"
      ],
      color: "from-green-600 to-emerald-400",
      bgColor: "bg-green-600/10"
    },
    {
      icon: Shield,
      title: "Institutional Security",
      description: "Enterprise-grade security for large-scale DeFi operations",
      benefits: [
        "Multi-sig governance",
        "Audit trail logging",
        "Risk assessment tools",
        "Compliance reporting"
      ],
      color: "from-emerald-400 to-green-500",
      bgColor: "bg-emerald-400/10"
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Initialize DeFi SDK",
      description: "Set up the ckPayment DeFi SDK with your protocol configuration",
      code: `npm install @ckpayment/defi
// Initialize with your protocol
import { ckDeFi } from '@ckpayment/defi';

ckDeFi.init({
  protocolId: 'your-protocol-id',
  chains: ['ICP', 'Ethereum', 'Bitcoin'],
  governance: 'multi-sig'
});`,
      time: "5 minutes"
    },
    {
      step: 2,
      title: "Create Liquidity Pools",
      description: "Deploy automated market makers and liquidity pools",
      code: `// Create a new liquidity pool
const pool = await ckDeFi.createPool({
  tokenA: 'ICP',
  tokenB: 'ckBTC',
  fee: 0.3, // 0.3% fee
  initialLiquidity: {
    tokenA: 1000,
    tokenB: 0.5
  }
});`,
      time: "10 minutes"
    },
    {
      step: 3,
      title: "Deploy Yield Strategies",
      description: "Implement automated yield farming and staking mechanisms",
      code: `// Deploy yield farming strategy
const strategy = await ckDeFi.deployStrategy({
  type: 'yield-farming',
  pools: [pool.id],
  autoCompound: true,
  riskLevel: 'moderate',
  rebalanceThreshold: 5 // 5% deviation
});`,
      time: "15 minutes"
    }
  ];

  const useCases = [
    {
      title: "Decentralized Exchanges",
      description: "Build AMMs and order book exchanges with deep liquidity",
      icon: Repeat,
      examples: ["Automated Market Makers", "Order book DEXs", "Cross-chain swaps", "Liquidity aggregation"]
    },
    {
      title: "Lending Protocols",
      description: "Create lending and borrowing platforms with dynamic rates",
      icon: Banknote,
      examples: ["Overcollateralized loans", "Flash loans", "Interest rate models", "Liquidation systems"]
    },
    {
      title: "Yield Farming",
      description: "Deploy yield optimization strategies and farming protocols",
      icon: TrendingUp,
      examples: ["Liquidity mining", "Staking rewards", "Auto-compounding", "Strategy vaults"]
    },
    {
      title: "Derivatives Trading",
      description: "Build sophisticated derivatives and synthetic asset platforms",
      icon: LineChart,
      examples: ["Perpetual futures", "Options trading", "Synthetic assets", "Prediction markets"]
    }
  ];

  const competitiveAdvantages = [
    {
      traditional: "Complex smart contracts",
      ckPayment: "Simple SDK integration",
      icon: Code,
      improvement: "90% less code"
    },
    {
      traditional: "High gas fees",
      ckPayment: "Minimal protocol fees",
      icon: DollarSign,
      improvement: "99% cost reduction"
    },
    {
      traditional: "Single chain limitation",
      ckPayment: "Multi-chain by default",
      icon: Network,
      improvement: "Unlimited scalability"
    },
    {
      traditional: "Manual operations",
      ckPayment: "Fully automated",
      icon: Zap,
      improvement: "24/7 automation"
    }
  ];

  const protocols = [
    {
      name: "Uniswap V3",
      type: "DEX",
      tvl: "$4.2B",
      integration: "Native"
    },
    {
      name: "Aave",
      type: "Lending",
      tvl: "$6.8B",
      integration: "Native"
    },
    {
      name: "Compound",
      type: "Lending",
      tvl: "$2.1B",
      integration: "Native"
    },
    {
      name: "Curve",
      type: "DEX",
      tvl: "$3.9B",
      integration: "Native"
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DeFi Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay with green tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-background/20 to-emerald-500/5 pointer-events-none" style={{ zIndex: 5 }} />
      
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
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-green-500/5 to-emerald-500/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 border-green-500/30 text-green-600 bg-green-500/5 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              DeFi Solutions
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build the Future of{" "}
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                Finance
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Create sophisticated DeFi protocols with programmable payments, 
              cross-chain liquidity, and automated yield strategies.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                    <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Building
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-green-500/30 text-green-600 hover:bg-green-500/10">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                DeFi Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* DeFi Features */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern DeFi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build sophisticated financial protocols and applications
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {defiFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
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
      <section className="py-20 bg-gradient-to-r from-green-500/5 via-background/90 to-emerald-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-500/30 text-green-600">
              <Code className="h-3 w-3 mr-1" />
              Quick Integration
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Deploy DeFi Protocols in Minutes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build sophisticated DeFi applications with our comprehensive SDK and tools
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {integrationSteps.map((step, index) => (
              <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
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
                      <ArrowRight className={`h-4 w-4 ${copiedCode === `step-${index}` ? 'text-green-500' : 'text-muted-foreground'}`} />
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
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Target className="h-3 w-3 mr-1" />
              DeFi Use Cases
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Power Every DeFi Protocol</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From DEXs to lending protocols, build any DeFi application with our infrastructure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-emerald-500/20 hover:border-emerald-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="p-3 rounded-xl bg-emerald-500/10 inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-600 transition-colors">
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

      {/* Protocol Integrations */}
      <section className="py-20 bg-gradient-to-r from-emerald-500/5 via-background/90 to-green-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-500/30 text-green-600">
              <Network className="h-3 w-3 mr-1" />
              Protocol Integrations
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect to Leading DeFi Protocols</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Native integrations with the most popular DeFi protocols and platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {protocols.map((protocol, index) => (
              <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-bold text-lg mb-1">{protocol.name}</h3>
                <Badge variant="secondary" className="mb-2 text-xs">
                  {protocol.type}
                </Badge>
                <p className="text-sm text-muted-foreground mb-2">TVL: {protocol.tvl}</p>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                  {protocol.integration}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-500/30 text-green-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              Why Choose ckPayment for DeFi?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for DeFi Developers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment simplifies DeFi development compared to traditional approaches
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-muted-foreground">Traditional DeFi</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.traditional}</p>
                    </div>
                    
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {advantage.improvement}
                      </Badge>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <span className="font-medium text-green-600">ckPayment DeFi</span>
                        <IconComponent className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-green-600">{advantage.ckPayment}</p>
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
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-600/10 border-green-500/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-green-500/10 text-green-600 border-green-500/20">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Build the Future of Finance?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Launch Your DeFi Protocol Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join the next generation of DeFi builders using ckPayment to create 
                sophisticated financial applications with unprecedented ease.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Building DeFi
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-green-500/30 text-green-600 hover:bg-green-500/10">
                  <Settings className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group text-green-600 hover:bg-green-500/10">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>Audited Smart Contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-emerald-500 flex-shrink-0" />
                  <span>Instant Settlements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Network className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 flex-shrink-0" />
                  <span>Multi-Chain Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Percent className="h-3 sm:h-4 w-3 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>Minimal Fees</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DeFi;