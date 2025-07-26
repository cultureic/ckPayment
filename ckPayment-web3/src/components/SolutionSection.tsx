import { Blocks, Rocket, Shield, Zap, Globe, Code2, CheckCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const SolutionSection = () => {
  const mainFeatures = [
    {
      icon: Blocks,
      title: "100% On-Chain",
      description: "Both backend and frontend (our JS SDK) are hosted and served directly from ICP canisters. True decentralization.",
      highlight: "Zero Dependencies"
    },
    {
      icon: Rocket,
      title: "Instant Integration",
      description: "Inspired by Stripe, you only need to add a <script> tag to get started. No complex configurations needed.",
      highlight: "One-Line Setup"
    },
    {
      icon: Shield,
      title: "ICP Security",
      description: "Inherits all the security, speed, and censorship resistance of the Internet Computer Protocol network.",
      highlight: "Enterprise Grade"
    }
  ];

  const additionalFeatures = [
    { icon: Zap, title: "Lightning Fast", description: "Sub-second transaction processing" },
    { icon: Globe, title: "Global Access", description: "Available worldwide, no restrictions" },
    { icon: Code2, title: "Developer Friendly", description: "Simple APIs and comprehensive docs" }
  ];

  return (
    <section id="features" className="relative py-20 bg-gradient-to-br from-background/70 via-muted/10 to-background/70 overflow-hidden scroll-mt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="h-4 w-4" />
              Revolutionary Web3 Payment Solution
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              ckPayment: Your{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                100% On-Chain Gateway
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The first truly decentralized payment gateway that runs entirely on the Internet Computer. 
              No servers, no downtime, no single points of failure.
            </p>
            <div className="mt-8">
              <Link 
                to="/features" 
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <span>View All Features in Detail</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Main Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {mainFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="relative bg-card/50 backdrop-blur-sm border border-border/50 p-8 text-center group hover:scale-105 hover:shadow-2xl transition-all duration-500">
                  {/* Highlight Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {feature.highlight}
                    </span>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                    <IconComponent className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {feature.description}
                  </p>
                  
                  {/* Hover Arrow */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-primary mx-auto" />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Additional Features */}
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30 p-8">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">
              Built for the Future of Web3
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/20 transition-colors duration-300">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;