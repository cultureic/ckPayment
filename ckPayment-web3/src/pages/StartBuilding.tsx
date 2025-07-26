import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Code, 
  BookOpen, 
  MessageCircle, 
  ArrowRight,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  Copy,
  ExternalLink,
  Play,
  Download,
  Github,
  Mail,
  Users,
  Clock,
  Star
} from "lucide-react";

const StartBuilding = () => {
  const location = useLocation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Copy to clipboard functionality with fallback
  const copyToClipboard = async (text: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopiedCode(id);
          setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
          console.error('Fallback copy failed: ', err);
          // Could show a toast notification here
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Could show an error toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay - Removed opacity to make AnimatedBackground more visible */}
      
      <main className="relative z-10 pt-20">
        {/* Hero Section - Reduced background opacity to show AnimatedBackground */}
        <section className="py-20 bg-gradient-to-br from-background/50 via-transparent to-background/50 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 backdrop-blur-sm">
                <Rocket className="h-3 w-3 mr-1" />
                Start Building Today
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Build the Future of{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Web3 Payments
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Get started with ckPayment in minutes. Choose your integration method, 
                follow our guides, and start accepting payments on the Internet Computer.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Play className="h-5 w-5 mr-2" />
                  Quick Start Guide
                </Button>
                <Button variant="outline" size="lg">
                  <Download className="h-5 w-5 mr-2" />
                  Download SDK
                </Button>
                <Button variant="ghost" size="lg">
                  <BookOpen className="h-5 w-5 mr-2" />
                  View Documentation
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30">
                  <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">5min</div>
                  <div className="text-sm text-muted-foreground">Setup Time</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30">
                  <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30">
                  <Globe className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">200+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30">
                  <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-muted-foreground">Developers</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Options Section - Reduced background opacity */}
        <section className="py-20 bg-gradient-to-b from-transparent to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Code className="h-3 w-3 mr-1" />
                Integration Options
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your Integration Method
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Pick the integration approach that best fits your project and technical requirements.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* JavaScript SDK */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 mb-4 group-hover:bg-blue-500/20 transition-colors">
                      <Code className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">JavaScript SDK</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Beginner</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        5 minutes
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Quick integration for web applications with automatic UI components
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "One-line integration",
                      "Automatic UI components",
                      "Built-in error handling",
                      "TypeScript support"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-mono">JavaScript</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(`import { ckPayment } from '@ckpayment/sdk';

const payment = ckPayment.init({
  apiKey: 'your-api-key'
});

payment.createCheckout({
  amount: 100,
  currency: 'ICP'
});`, 'js-sdk')}
                      >
                        {copiedCode === 'js-sdk' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{`import { ckPayment } from '@ckpayment/sdk';

const payment = ckPayment.init({
  apiKey: 'your-api-key'
});

payment.createCheckout({
  amount: 100,
  currency: 'ICP'
});`}</code>
                    </pre>
                  </div>

                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* REST API */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-green-500/10 mb-4 group-hover:bg-green-500/20 transition-colors">
                      <Globe className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">REST API</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Intermediate</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        15 minutes
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Direct API integration for maximum flexibility and control
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "Full API control",
                      "Custom UI implementation",
                      "Server-side integration",
                      "Webhook support"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-mono">cURL</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(`curl -X POST https://api.ckpayment.com/v1/checkout \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100,
    "currency": "ICP"
  }'`, 'curl-api')}
                      >
                        {copiedCode === 'curl-api' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{`curl -X POST https://api.ckpayment.com/v1/checkout \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100,
    "currency": "ICP"
  }'`}</code>
                    </pre>
                  </div>

                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View API Docs
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* React Components */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 mb-4 group-hover:bg-purple-500/20 transition-colors">
                      <Rocket className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">React Components</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Beginner</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        3 minutes
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Pre-built React components for instant integration
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "Drop-in components",
                      "Customizable styling",
                      "React hooks included",
                      "TypeScript definitions"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-mono">React</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(`import { PaymentButton } from '@ckpayment/react';

function App() {
  return (
    <PaymentButton
      amount={100}
      currency="ICP"
      onSuccess={handleSuccess}
    />
  );
}`, 'react-component')}
                      >
                        {copiedCode === 'react-component' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{`import { PaymentButton } from '@ckpayment/react';

function App() {
  return (
    <PaymentButton
      amount={100}
      currency="ICP"
      onSuccess={handleSuccess}
    />
  );
}`}</code>
                    </pre>
                  </div>

                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Install Package
                    <Download className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Start Guide Section - Transparent background */}
        <section className="py-20 bg-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Play className="h-3 w-3 mr-1" />
                Quick Start Guide
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get Up and Running in Minutes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow these simple steps to integrate ckPayment into your application.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Step 1 */}
                <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3">Install the SDK</h3>
                      <p className="text-muted-foreground mb-4">
                        Add ckPayment to your project using your preferred package manager.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-mono">Terminal</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard('npm install @ckpayment/sdk', 'npm-install')}
                          >
                            {copiedCode === 'npm-install' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <pre className="text-sm text-foreground">
                          <code>npm install @ckpayment/sdk</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 2 */}
                <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3">Initialize ckPayment</h3>
                      <p className="text-muted-foreground mb-4">
                        Set up ckPayment with your API key and configuration.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-mono">JavaScript</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(`import { ckPayment } from '@ckpayment/sdk';

const payment = ckPayment.init({
  apiKey: 'your-api-key',
  network: 'mainnet' // or 'testnet'
});`, 'init-sdk')}
                          >
                            {copiedCode === 'init-sdk' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <pre className="text-sm text-foreground overflow-x-auto">
                          <code>{`import { ckPayment } from '@ckpayment/sdk';

const payment = ckPayment.init({
  apiKey: 'your-api-key',
  network: 'mainnet' // or 'testnet'
});`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 3 */}
                <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3">Create a Payment</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first payment checkout with just a few lines of code.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-mono">JavaScript</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(`const checkout = await payment.createCheckout({
  amount: 100, // Amount in smallest currency unit
  currency: 'ICP',
  description: 'Premium subscription',
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel'
});

// Redirect user to checkout
window.location.href = checkout.url;`, 'create-checkout')}
                          >
                            {copiedCode === 'create-checkout' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <pre className="text-sm text-foreground overflow-x-auto">
                          <code>{`const checkout = await payment.createCheckout({
  amount: 100, // Amount in smallest currency unit
  currency: 'ICP',
  description: 'Premium subscription',
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel'
});

// Redirect user to checkout
window.location.href = checkout.url;`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 4 */}
                <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3">Handle Webhooks</h3>
                      <p className="text-muted-foreground mb-4">
                        Set up webhook endpoints to receive payment notifications.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-mono">Node.js</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(`app.post('/webhook', (req, res) => {
  const event = req.body;
  
  if (event.type === 'payment.completed') {
    // Handle successful payment
    console.log('Payment completed:', event.data);
  }
  
  res.status(200).send('OK');
});`, 'webhook-handler')}
                          >
                            {copiedCode === 'webhook-handler' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <pre className="text-sm text-foreground overflow-x-auto">
                          <code>{`app.post('/webhook', (req, res) => {
  const event = req.body;
  
  if (event.type === 'payment.completed') {
    // Handle successful payment
    console.log('Payment completed:', event.data);
  }
  
  res.status(200).send('OK');
});`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Next Steps */}
              <div className="mt-12 text-center">
                <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-4">🎉 You're Ready to Go!</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    You've successfully integrated ckPayment. Now explore advanced features, 
                    customize your integration, or check out our comprehensive documentation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg">
                      <BookOpen className="h-5 w-5 mr-2" />
                      View Full Documentation
                    </Button>
                    <Button variant="outline" size="lg">
                      <Github className="h-5 w-5 mr-2" />
                      Browse Examples
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Section - Reduced background opacity */}
        <section className="py-20 bg-gradient-to-b from-transparent to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <BookOpen className="h-3 w-3 mr-1" />
                Developer Resources
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive documentation, examples, and tools to help you build amazing payment experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* API Documentation */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-blue-500/10 mb-3 group-hover:bg-blue-500/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">API Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete API reference with detailed endpoints, parameters, and response examples.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>REST API Reference</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Authentication Guide</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Error Handling</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View API Docs
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* SDK Documentation */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-green-500/10 mb-3 group-hover:bg-green-500/20 transition-colors">
                    <Code className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">SDK Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Language-specific guides and references for our official SDKs.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>JavaScript/TypeScript</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>React Components</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Node.js Server</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Browse SDKs
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Code Examples */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-purple-500/10 mb-3 group-hover:bg-purple-500/20 transition-colors">
                    <Github className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Code Examples</h3>
                  <p className="text-sm text-muted-foreground">
                    Ready-to-use code samples and complete integration examples.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Sample Applications</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Code Snippets</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Best Practices</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View Examples
                  <Github className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Tutorials */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-orange-500/10 mb-3 group-hover:bg-orange-500/20 transition-colors">
                    <Play className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step video guides to help you integrate ckPayment quickly.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Getting Started</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Advanced Features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Troubleshooting</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Watch Tutorials
                  <Play className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Testing Tools */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 mb-3 group-hover:bg-cyan-500/20 transition-colors">
                    <Zap className="h-6 w-6 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Testing Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Sandbox environment and testing utilities for safe development.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Sandbox Environment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Test Cards</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>API Testing</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Access Sandbox
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Community */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-pink-500/10 mb-3 group-hover:bg-pink-500/20 transition-colors">
                    <Users className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Developer Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with other developers, share experiences, and get help.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Discord Community</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>GitHub Discussions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Developer Blog</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Join Community
                  <Users className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            </div>

            {/* Featured Resource */}
            <div className="mt-12 max-w-4xl mx-auto">
              <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 backdrop-blur-sm">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Featured: Complete Integration Guide</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Our comprehensive guide covers everything from basic setup to advanced features. 
                    Perfect for developers who want to master ckPayment integration.
                  </p>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Read Complete Guide
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <MessageCircle className="h-3 w-3 mr-1" />
                Developer Support
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get Help When You Need It
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our dedicated support team is here to help you succeed with your ckPayment integration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
              {/* Live Chat */}
              <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="inline-flex p-4 rounded-2xl bg-green-500/10 mb-4 group-hover:bg-green-500/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Real-time support for urgent technical questions
                </p>
                <Badge variant="secondary" className="text-xs mb-4">24/7 Available</Badge>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Start Chat
                </Button>
              </Card>

              {/* Email Support */}
              <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Detailed technical assistance via email
                </p>
                <Badge variant="secondary" className="text-xs mb-4">&lt; 4h Response</Badge>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Send Email
                </Button>
              </Card>

              {/* Community Forum */}
              <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Community Forum</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect with other developers and share knowledge
                </p>
                <Badge variant="secondary" className="text-xs mb-4">50K+ Members</Badge>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Join Forum
                </Button>
              </Card>

              {/* Documentation */}
              <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="inline-flex p-4 rounded-2xl bg-orange-500/10 mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Help Center</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive guides and troubleshooting
                </p>
                <Badge variant="secondary" className="text-xs mb-4">Self-Service</Badge>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Browse Help
                </Button>
              </Card>
            </div>

            {/* Support Tiers */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8">Choose Your Support Level</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Community Support */}
                <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold mb-2">Community</h4>
                    <div className="text-3xl font-bold mb-2">Free</div>
                    <p className="text-sm text-muted-foreground">
                      Perfect for getting started and learning
                    </p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Community forum access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Documentation & guides</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Code examples</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Basic email support</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Card>

                {/* Developer Support */}
                <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/30 relative">
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold mb-2">Developer</h4>
                    <div className="text-3xl font-bold mb-2">$49<span className="text-lg font-normal">/month</span></div>
                    <p className="text-sm text-muted-foreground">
                      Enhanced support for active development
                    </p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Everything in Community</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority email support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Live chat support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Integration assistance</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    Upgrade to Developer
                  </Button>
                </Card>

                {/* Enterprise Support */}
                <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold mb-2">Enterprise</h4>
                    <div className="text-3xl font-bold mb-2">Custom</div>
                    <p className="text-sm text-muted-foreground">
                      Dedicated support for large-scale deployments
                    </p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Everything in Developer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Dedicated account manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Phone support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Custom integrations</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </Card>
              </div>
            </div>

            {/* Emergency Support */}
            <div className="mt-12 max-w-2xl mx-auto">
              <Card className="p-6 bg-gradient-to-r from-red-500/15 to-orange-500/15 border-red-500/20 backdrop-blur-sm">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-xl bg-red-500/10 mb-4">
                    <Zap className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Emergency Support</h3>
                  <p className="text-muted-foreground mb-4">
                    Critical production issues? Our emergency support team is available 24/7 
                    for Enterprise customers.
                  </p>
                  <Button variant="outline" className="border-red-500/30 text-red-600 hover:bg-red-500/10">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Emergency Support
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default StartBuilding;