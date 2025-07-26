import { Twitter, Github, MessageCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";

const socialLinks = [
  {
    name: 'GitHub',
    icon: <Github className="h-5 w-5" />,
    url: 'https://github.com/cultureic/ckPayment',
    color: 'hover:text-gray-800 dark:hover:text-gray-200',
    bg: 'hover:bg-gray-100 dark:hover:bg-gray-800'
  },
  {
    name: 'Twitter',
    icon: <Twitter className="h-5 w-5" />,
    url: 'https://x.com/ckPayment',
    color: 'hover:text-blue-400',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
  },
  {
    name: 'Discord',
    icon: <MessageCircle className="h-5 w-5" />,
    url: '#',
    color: 'hover:text-indigo-500',
    bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
  }
];

const Footer = () => {
  return (
    <footer id="community" className="bg-background border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-10">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-full transition-all duration-300 ${link.bg} ${link.color} group relative overflow-hidden`}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.1 * index,
                    duration: 0.5 
                  } 
                }}
              >
                <span className="relative z-10">
                  {link.icon}
                </span>
                <span className="sr-only">{link.name}</span>
                <span className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </motion.a>
            ))}
          </div>

          {/* Built with love */}
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.3, duration: 0.5 }
            }}
          >
            <span className="text-muted-foreground">Built with</span>
            <motion.span 
              className="text-red-500"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatDelay: 2,
                duration: 1.5 
              }}
            >
              <Heart className="h-4 w-4 inline" fill="currentColor" />
            </motion.span>
            <span className="text-muted-foreground">on the Internet Computer</span>
          </motion.div>

          {/* Copyright */}
          <motion.p 
            className="text-sm text-muted-foreground text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.4, duration: 0.5 }
            }}
          >
            © {new Date().getFullYear()} ckPayment. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;