import { Code, Copy, ExternalLink, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const DocumentationPage = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopied(section);
    toast({
      title: "Copied!",
      description: "Code has been copied to clipboard",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    {
      id: "html-integration",
      title: "HTML Integration",
      description: "Add ckPay to your website with simple HTML",
      code: `<!DOCTYPE html>
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
      </html>`
    },
    {
      id: "react-integration",
      title: "React Integration",
      description: "How to use ckPay in your React application",
      code: `import React, { useEffect } from 'react';

function PaymentButton() {
  const handlePayment = () => {
    ckPaySDK.PaymentComponent.initialize('payment-modal');

    ckPaySDK.PaymentComponent.renderPaymentModal({}, () => {
      console.log('Payment successful');
      ckPaySDK.PaymentComponent.removePaymentModal();
    });
  };

  return (
    <div>
      <div id="payment-modal"></div>
      <button onClick={handlePayment}>
        Pay with ckPay
      </button>
    </div>
  );
}

export default PaymentButton;`
    },
    {
      id: "configuration",
      title: "Configuration Options",
      description: "All available options for customizing the payment flow",
      code: `// Full configuration options
ckPaySDK.PaymentComponent.initialize('payment-modal');`
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent p-1.5 mb-8">
              <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                <Zap className="h-12 w-12 text-primary" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ckPay <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Documentation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to integrate Web3 payments into your application
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </div>
                
                <Card className="relative bg-background/50 border border-border/30 overflow-hidden">
                  <div className="p-6">
                    <pre className="text-sm font-mono overflow-x-auto">
                      <code>{section.code}</code>
                    </pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => copyCode(section.code, section.id)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied === section.id ? 'Copied!' : 'Copy'}
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to integrate ckPay?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="gradient" className="px-8">
              Get API Keys
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentationPage;