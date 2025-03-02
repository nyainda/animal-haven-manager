import React from 'react';
import { Heart, Dog, List, FileText, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import Button from '@/components/Button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <section id="features" className="section-padding py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage your animals
            </h2>
            <p className="text-foreground/70 text-lg">
              Our comprehensive platform provides all the tools you need to track, monitor, and care for your animals in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Dog} 
              title="Track Animals" 
              description="Keep detailed records of all your animals, including photos, medical history, and important milestones."
              className="animate-fade-in animation-delay-100"
            />
            <FeatureCard 
              icon={Heart} 
              title="Health Monitoring" 
              description="Monitor the health status of each animal, set reminders for checkups, and track medication schedules."
              className="animate-fade-in animation-delay-200"
            />
            <FeatureCard 
              icon={List} 
              title="Easy Dashboard" 
              description="View all important information at a glance with our intuitive and user-friendly dashboard."
              className="animate-fade-in animation-delay-300"
            />
            <FeatureCard 
              icon={FileText} 
              title="Detailed Reports" 
              description="Generate comprehensive reports on animal health, status, and care history with just a few clicks."
              className="animate-fade-in animation-delay-400"
            />
            <FeatureCard 
              icon={Clock} 
              title="Reminders & Alerts" 
              description="Never miss an important date with customizable reminders for vaccinations, checkups, and more."
              className="animate-fade-in animation-delay-500"
            />
            <FeatureCard 
              icon={Activity} 
              title="Health Analytics" 
              description="Track trends in animal health and wellness with detailed analytics and visualizations."
              className="animate-fade-in animation-delay-600"
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="section-padding bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What our users say
            </h2>
            <p className="text-foreground/70 text-lg">
              Join thousands of satisfied animal caretakers who have transformed their management process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="I've been using Animal Manager for 6 months now, and it has completely transformed how I care for my sanctuary animals. The health tracking is invaluable!"
              author="Jane Cooper"
              role="Animal Sanctuary Owner"
              delay={100}
            />
            <TestimonialCard 
              quote="As a veterinarian, I recommend Animal Manager to all my clients. It helps them stay organized and ensures no important health checkups are missed."
              author="Robert Fox"
              role="Veterinarian"
              delay={200}
            />
            <TestimonialCard 
              quote="The dashboard gives me a complete overview of all my farm animals at a glance. I can't imagine managing without it now."
              author="Sarah Johnson"
              role="Farm Manager"
              delay={300}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to transform your animal management?
            </h2>
            <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join thousands of animal caretakers who trust our platform for their daily management needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg">Get Started Today</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold mb-4 md:mb-0">
              Animal Manager
            </div>
            
            <div className="flex space-x-8 mb-4 md:mb-0">
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#testimonials">Testimonials</FooterLink>
              <FooterLink href="/login">Sign In</FooterLink>
              <FooterLink href="/register">Register</FooterLink>
            </div>
            
            <div className="flex space-x-4">
              <SocialIcon href="#" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </SocialIcon>
              <SocialIcon href="#" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </SocialIcon>
              <SocialIcon href="#" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </SocialIcon>
            </div>
          </div>
          
          <div className="border-t border-border/30 mt-8 pt-8 text-center text-sm text-foreground/60">
            <p>© {new Date().getFullYear()} Animal Manager. All rights reserved.</p>
            <p className="mt-2">
              <Link to="#" className="underline hover:text-foreground">Privacy Policy</Link>
              {' · '}
              <Link to="#" className="underline hover:text-foreground">Terms of Service</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ quote: string; author: string; role: string; delay: number }> = ({ 
  quote, author, role, delay 
}) => {
  return (
    <div 
      className={`bg-white p-6 rounded-2xl shadow-sm animate-fade-in animation-delay-${delay}`}
    >
      <svg 
        className="w-10 h-10 text-primary/20 mb-4" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M10 11h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2.667-1.333 4.333-4 5"></path>
        <path d="M19 11h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2.667-1.333 4.333-4 5"></path>
      </svg>
      
      <p className="mb-4 text-foreground/80">{quote}</p>
      
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
          <span className="text-primary font-medium">{author.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-medium">{author}</h4>
          <p className="text-sm text-foreground/60">{role}</p>
        </div>
      </div>
    </div>
  );
};

// Footer Link Component
const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  return (
    <a 
      href={href} 
      className="text-foreground/60 hover:text-foreground transition-colors duration-200"
    >
      {children}
    </a>
  );
};

// Social Icon Component
const SocialIcon: React.FC<{ href: string; 'aria-label': string; children: React.ReactNode }> = ({ 
  href, 'aria-label': ariaLabel, children 
}) => {
  return (
    <a 
      href={href}
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/10 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors duration-200"
    >
      {children}
    </a>
  );
};

export default Index;
