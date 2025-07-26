import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

const FinalCTASection = () => {
  return (
    <section id="docs" className="py-20 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/5 bg-grid-pattern"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
            Ready to Build the{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Future of Web3 Payments?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our community of pioneering developers who are redefining 
            what it means to build truly decentralized. The future of payments 
            starts here, starts now.
          </p>

          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl shadow-glow-soft hover:shadow-glow-primary transition-all duration-300 group"
          >
            <BookOpen className="mr-3 h-6 w-6" />
            Read the Documentation and Start Building
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          {/* Additional info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Start for free • No credit card required • Open Source
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;