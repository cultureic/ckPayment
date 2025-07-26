import { Card } from "@/components/ui/card";
import { Cloud, Code, Globe } from "lucide-react";

// Versión simplificada para pruebas
const GameChangerSection = () => {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-muted/5 to-background" style={{ border: 'none', outline: 'none', boxShadow: 'none' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
            More Than Payments:{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              A New Decentralized Cloud
            </span>
          </h2>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border/30 p-8 mb-12 shadow-sm rounded-xl hover:bg-card/90 transition-all duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <Cloud className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              ckPayment is a proof of concept for a bigger idea: hosting complex software 
              (SDKs, libraries, etc.) 100% on-chain. We demonstrate that ICP can function as a 
              decentralized cloud, opening the door to a future where software is 
              truly sovereign and resilient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card/80 backdrop-blur-sm border border-border/30 p-6 text-center hover:bg-card/90 hover:shadow-md transition-all duration-300 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Sovereign Software</h3>
              <p className="text-sm text-foreground/80">
                SDKs and libraries completely independent of traditional infrastructure
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-border/30 p-6 text-center hover:bg-card/90 hover:shadow-md transition-all duration-300 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Native Web3</h3>
              <p className="text-sm text-foreground/80">
                A new generation of truly decentralized applications
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameChangerSection;