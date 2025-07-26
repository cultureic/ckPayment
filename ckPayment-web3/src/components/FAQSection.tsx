import { useState, useRef, useEffect } from 'react';
import { Search, HelpCircle, ChevronDown, Link as LinkIcon, Link2Off } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const faqs = [
    {
      question: "How does ckPayment ensure 100% uptime?",
      answer: "ckPayment runs entirely on the Internet Computer Protocol (ICP), which means it's hosted on a decentralized network of nodes. This eliminates single points of failure, ensuring continuous operation without any downtime."
    },
    {
      question: "What makes ckPayment different from traditional payment processors?",
      answer: "Unlike traditional processors that rely on centralized servers, ckPayment is fully on-chain. This means no intermediaries, lower fees, and complete transparency for all transactions."
    },
    {
      question: "How secure are transactions with ckPayment?",
      answer: "Every transaction is secured by blockchain technology, providing cryptographic proof of all activities. The decentralized nature of ICP ensures that there's no central point vulnerable to attacks."
    },
    {
      question: "Can I integrate ckPayment with my existing dApp?",
      answer: "Absolutely! ckPayment is designed for easy integration with any dApp on the Internet Computer. Our documentation provides simple steps to get started in minutes."
    },
    {
      question: "What are the transaction fees?",
      answer: "ckPayment operates on a pay-per-use model with minimal fees that are significantly lower than traditional payment processors, thanks to the efficiency of the Internet Computer blockchain."
    },
    {
      question: "How does the decentralized architecture benefit me?",
      answer: "Decentralization means no single entity controls the network, ensuring your payment system remains operational 24/7 without risk of censorship or service interruption."
    },
    {
      question: "What cryptocurrencies does ckPayment support?",
      answer: "ckPayment supports a range of cryptocurrencies within the ICP ecosystem, making it compatible with both native and cross-chain assets. These include: ICP (the native token of the Internet Computer), ckBTC (a Bitcoin variant on ICP), ckETH (an Ethereum variant on ICP), and USDC (upcoming). This selection ensures compatibility with major blockchain networks while leveraging ICP's infrastructure for efficiency."
    },
    {
      question: "Is ckPayment quantum-resistant or future-proof against emerging threats?",
      answer: "ckPayment, built on the Internet Computer Protocol (ICP), is poised to benefit from ICP's efforts to adopt post-quantum cryptography. While specific quantum-resistance features of ckPayment aren't explicitly detailed, its reliance on ICP suggests it will inherit these advancements, positioning it as potentially future-proof against emerging threats like quantum attacks."
    },
    {
      question: "How does ckPayment ensure compliance with regulations (e.g., KYC/AML)?",
      answer: "ckPayment adheres to Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations to operate legally across over 200 countries. This includes identity verification for users to meet KYC standards and transaction monitoring for AML compliance. The platform is also working towards PCI DSS compliance, demonstrating its commitment to regulatory alignment while maintaining its Web3 framework."
    },
    {
      question: "What happens if there's a dispute or I need a refund?",
      answer: "In ckPayment's decentralized setup, dispute resolution and refunds are handled differently from traditional systems. The platform utilizes smart contracts to automate transaction terms and conditions, and may employ escrow services to hold funds until disputes are resolved. The process might involve decentralized governance or community arbitration, so users should review transaction terms carefully as the process may differ from centralized payment platforms."
    },
    {
      question: "How does ckPayment support cross-chain transactions?",
      answer: "ckPayment enables seamless cross-chain transactions through its integration with ckBTC and ckETH, which connect to Bitcoin and Ethereum networks directly on ICP. This is achieved via chain-key cryptography, allowing ICP smart contracts to interact with raw Bitcoin and Ethereum assets without requiring traditional bridges. The result is fast finality with transactions settling in 1-2 seconds with minimal costs."
    },
    {
      question: "Where can I find API documentation and developer resources?",
      answer: "As an open-source project, ckPayment provides comprehensive developer resources including API documentation, SDK references, and code examples. These resources are available on the project's GitHub repository (github.com/cultureic/ckPayment) and through the official website's developer portal, which includes guides and tutorials for integration."
    },
    {
      question: "Can ckPayment be used for fiat conversions or hybrid Web2/Web3 payments?",
      answer: "While ckPayment primarily focuses on cryptocurrency payments, it supports fiat conversions and hybrid Web2/Web3 payments through third-party integrations. These integrations can convert crypto payments to fiat for merchants, bridging the gap between traditional finance and blockchain-based transactions."
    },
    {
      question: "What kind of customer support does ckPayment offer?",
      answer: "ckPayment offers a community-driven support model typical of Web3 projects. This includes community forums for peer-to-peer assistance, GitHub issues for technical support and bug reporting, and potentially direct support channels for key users. The platform also provides comprehensive self-service documentation to help users find answers to common questions."
    },
    {
      question: "Are there any limitations or known issues with ckPayment?",
      answer: "As with any decentralized payment system, ckPayment has certain considerations: users should be aware of cryptocurrency price volatility, the need for compatible wallets, and varying regulatory requirements across different jurisdictions. Additionally, as a developing platform, some features might be in beta or experimental stages. These factors should be considered when evaluating ckPayment for specific use cases."
    }
  ];

  // Filter FAQs based on search term
  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Focus search input on component mount
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search FAQs..."
              className="w-full pl-12 pr-6 py-3 rounded-full border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search frequently asked questions"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <motion.div 
                key={index}
                className="border border-border/30 rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  className={`w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none ${
                    expandedIndex === index ? 'bg-gradient-to-r from-primary/5 to-accent/5' : 'hover:bg-muted/20'
                  } transition-all`}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={expandedIndex === index}
                  aria-controls={`faq-${index}`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        expandedIndex === index 
                          ? 'bg-gradient-to-br from-primary to-accent text-white' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <HelpCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      {faq.question}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      id={`faq-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: 'auto', 
                        opacity: 1,
                        transition: { 
                          height: { duration: 0.3, ease: 'easeInOut' },
                          opacity: { duration: 0.2, delay: 0.1 }
                        }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: { 
                          opacity: { duration: 0.1 },
                          height: { duration: 0.2 }
                        }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="relative">
                          <div className="absolute -left-12 top-0">
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link2Off className="h-4 w-4 text-green-500" />
                              <Link2Off className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                          <p className="text-muted-foreground pl-6 border-l-2 border-primary/20">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{' '}
            <a 
              href="mailto:support@ckpayment.xyz" 
              className="text-primary hover:underline"
            >
              Contact our support
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
