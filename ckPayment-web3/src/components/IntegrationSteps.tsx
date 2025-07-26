import { Code } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const IntegrationSteps = () => {
  const { toast } = useToast();
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const steps = [
    {
      title: "Add the script tag",
      description: "Include the SDK in your HTML",
      code: `<script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/cdkPay.js"></script>`,
      buttonText: "Copy"
    },
    {
      title: "Create payment container",
      description: "Add a div for the payment modal",
      code: `<div id="payment-modal"></div>`,
      buttonText: "Copy"
    },
    {
      title: "Initialize the SDK",
      description: "Configure and start the payment flow",
      code: `ckPaySDK.PaymentComponent.initialize('payment-modal');`,
      buttonText: "Copy"
    },
    {
      title: "Trigger payment (optional)",
      description: "Programmatically start payment flow",
      code: `    const startPaymentFlow = () => {
        ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
          console.log('Payment complete');
          // hide the modal when payment is done
          ckPaySDK.PaymentComponent.removePaymentModal();
        });
      };
      ;`,
      buttonText: "Copy"
    }
  ];

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    toast({
      title: "Copied!",
      description: "Code has been copied to clipboard.",
    });
    
    setTimeout(() => {
      setCopiedStep(null);
    }, 2000);
  };

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Simple Integration
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Add Web3 payments to your app with just a few lines of JavaScript
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-8 sm:pl-10 md:pl-12 group">
              <div className="absolute left-0 sm:left-2 top-0 h-full w-0.5 bg-border" aria-hidden="true">
                <div className="h-3 w-3 rounded-full bg-primary absolute -left-1.5 transform -translate-y-1/2" />
              </div>
              
              <Card className="p-4 sm:p-6 bg-background/50 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-colors">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-medium text-sm sm:text-base mr-3">
                        {index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm pl-10 sm:pl-11">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="relative w-full sm:w-auto">
                    <div className="relative bg-muted/50 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap overflow-x-auto max-w-[calc(100vw-4rem)] sm:max-w-none">
                        <code>{step.code}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1 h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => copyToClipboard(step.code, index)}
                      >
                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="sr-only">Copy code</span>
                      </Button>
                      {copiedStep === index && (
                        <div className="absolute -top-8 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Copied!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <Button 
            variant="outline" 
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-sm sm:text-base"
            onClick={() => window.open('https://docs.ckpayment.xyz', '_blank')}
          >
            <Code className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            View full documentation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSteps;