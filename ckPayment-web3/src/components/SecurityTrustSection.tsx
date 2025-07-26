import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle, Globe, Users, Zap } from "lucide-react";

const SecurityTrustSection = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Decentralized Security",
      description: "Built on Internet Computer Protocol with cryptographic security guarantees. No single point of failure.",
      highlight: "Zero Trust Architecture"
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All transactions are cryptographically secured with industry-standard encryption protocols.",
      highlight: "256-bit Encryption"
    },
    {
      icon: CheckCircle,
      title: "Smart Contract Audited",
      description: "Our smart contracts have been thoroughly audited by leading blockchain security firms.",
      highlight: "Third-party Verified"
    }
  ];

  const certifications = [
    {
      name: "SOC 2 Type II",
      status: "Compliant",
      description: "Security, availability, and confidentiality controls"
    },
    {
      name: "ISO 27001",
      status: "Certified",
      description: "Information security management systems"
    },
    {
      name: "GDPR",
      status: "Compliant",
      description: "Data protection and privacy regulations"
    },
    {
      name: "PCI DSS",
      status: "Level 1",
      description: "Payment card industry data security standard"
    }
  ];

  const trustMetrics = [
    {
      icon: Globe,
      value: "99.9%",
      label: "Network Uptime",
      description: "Powered by ICP's decentralized infrastructure"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Developers Trust Us",
      description: "Growing community of Web3 builders"
    },
    {
      icon: Zap,
      value: "$50M+",
      label: "Transactions Secured",
      description: "Total value processed safely"
    }
  ];

  return (
    <section id="security" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Security & Trust
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Enterprise-Grade Security
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Built for Web3
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your payments are protected by the most advanced cryptographic security available. 
            Built on decentralized infrastructure with zero single points of failure.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="bg-background/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Metrics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {trustMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-foreground mb-2">
                  {metric.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Certifications & Compliance */}
        <div className="bg-muted/20 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Certifications & Compliance
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We maintain the highest standards of security and compliance to protect your business and users.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="bg-background/80 backdrop-blur-sm border border-border/30">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {cert.name}
                  </h4>
                  <Badge variant="outline" className="mb-3 text-green-600 border-green-600/30">
                    {cert.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Decentralized Security Explanation */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <Globe className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Why Decentralized Security Matters
              </h3>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Traditional Centralized Systems</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      Single point of failure
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      Vulnerable to data breaches
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      Requires trust in intermediaries
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      Censorship and control risks
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">ckPayment Decentralized Security</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      Distributed across thousands of nodes
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      Cryptographically secured transactions
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      Trustless, permissionless system
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      Censorship-resistant payments
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SecurityTrustSection;
