import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  GraduationCap,
  BookOpen,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  ExternalLink,
  Download,
  Github,
  Smartphone,
  Monitor,
  Wallet,
  Lock,
  Package,
  Truck,
  Star,
  DollarSign,
  Clock,
  Target,
  Sparkles,
  Rocket,
  Code,
  Settings,
  PieChart,
  Repeat,
  Calculator,
  LineChart,
  Activity,
  Layers,
  Database,
  Network,
  Banknote,
  Percent,
  Crown,
  Award,
  Gem,
  Camera,
  Brush,
  Music,
  Video,
  FileImage,
  Heart,
  TrendingUp,
  Eye,
  Share2,
  Gift,
  Brain,
  School,
  Library,
  Lightbulb,
  FileText,
  Headphones,
  PlayCircle,
  UserCheck,
  Trophy,
  Coins
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

const Education = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const stats = [
    { value: "60%", label: "Global Reach", icon: Globe, color: "text-indigo-500" },
    { value: "95%", label: "Instant Payouts", icon: Zap, color: "text-blue-500" },
    { value: "0.1¢", label: "Micropayment Cost", icon: Coins, color: "text-indigo-600" },
    { value: "24/7", label: "Access Anywhere", icon: Clock, color: "text-blue-600" }
  ];

  const educationFeatures = [
    {
      icon: Coins,
      title: "Micropayments for Content",
      description: "Enable pay-per-lesson, chapter, or resource with ultra-low transaction costs",
      benefits: [
        "Pay-per-lesson access",
        "Granular content pricing",
        "No minimum payment limits",
        "Instant content unlocking"
      ],
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      icon: Globe,
      title: "Global Student Access",
      description: "Remove payment barriers for students worldwide with universal payment methods",
      benefits: [
        "No geographic restrictions",
        "Multi-currency support",
        "Local payment methods",
        "Reduced payment friction"
      ],
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Zap,
      title: "Instant Instructor Payouts",
      description: "Educators receive payments immediately when students access their content",
      benefits: [
        "Real-time revenue sharing",
        "Automated payouts",
        "Transparent earnings",
        "No payment delays"
      ],
      color: "from-indigo-600 to-blue-400",
      bgColor: "bg-indigo-600/10"
    },
    {
      icon: Award,
      title: "Credential Verification",
      description: "Issue tamper-proof certificates and credentials on the blockchain",
      benefits: [
        "Blockchain-verified certificates",
        "Employer verification tools",
        "Skill badge systems",
        "Academic record keeping"
      ],
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-400/10"
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Setup Education SDK",
      description: "Initialize the ckPayment education platform with your learning management system",
      code: `npm install @ckpayment/education
// Initialize your learning platform
import { ckEducation } from '@ckpayment/education';

ckEducation.init({
  platformId: 'your-platform-id',
  paymentMethods: ['ICP', 'ckBTC', 'ckETH'],
  micropayments: true,
  certificates: true
});`,
      time: "5 minutes"
    },
    {
      step: 2,
      title: "Create Course Structure",
      description: "Set up courses with flexible pricing models and content access controls",
      code: `// Create a new course with micropayments
const course = await ckEducation.createCourse({
  title: 'Web3 Development Fundamentals',
  instructor: 'instructor-wallet',
  pricing: {
    model: 'pay-per-lesson',
    lessonPrice: 0.1, // $0.10 per lesson
    fullCoursePrice: 2.5 // $2.50 for full access
  },
  certification: true
});`,
      time: "10 minutes"
    },
    {
      step: 3,
      title: "Enable Student Enrollment",
      description: "Allow students to enroll and access content with seamless payments",
      code: `// Enable student enrollment and payments
const enrollment = await ckEducation.enableEnrollment({
  courseId: course.id,
  accessControl: 'progressive', // Unlock as paid
  paymentOptions: ['single-lesson', 'full-course'],
  certificateIssuing: true,
  instructorRevenue: 85 // 85% to instructor
});`,
      time: "8 minutes"
    }
  ];

  const useCases = [
    {
      title: "Online Courses",
      description: "Comprehensive learning programs with structured curriculum",
      icon: BookOpen,
      examples: ["Programming bootcamps", "Language learning", "Professional skills", "Academic subjects"]
    },
    {
      title: "Skill Certifications",
      description: "Professional certifications and skill validation programs",
      icon: Award,
      examples: ["Tech certifications", "Industry credentials", "Skill assessments", "Professional badges"]
    },
    {
      title: "Educational Content",
      description: "Individual lessons, tutorials, and learning resources",
      icon: PlayCircle,
      examples: ["Video tutorials", "Interactive lessons", "Study materials", "Practice exercises"]
    },
    {
      title: "Academic Institutions",
      description: "Universities and schools with digital learning programs",
      icon: School,
      examples: ["University courses", "K-12 programs", "Research access", "Library resources"]
    }
  ];

  const competitiveAdvantages = [
    {
      traditional: "High payment processing fees",
      ckPayment: "0.1¢ micropayment fees",
      icon: DollarSign,
      improvement: "99% cost reduction"
    },
    {
      traditional: "Geographic payment barriers",
      ckPayment: "Global accessibility",
      icon: Globe,
      improvement: "Unlimited reach"
    },
    {
      traditional: "Delayed instructor payments",
      ckPayment: "Instant payouts",
      icon: Zap,
      improvement: "Real-time revenue"
    },
    {
      traditional: "Paper certificates",
      ckPayment: "Blockchain verification",
      icon: Award,
      improvement: "Tamper-proof credentials"
    }
  ];

  const platformTypes = [
    {
      name: "MOOC Platform",
      type: "Massive Open Online Courses",
      focus: "Large-scale online education",
      features: ["Unlimited enrollment", "Global accessibility", "Peer interaction"]
    },
    {
      name: "Skill Academy",
      type: "Professional Development",
      focus: "Career-focused training",
      features: ["Industry certifications", "Job placement", "Employer partnerships"]
    },
    {
      name: "Tutoring Hub",
      type: "One-on-One Learning",
      focus: "Personalized instruction",
      features: ["Live sessions", "Custom curriculum", "Progress tracking"]
    },
    {
      name: "Corporate Training",
      type: "Enterprise Learning",
      focus: "Employee development",
      features: ["Team management", "Progress analytics", "Compliance tracking"]
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Education Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay with indigo/blue tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-background/20 to-blue-500/5 pointer-events-none" style={{ zIndex: 5 }} />
      
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-lg sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/42dcfff0-6a9c-4d69-908b-9729c5f9000b.png" 
                alt="ckPayment Logo" 
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-indigo-500/5 to-blue-500/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 border-indigo-500/30 text-indigo-600 bg-indigo-500/5 backdrop-blur-sm">
              <GraduationCap className="h-3 w-3 mr-1" />
              Education Solutions
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Democratize{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Learning
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Enable global access to education with micropayments, instant instructor payouts, 
              and blockchain-verified credentials that work anywhere in the world.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
                    <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Teaching
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Education Guide
              </Button>
            </div>
          </div>
        </div>
      </section>      {/* 
Education Features */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern Education</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, monetize, and scale educational content globally
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {educationFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Integration Steps */}
      <section className="py-20 bg-gradient-to-r from-indigo-500/5 via-background/90 to-blue-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-600">
              <Code className="h-3 w-3 mr-1" />
              Quick Setup
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Launch Your Learning Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your educational platform running in under 25 minutes with our education SDK
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {integrationSteps.map((step, index) => (
              <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {step.time}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  <div className="bg-muted/10 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(step.code, `step-${index}`)}
                      className="absolute top-2 right-2 p-2 rounded-md hover:bg-muted/20 transition-colors"
                    >
                      <ArrowRight className={`h-4 w-4 ${copiedCode === `step-${index}` ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                    </button>
                    <pre className="text-sm font-mono text-foreground overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Target className="h-3 w-3 mr-1" />
              Education Categories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Every Learning Model</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From individual courses to institutional programs, support all types of education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="p-3 rounded-xl bg-blue-500/10 inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx}>• {example}</li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Types */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 via-background/90 to-indigo-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-600">
              <Database className="h-3 w-3 mr-1" />
              Platform Templates
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Education Model</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pre-built templates for different types of educational platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {platformTypes.map((platform, index) => (
              <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="font-bold text-lg mb-1">{platform.name}</h3>
                <Badge variant="secondary" className="mb-2 text-xs">
                  {platform.type}
                </Badge>
                <p className="text-sm text-muted-foreground mb-3">{platform.focus}</p>
                <div className="space-y-1">
                  {platform.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      • {feature}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              Why Choose ckPayment for Education?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Global Education</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment removes barriers to education compared to traditional platforms
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-muted-foreground">Traditional Education</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.traditional}</p>
                    </div>
                    
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                      <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                        {advantage.improvement}
                      </Badge>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <span className="font-medium text-indigo-600">ckPayment Education</span>
                        <IconComponent className="h-6 w-6 text-indigo-500" />
                      </div>
                      <p className="text-sm font-medium text-indigo-600">{advantage.ckPayment}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-indigo-600/10 border-indigo-500/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Transform Education?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Launch Your Learning Platform Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join educators worldwide who are using ckPayment to make quality education 
                accessible to everyone, everywhere, with fair economics for all.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600">
                  <GraduationCap className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Teaching
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10">
                  <Settings className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group text-indigo-600 hover:bg-indigo-500/10">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Coins className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-500 flex-shrink-0" />
                  <span>Micropayments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-3 sm:h-4 w-3 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>Global Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-600 flex-shrink-0" />
                  <span>Instant Payouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 flex-shrink-0" />
                  <span>Verified Credentials</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Education;