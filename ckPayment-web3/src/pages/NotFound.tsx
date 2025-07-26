import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const numberVariants: Variants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navbar />
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="mb-8"
            variants={numberVariants}
          >
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent leading-none">
              404
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl">
              <CardContent className="p-8">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
                  variants={itemVariants}
                >
                  Página No Encontrada
                </motion.h2>
                
                <motion.p 
                  className="text-lg text-muted-foreground mb-2"
                  variants={itemVariants}
                >
                  Lo sentimos, la página que buscas no existe.
                </motion.p>
                
                <motion.p 
                  className="text-sm text-muted-foreground/70 mb-8 font-mono bg-muted/30 rounded px-3 py-2 inline-block"
                  variants={itemVariants}
                >
                  Ruta solicitada: <span className="text-destructive">{location.pathname}</span>
                </motion.p>

                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  variants={itemVariants}
                >
                  <Button asChild size="lg" className="group">
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Ir al Inicio
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="group">
                    <button onClick={() => window.history.back()}>
                      <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      Volver Atrás
                    </button>
                  </Button>
                  
                  <Button asChild variant="ghost" size="lg" className="group">
                    <Link to="/features">
                      <Search className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Explorar Características
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="mt-8 text-center"
            variants={itemVariants}
          >
            <p className="text-sm text-muted-foreground">
              ¿Necesitas ayuda? Visita nuestra{" "}
              <Link to="/" className="text-primary hover:underline font-medium">
                página principal
              </Link>{" "}
              o explora nuestras{" "}
              <Link to="/features" className="text-primary hover:underline font-medium">
                características
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
