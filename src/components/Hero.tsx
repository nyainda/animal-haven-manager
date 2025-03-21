
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      
      const movementStrength = 20;
      const bg = heroRef.current.querySelector('.hero-bg') as HTMLElement;
      
      if (bg) {
        bg.style.transform = `translate(${-x * movementStrength}px, ${-y * movementStrength}px)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative overflow-hidden min-h-screen flex items-center justify-center pt-24 pb-16 font-serif text-sm"
    >
      {/* Background with subtle parallax */}
      <div className="hero-bg absolute inset-0 transition-transform duration-200 ease-out">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/90 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 scale-110"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-70 animate-spin-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in text-balance mb-6">
            Your Ultimate Animal Management Solution
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 animate-fade-in animation-delay-200 text-balance">
            Track, care, and organize your animals with ease. The most intuitive platform for animal caretakers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-300">
            <Link to="/register">
              <Button size="lg" className="font-medium">
                Get Started
              </Button>
            </Link>
            
            <a href="#features">
              <Button variant="outline" size="lg" className="font-medium">
                Learn More
              </Button>
            </a>
          </div>
          
          {/* Scroll indicator */}
          <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce opacity-80">
            <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-foreground/40 rounded-full animate-pulse-gentle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
