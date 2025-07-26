import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2,
  Zap,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  Cpu,
  Coins,
  Trophy,
  ShieldCheck,
  Code2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

const Gaming = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
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

  // Stats data
  const stats = [
    { value: "40%", label: "More Revenue", icon: TrendingUp, color: "text-purple-500" },
    { value: "3x", label: "Faster Checkout", icon: Zap, color: "text-pink-500" },
    { value: "0%", label: "Chargeback Risk", icon: Shield, color: "text-purple-600" },
    { value: "1B+", label: "Gamers Reached", icon: Users, color: "text-pink-600" }
  ];

  // Features data
  const features = [
    {
      icon: Cpu,
      title: "In-Game Purchases",
      description: "Seamlessly integrate microtransactions for in-game items, skins, and power-ups.",
      benefits: [
        "One-click purchases",
        "Instant item delivery",
        "Support for all major cryptocurrencies",
        "Fraud prevention"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Coins,
      title: "Play-to-Earn",
      description: "Enable players to earn real value through gameplay with blockchain integration.",
      benefits: [
        "Tokenized rewards",
        "NFT item ownership",
        "Staking mechanisms",
        "Leaderboard rewards"
      ],
      color: "from-pink-500 to-purple-500"
    },
    {
      icon: ShieldCheck,
      title: "Secure Trading",
      description: "Facilitate secure player-to-player trading of in-game assets with smart contracts.",
      benefits: [
        "Escrow protection",
        "Royalty on secondary sales",
        "Cross-game compatibility",
        "Secure wallet integration"
      ],
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: Trophy,
      title: "Tournaments & Rewards",
      description: "Host competitive tournaments with automated prize distribution.",
      benefits: [
        "Automated payouts",
        "Smart contract rewards",
        "Transparent leaderboards",
        "Custom reward structures"
      ],
      color: "from-pink-600 to-purple-600"
    }
  ];

  // Integration steps
  const integrationSteps = [
    {
      step: 1,
      title: "Install SDK",
      description: "Add our gaming SDK to your game engine or platform",
      code: `npm install @ckpayment/gaming
// or via CDN
<script src="https://ckpayment.icp0.io/gaming.js"></script>`,
      time: "2 minutes"
    },
    {
      step: 2,
      title: "Configure Your Game",
      description: "Set up your game configuration with supported tokens and items",
      code: `ckGaming.init({
  gameId: 'your-game-id',
  tokens: ['ICP', 'ckBTC', 'CHAT'],
  theme: 'dark' // Match your game's UI
});`,
      time: "5 minutes"
    },
    {
      step: 3,
      title: "Add Items & Rewards",
      description: "Define your in-game items and reward structures",
      code: `// Define an in-game item
ckGaming.createItem({
  id: 'legendary_sword',
  name: 'Legendary Sword',
  price: 4.99,
  currency: 'ICP',
  type: 'weapon',
  rarity: 'legendary'
});`,
      time: "10 minutes"
    },
    {
      step: 4,
      title: "Enable Transactions",
      description: "Add purchase and reward functionality to your game",
      code: `// Handle item purchase in your game
const purchase = await ckGaming.purchaseItem(
  'player123', 
  'legendary_sword',
  { discountCode: 'SUMMER2023' }
);`,
      time: "15 minutes"
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: "How does ckPayment handle in-game transactions?",
      answer: "ckPayment uses blockchain technology to process transactions instantly and securely, with minimal fees. Players can purchase items using various cryptocurrencies, and the items are delivered to their in-game inventory in real-time."
    },
    {
      question: "Can I integrate ckPayment with my existing game?",
      answer: "Yes! ckPayment is designed to work with any game engine or platform. Our SDK provides simple APIs for Unity, Unreal Engine, and custom game engines."
    },
    {
      question: "What blockchain does ckPayment use?",
      answer: "ckPayment is built on the Internet Computer Protocol (ICP), which offers fast, low-cost transactions perfect for gaming applications. We also support cross-chain functionality."
    },
    {
      question: "How do players get started with ckPayment?",
      answer: "Players simply connect their wallet (like Plug or Stoic) to your game, and they're ready to make purchases or earn rewards. No complicated setup required."
    },
    {
      question: "What about gas fees?",
      answer: "We've optimized our solution to minimize gas fees. For most in-game transactions, the cost is negligible, and we offer batch processing to further reduce costs."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/80 to-pink-900/80">
        <AnimatedBackground />
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border border-purple-400/30 hover:bg-purple-500/30 transition-colors">
              <Gamepad2 className="h-4 w-4 mr-2" />
              GAMING SOLUTIONS
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
              Powering the Next Generation of <span className="text-pink-400">Blockchain Games</span>
            </h1>
            <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Seamlessly integrate blockchain payments, NFTs, and play-to-earn mechanics into your games with our developer-friendly SDK.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Get Started for Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-purple-900/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Everything You Need to Build the <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Future of Gaming</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive toolkit helps you integrate blockchain technology into your games with minimal effort.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="overflow-hidden border border-border/30 hover:shadow-lg transition-shadow">
                  <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}/10`}>
                        <Icon className={`h-6 w-6 ${feature.color.replace('from-', 'text-').split(' ')[0]}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground mb-4">{feature.description}</p>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gaming;
