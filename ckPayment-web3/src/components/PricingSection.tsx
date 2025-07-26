import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, BarChart, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [activeTab, setActiveTab] = useState('startup');

  const pricingPlans = [
    {
      id: 'startup',
      name: 'Startup',
      tagline: 'Perfect for early-stage projects',
      price: {
        monthly: '0.5%',
        annually: '0.4%',
      },
      description: 'For projects just getting started with Web3 payments',
      features: [
        'Up to $10K in monthly volume',
        '1,000 transactions/month',
        'Basic support',
        'Standard settlement (24h)',
        'Email support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      id: 'business',
      name: 'Business',
      tagline: 'For growing businesses',
      price: {
        monthly: '0.3%',
        annually: '0.25%',
      },
      description: 'For businesses scaling their Web3 operations',
      features: [
        'Up to $100K in monthly volume',
        '10,000 transactions/month',
        'Priority support',
        'Faster settlement (1h)',
        'Dedicated account manager',
        'Advanced analytics',
      ],
      cta: 'Start Business Plan',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'Custom solutions',
      price: {
        custom: 'Custom',
      },
      description: 'For enterprises with custom requirements',
      features: [
        'Unlimited volume',
        'Custom transaction limits',
        '24/7 dedicated support',
        'Instant settlement',
        'Custom integrations',
        'SLA & compliance',
        'Custom smart contracts',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const comparisonData = [
    {
      feature: 'Transaction Fee',
      ckPayment: '0.1% - 0.5%',
      stripe: '2.9% + 30¢',
      paypal: '3.49% + 49¢',
      highlight: true,
    },
    {
      feature: 'Settlement Time',
      ckPayment: 'Instant - 24h',
      stripe: '2-7 days',
      paypal: '1-3 days',
      highlight: false,
    },
    {
      feature: 'Chargebacks',
      ckPayment: 'None',
      stripe: 'Yes',
      paypal: 'Yes',
      highlight: true,
    },
    {
      feature: 'Cross-border Fees',
      ckPayment: '0%',
      stripe: '1.5%',
      paypal: '1.5%',
      highlight: false,
    },
    {
      feature: 'Minimum Payout',
      ckPayment: 'None',
      stripe: '$1',
      paypal: '$1',
      highlight: true,
    },
    {
      feature: 'Smart Contract Support',
      ckPayment: 'Native',
      stripe: 'Limited',
      paypal: 'No',
      highlight: false,
    },
  ];

  const blockchainFees = [
    {
      name: 'ICP Transaction',
      description: 'Base fee for on-chain operations',
      fee: '0.0001 ICP',
      frequency: 'Per transaction',
    },
    {
      name: 'Smart Contract Execution',
      description: 'For complex operations',
      fee: '0.0005 - 0.001 ICP',
      frequency: 'Per execution',
    },
    {
      name: 'Data Storage',
      description: 'For storing payment data',
      fee: '0.01 ICP/MB',
      frequency: 'Per month',
    },
  ];

  const calculateSavings = (amount: number) => {
    const stripeFee = amount * 0.029 + 0.3; // 2.9% + 30¢
    const ckPaymentFee = amount * 0.003; // 0.3% average
    return (stripeFee - ckPaymentFee).toFixed(2);
  };

  const [amount, setAmount] = useState('1000');
  const savings = calculateSavings(Number(amount));

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simple, Predictable
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Web3 Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pay only for what you use with our transparent, usage-based pricing. 
            No hidden fees, no surprises.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-muted/50 p-1 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${billingCycle === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${billingCycle === 'annually' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Annual Billing
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-medium rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <Card className={`h-full overflow-hidden transition-all duration-300 ${plan.popular ? 'border-2 border-primary' : 'border-border/30'}`}>
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="p-8 border-b border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      {plan.popular && <Sparkles className="h-5 w-5 text-yellow-500" />}
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">{plan.tagline}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">
                          {plan.id === 'enterprise' ? 'Custom' : `$${plan.price[billingCycle]}`}
                        </span>
                        {plan.id !== 'enterprise' && (
                          <span className="ml-2 text-muted-foreground">
                            per transaction
                          </span>
                        )}
                      </div>
                      {billingCycle === 'annually' && plan.id !== 'enterprise' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Billed annually, save 20%
                        </p>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' : ''}`}
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="p-6 pt-4 bg-muted/5">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">FEATURES</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Cost Comparison Calculator */}
        <div className="bg-muted/20 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              How Much Could You Save?
            </h3>
            <p className="text-muted-foreground">
              Compare ckPayment with traditional payment processors
            </p>
          </div>
          
          <div className="max-w-lg mx-auto mb-8">
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-2">
                Monthly Payment Volume
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-foreground/50">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-8 pr-4 py-3 bg-background border border-border/30 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="1000"
                  min="0"
                  step="100"
                />
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-6 border border-border/30">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">With ckPayment</div>
                  <div className="text-2xl font-bold text-foreground">
                    ${(Number(amount) * 0.003).toFixed(2)}/mo
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    0.3% transaction fee
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">With Stripe</div>
                  <div className="text-2xl font-bold text-foreground">
                    ${(Number(amount) * 0.029 + 0.3).toFixed(2)}/mo
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    2.9% + 30¢ per transaction
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border/20">
                <div className="text-sm text-muted-foreground mb-2">
                  You save with ckPayment
                </div>
                <div className="text-2xl font-bold text-green-500">
                  ${savings}/mo
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  That's ${(Number(savings) * 12).toFixed(0)} per year!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Compare Payment Solutions
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left pb-4 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center pb-4 font-medium">ckPayment</th>
                  <th className="text-center pb-4 font-medium text-muted-foreground">Stripe</th>
                  <th className="text-center pb-4 font-medium text-muted-foreground">PayPal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {comparisonData.map((row, index) => (
                  <tr key={index} className={row.highlight ? 'bg-muted/10' : ''}>
                    <td className="py-4 font-medium">{row.feature}</td>
                    <td className="text-center py-4 font-medium text-primary">
                      {row.ckPayment}
                    </td>
                    <td className="text-center py-4 text-muted-foreground">
                      {row.stripe}
                    </td>
                    <td className="text-center py-4 text-muted-foreground">
                      {row.paypal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blockchain Fees */}
        <div className="bg-muted/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Transparent Blockchain Fees
            </h3>
            <p className="text-muted-foreground">
              No hidden costs - here's exactly what you'll pay in blockchain fees
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {blockchainFees.map((fee, index) => (
              <Card key={index} className="bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {fee.name}
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {fee.fee}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {fee.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {fee.frequency}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              * All fees are paid in ICP and may vary slightly based on network conditions.
              Actual fees are calculated at the time of the transaction.
            </p>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Need Custom Pricing?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our enterprise plans offer custom pricing, volume discounts, and dedicated support 
            for high-volume merchants and unique use cases.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
