import { Card } from "@/components/ui/card";
import { Code, Layout, Settings, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Code,
      title: "Add SDK Script",
      description: "Include the ckPay SDK in your HTML file.",
      code: '<script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/cdkPay.js"></script>'
    },
    {
      icon: Layout,
      title: "Create Payment Container",
      description: "Add a div element where the payment modal will appear.",
      code: '<div id="payment-modal"></div>'
    },
    {
      icon: Settings,
      title: "Initialize Payment",
      description: "Configure the payment component with your settings.",
      code: `ckPaySDK.PaymentComponent.initialize('payment-modal');`
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Simple Integration{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                in 3 Steps
              </span>
            </h2>
            <div className="mt-8">
              <Link 
                to="/docs" 
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <span>View Full Documentation</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0"></div>
                )}
                
                <Card className="bg-gradient-card border border-border/50 p-6 relative z-10 hover:shadow-glow-soft transition-all duration-300">
                  {/* Step number */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                  
                  {/* Code snippet */}
                  <div className="bg-code-bg border border-border/50 rounded-lg p-3">
                    <pre className="text-sm text-primary font-mono overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;