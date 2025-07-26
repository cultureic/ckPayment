import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Zap, Code, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DemoEmbed from "./DemoEmbed";

const MotionDiv = ({ children, className = '', ...props }: any) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const motion = {
  div: MotionDiv,
};

const HeroSection = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const codeExample = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>SDK Name HTML Integration</title>
    <script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/cdkPay.js"></script>
  </head>
  <body>
    <div id="payment-modal"></div>
    <button onclick="startPaymentFlow()">Start Payment</button>
    <script>
      const startPaymentFlow = () => {
        ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
          console.log('Payment complete');
          // hide the modal when payment is done
          ckPaySDK.PaymentComponent.removePaymentModal();
        });
      };
  
      window.onload = function() {
        ckPaySDK.PaymentComponent.initialize('payment-modal');
      };
    </script>
  </body>
  </html>`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    toast({
      title: "Code copied",
      description: "The integration code has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="hero" className="relative min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-accent/10 blur-3xl -z-10" />

      <div className="container mx-auto px-4 h-full flex items-center pt-24 pb-16 lg:pt-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="text-left">
            <motion.div className="mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary to-accent p-1.5 mb-6">
                <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                  <Zap className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-primary" fill="currentColor" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-muted-foreground mb-2">
                ckPay SDK
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground/80 mb-8">
                Web3 Payments for ICP, as Simple as Stripe
              </p>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              One-Line Integration for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Web3 Payments
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Add secure, decentralized payments to your ICP dApp with a simple JavaScript SDK. 
              Customizable UI, multiple payment methods, and end-to-end blockchain security.
            </p>

            <motion.div className="mb-8">
              <Card className="bg-background/50 backdrop-blur-sm border border-border/30 p-4 pr-2 overflow-hidden">
                <div className="flex items-start">
                  <div className="flex-1 overflow-x-auto">
                    <pre className="text-sm text-muted-foreground font-mono">
                      <code>{codeExample}</code>
                    </pre>
                  </div>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-lg hover:bg-muted transition-colors ml-2"
                    aria-label="Copy code"
                  >
                    <Copy className={`h-4 w-4 ${copied ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                </div>
              </Card>
            </motion.div>

            <div className="flex flex-wrap gap-4">
              <motion.div>
                <Button 
                  size="lg" 
                  variant="gradient"
                  className="px-8 py-6 text-base font-medium"
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>
              </motion.div>
              <motion.div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group border-border/30 bg-background/50 hover:bg-background px-6 py-6 text-base font-medium"
                >
                  <Code className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>View Docs</span>
                </Button>
              </motion.div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/20 flex flex-wrap gap-8">
              {[
                { value: '1 Line', label: 'Integration' },
                { value: 'Custom UI', label: 'Options' },
                { value: '100%', label: 'On-chain' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-3">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                  {i < 2 && <div className="w-px h-8 bg-border/30" />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <DemoEmbed />
            
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/20 flex items-center justify-center animate-float">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">100%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        style={{
          animation: 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards',
          opacity: 0
        }}
      >
        <div className="text-xs text-muted-foreground mb-2">Scroll to explore</div>
        <div className="w-px h-12 bg-gradient-to-b from-foreground/30 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;