import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Gamepad2, 
  TrendingUp, 
  Palette, 
  GraduationCap, 
  Heart,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
  Users,
  ExternalLink
} from "lucide-react";

const UseCasesSection = () => {
  const industries = [
    {
      icon: ShoppingCart,
      title: "E-Commerce",
      subtitle: "Next-Gen Online Stores",
      description: "Transform your online store with instant, global payments that work across all devices and platforms.",
      benefits: [
        "Instant settlement worldwide",
        "Lower transaction fees",
        "No chargebacks or fraud",
        "Global reach without barriers"
      ],
      implementation: "Add one line of code to accept payments from anywhere in the world",
      codeExample: `ckPayment.init({
  store: 'your-store-id',
  currency: 'ICP'
});`,
      stats: { value: "15%", label: "Higher Conversion" },
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Gamepad2,
      title: "Gaming",
      subtitle: "In-Game Economies",
      description: "Power your game's economy with seamless microtransactions and player-to-player trading.",
      benefits: [
        "Instant in-game purchases",
        "Player-owned assets (NFTs)",
        "Cross-game compatibility",
        "Reduced payment friction"
      ],
      implementation: "Enable microtransactions and NFT trading with minimal integration",
      codeExample: `ckPayment.buyItem({
  itemId: 'legendary-sword',
  price: 0.5,
  currency: 'ICP'
});`,
      stats: { value: "40%", label: "More Revenue" },
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "DeFi",
      subtitle: "Decentralized Finance",
      description: "Build the next generation of financial applications with programmable money and smart contracts.",
      benefits: [
        "Programmable payments",
        "Automated settlements",
        "Yield farming integration",
        "Cross-chain compatibility"
      ],
      implementation: "Create complex financial products with simple payment primitives",
      codeExample: `ckPayment.createPool({
  tokenA: 'ICP',
  tokenB: 'ckBTC',
  fee: 0.3
});`,
      stats: { value: "$2B+", label: "TVL Supported" },
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Palette,
      title: "NFT Marketplaces",
      subtitle: "Digital Art & Collectibles",
      description: "Launch your NFT marketplace with instant royalty payments and creator monetization.",
      benefits: [
        "Instant royalty distribution",
        "Creator monetization tools",
        "Low minting costs",
        "Sustainable ecosystem"
      ],
      implementation: "Build marketplaces with automatic royalty splits and creator payments",
      codeExample: `ckPayment.mintNFT({
  creator: 'artist-wallet',
  royalty: 10,
  price: 1.5
});`,
      stats: { value: "90%", label: "Lower Fees" },
      color: "from-orange-500 to-red-500"
    },
    {
      icon: GraduationCap,
      title: "Education",
      subtitle: "Online Learning Platforms",
      description: "Monetize educational content with micropayments for courses, certificates, and premium features.",
      benefits: [
        "Micropayments for content",
        "Global student access",
        "Instant instructor payouts",
        "Credential verification"
      ],
      implementation: "Enable pay-per-lesson or subscription models with global accessibility",
      codeExample: `ckPayment.enrollCourse({
  courseId: 'web3-basics',
  price: 0.1,
  duration: '30-days'
});`,
      stats: { value: "60%", label: "Global Reach" },
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Heart,
      title: "Creator Economy",
      subtitle: "Content Monetization",
      description: "Empower creators with direct fan support, premium content, and subscription models.",
      benefits: [
        "Direct fan-to-creator payments",
        "Subscription management",
        "Tip jar functionality",
        "No platform fees"
      ],
      implementation: "Integrate tipping, subscriptions, and premium content unlocks",
      codeExample: `ckPayment.tipCreator({
  creatorId: 'artist-123',
  amount: 0.05,
  message: 'Love your work!'
});`,
      stats: { value: "95%", label: "Creator Retention" },
      color: "from-pink-500 to-rose-500"
    }
  ];

  const quickStats = [
    {
      icon: Globe,
      value: "180+",
      label: "Countries Supported",
      description: "Global reach from day one"
    },
    {
      icon: Zap,
      value: "<3s",
      label: "Transaction Speed",
      description: "Lightning-fast settlements"
    },
    {
      icon: Users,
      value: "50K+",
      label: "Active Developers",
      description: "Growing ecosystem"
    }
  ];

  return (
    <section id="use-cases" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Gamepad2 className="h-4 w-4" />
            Use Cases & Industries
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Built for Every
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Digital Economy
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From e-commerce to gaming, DeFi to creator platforms - ckPayment powers 
            the next generation of digital businesses across every industry.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-foreground mb-2">
                  {stat.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Industries Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {industries.map((industry, index) => {
            const IconComponent = industry.icon;
            return (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/90 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-0">
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${industry.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{industry.title}</h3>
                          <p className="text-white/80 text-sm">{industry.subtitle}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {industry.stats.value}
                        <span className="ml-1 text-xs">{industry.stats.label}</span>
                      </Badge>
                    </div>
                    <p className="text-white/90 leading-relaxed">
                      {industry.description}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-3">Key Benefits</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {industry.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Implementation */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-2">Implementation</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {industry.implementation}
                      </p>
                      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                        <pre className="text-muted-foreground">
                          <code>{industry.codeExample}</code>
                        </pre>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button 
                      asChild
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <Link to={industry.title === 'E-Commerce' ? '/ecommerce' : industry.title === 'Gaming' ? '/gaming' : industry.title === 'DeFi' ? '/defi' : industry.title === 'NFT Marketplaces' ? '/nft-marketplaces' : industry.title === 'Education' ? '/education' : industry.title === 'Creator Economy' ? '/creator-economy' : '#'}>
                        Explore {industry.title} Solutions
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Don't See Your Industry?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                ckPayment is flexible enough to power any digital business model. 
                Our SDK adapts to your specific needs and use cases.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Link to="/start-building">
                    Start Building Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Talk to Our Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
