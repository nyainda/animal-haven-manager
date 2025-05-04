
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      
      const movementStrength = 25;
      const bg = heroRef.current.querySelector('.hero-bg') as HTMLElement;
      
      if (bg) {
        bg.style.transform = `translate(${-x * movementStrength}px, ${-y * movementStrength}px)`;
      }
    };

    setIsVisible(true);
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Features list with animation delays
  const features = [
    { text: "Track and monitor all your animals in one place", delay: 0.8 },
    { text: "Comprehensive health records and history", delay: 1.0 },
    { text: "Task management and reminders", delay: 1.2 },
    { text: "Data-driven insights and reports", delay: 1.4 },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      ref={heroRef}
      className="relative overflow-hidden min-h-[100vh] flex items-center font-serif"
      style={{ opacity }}
    >
      {/* Background with enhanced parallax */}
      <div className="hero-bg absolute inset-0 transition-transform duration-200 ease-out">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background/90 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1280')] bg-cover bg-center opacity-20 scale-110"></div>
        
        {/* Enhanced decorative elements */}
        <motion.div 
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-70"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/3 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl opacity-50"
          animate={{ 
            scale: [1, 1.3, 1],
            y: [0, -30, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-70"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-20 pt-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column - Content */}
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.span 
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-medium text-sm rounded-full mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Smart Animal Management
            </motion.span>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              The Complete <span className="text-primary">Animal Management</span> Solution
            </motion.h1>
            
            <motion.p 
              className="text-xl text-foreground/80 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Agro-insight helps you track, manage, and care for your animals with powerful tools designed for farmers, veterinarians, and animal caretakers.
            </motion.p>

            {/* Feature list */}
            <motion.ul 
              className="mb-8 space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {features.map((feature, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-center gap-3 text-muted-foreground"
                  variants={item}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg">{feature.text}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="font-medium w-full sm:w-auto text-base px-8 py-6 h-auto group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="font-medium w-full sm:w-auto text-base px-8 py-6 h-auto">
                  Explore Features
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right column - Visual */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="relative">
              {/* Main image with glass effect */}
              <motion.div 
                className="glass rounded-2xl overflow-hidden shadow-xl border border-white/20"
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AspectRatio ratio={16/9}>
                  <img 
                    src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1280" 
                    alt="Dashboard preview" 
                    className="w-full h-full object-cover rounded-2xl opacity-95"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent rounded-2xl"></div>
              </motion.div>
              
              {/* Floating card 1 */}
              <motion.div 
                className="absolute -top-10 -left-10 bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border w-64"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: isVisible ? 0 : 20, opacity: isVisible ? 1 : 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Health Check</h3>
                    <p className="text-xs text-muted-foreground">All animals healthy</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating card 2 */}
              <motion.div 
                className="absolute -bottom-5 right-10 bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: isVisible ? 0 : -20, opacity: isVisible ? 1 : 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">156</div>
                  <div className="text-xs text-muted-foreground">Animals Tracked</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div 
        className="hidden md:block absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isVisible ? 0.8 : 0, y: isVisible ? 0 : -10 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        <Link to="#features" className="flex flex-col items-center text-sm text-foreground/60 hover:text-foreground transition-colors">
          <span className="mb-2">Scroll to explore</span>
          <motion.div 
            className="w-8 h-12 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <div className="w-1.5 h-3 bg-foreground/50 rounded-full"></div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Hero;
