import { Check, X, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";

const ComparisonSection = () => {
  const features = [
    {
      category: "Architecture",
      web2: "Centralized servers that can fail or be taken down",
      ckPayment: "Fully on-chain, running 24/7 on the Internet Computer"
    },
    {
      category: "Uptime",
      web2: "Scheduled maintenance & unexpected downtime",
      ckPayment: "100% uptime, no single point of failure"
    },
    {
      category: "Scalability",
      web2: "Limited by server capacity, requires manual scaling",
      ckPayment: "Automatically scales with the Internet Computer"
    },
    {
      category: "Costs",
      web2: "High operational costs, transaction fees, chargebacks",
      ckPayment: "Minimal fees, no chargebacks, pay-per-use model"
    },
    {
      category: "Security",
      web2: "Vulnerable to hacks, requires constant updates",
      ckPayment: "Blockchain-secured, tamper-proof, and transparent"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Web2 Payments vs. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ckPayment</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Why settle for yesterday's infrastructure? ckPayment is like having an on-chain multifunction robot that never sleeps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Web2 Column */}
          <div className="space-y-6">
            <Card className="p-6 bg-background/50 backdrop-blur-sm border-red-500/20 hover:border-red-500/40 transition-colors h-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4">
                  <X className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Traditional Web2</h3>
                <p className="text-muted-foreground text-sm">Centralized & Fragile</p>
              </div>
              
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature.web2}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </div>

          {/* VS Separator - Only visible on desktop */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-muted-foreground/20 to-transparent"></div>
          </div>

          {/* ckPayment Column */}
          <div className="space-y-6">
            <Card className="p-6 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors h-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Zap className="h-6 w-6" fill="currentColor" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">ckPayment</h3>
                <p className="text-muted-foreground text-sm">On-chain & Autonomous</p>
              </div>
              
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature.ckPayment}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic max-w-2xl mx-auto">
            "Imagine a multifunction robot that never sleeps, never takes breaks, and works 24/7 on the blockchain. 
            That's ckPayment - always on, always reliable, and always at your service."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
