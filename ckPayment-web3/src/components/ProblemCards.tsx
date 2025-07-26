import { Server, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card } from "./ui/card";

const ProblemCards = () => {
  const cards = [
    {
      icon: <Server className="h-8 w-8 text-amber-500" />,
      title: "The Hidden Dependency",
      description: "Your Web3 app is secretly chained to a Web2 server. This centralized component undermines your entire decentralized stack.",
      borderColor: "border-amber-500/30"
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      title: "Single Point of Failure",
      description: "One server outage, one DDoS attack, or one de-platforming decision, and your entire payment system is offline. Your revenue stops instantly.",
      borderColor: "border-red-500/30"
    },
    {
      icon: <ShieldAlert className="h-8 w-8 text-purple-500" />,
      title: "A Compromised Paradigm",
      description: "It's the illusion of decentralization. Your smart contract is on-chain, but your user interface is censorable and fragile, defeating the core promise of Web3.",
      borderColor: "border-purple-500/30"
    }
  ];

  return (
    <section className="relative py-20 bg-background z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Centralized Crutch in Your Web3 Stack
          </h2>
          <p className="text-muted-foreground text-lg">
            Most Web3 applications have a critical vulnerability hiding in plain sight
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card 
              key={index}
              className={`p-6 bg-background/80 backdrop-blur-sm border ${card.borderColor} hover:shadow-lg transition-all duration-300 h-full flex flex-col relative z-10`}
            >
              <div className="w-16 h-16 rounded-xl bg-opacity-20 flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: `${card.borderColor.replace('border-', '').replace('/30', '')}20` }}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                {card.title}
              </h3>
              <p className="text-muted-foreground text-center flex-grow">
                {card.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemCards;
