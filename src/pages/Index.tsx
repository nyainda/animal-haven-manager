<<<<<<< HEAD
import React from 'react';
import { Heart, Dog, List, FileText, Clock, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import Button from '@/components/Button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-serif text-foreground">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Everything you need to manage your animals
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              Our comprehensive platform provides all the tools you need to track, monitor, and care for your animals in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Dog}
              title="Track Animals"
              description="Keep detailed records of all your animals, including photos, medical history, and important milestones."
              className="animate-fade-in animation-delay-100 hover:shadow-lg transition-shadow duration-300"
            />
            <FeatureCard
              icon={Heart}
              title="Health Monitoring"
              description="Monitor the health status of each animal, set reminders for checkups, and track medication schedules."
              className="animate-fade-in animation-delay-200 hover:shadow-lg transition-shadow duration-300"
            />
            <FeatureCard
              icon={List}
              title="Easy Dashboard"
              description="View all important information at a glance with our intuitive and user-friendly dashboard."
              className="animate-fade-in animation-delay-300 hover:shadow-lg transition-shadow duration-300"
            />
            <FeatureCard
              icon={FileText}
              title="Detailed Reports"
              description="Generate comprehensive reports on animal health, status, and care history with just a few clicks."
              className="animate-fade-in animation-delay-400 hover:shadow-lg transition-shadow duration-300"
            />
            <FeatureCard
              icon={Clock}
              title="Reminders & Alerts"
              description="Never miss an important date with customizable reminders for vaccinations, checkups, and more."
              className="animate-fade-in animation-delay-500 hover:shadow-lg transition-shadow duration-300"
            />
            <FeatureCard
              icon={Activity}
              title="Health Analytics"
              description="Track trends in animal health and wellness with detailed analytics and visualizations."
              className="animate-fade-in animation-delay-600 hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              What our users say
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
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

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="5,000+" label="Animals Tracked" />
            <StatCard number="1,200+" label="Happy Users" />
            <StatCard number="98%" label="Satisfaction Rate" />
            <StatCard number="24/7" label="Customer Support" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
              Ready to transform your animal management?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of animal caretakers who trust our platform for their daily management needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/register">
                <Button size="lg" className="px-8 py-3 text-lg flex items-center gap-2 group">
                  Get Started Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-bold mb-6 text-foreground">Agro-insight</div>
              <p className="text-muted-foreground mb-6">
                Transforming animal management for farms, sanctuaries, and veterinary practices.
              </p>
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

            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Product</h4>
              <ul className="space-y-4">
                <li><FooterLink href="#features">Features</FooterLink></li>
                <li><FooterLink href="#pricing">Pricing</FooterLink></li>
                <li><FooterLink href="#integrations">Integrations</FooterLink></li>
                <li><FooterLink href="#releases">Release Notes</FooterLink></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Resources</h4>
              <ul className="space-y-4">
                <li><FooterLink href="#blog">Blog</FooterLink></li>
                <li><FooterLink href="#guides">User Guides</FooterLink></li>
                <li><FooterLink href="#webinars">Webinars</FooterLink></li>
                <li><FooterLink href="#community">Community</FooterLink></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Company</h4>
              <ul className="space-y-4">
                <li><FooterLink href="#about">About Us</FooterLink></li>
                <li><FooterLink href="#testimonials">Testimonials</FooterLink></li>
                <li><FooterLink href="#contact">Contact</FooterLink></li>
                <li><FooterLink href="#careers">Careers</FooterLink></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Agro-insight. All rights reserved.</p>
            <p className="mt-4 flex justify-center space-x-6">
              <Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Cookie Policy</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role, delay }) => {
  return (
    <div
      className={`bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-lg transition-shadow duration-300 animate-fade-in animation-delay-${delay}`}
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

      <p className="mb-4 text-muted-foreground text-lg italic">{quote}</p>

      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          <span className="text-primary font-medium text-lg">{author.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-medium text-foreground">{author}</h4>
          <p className="text-muted-foreground text-sm">{role}</p>
        </div>
=======
// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
>>>>>>> new-origin/main
      </div>
    </div>
  );
};

<<<<<<< HEAD
// Stats Card Component
const StatCard = ({ number, label }) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-center hover:shadow-lg transition-shadow duration-300">
      <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{number}</p>
      <p className="text-muted-foreground font-medium">{label}</p>
    </div>
  );
};

// Footer Link Component
const FooterLink = ({ href, children }) => {
  return (
    <a
      href={href}
      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
    >
      {children}
    </a>
  );
};

// Social Icon Component
const SocialIcon = ({ href, 'aria-label': ariaLabel, children }) => {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all duration-300"
    >
      {children}
    </a>
  );
};

export default Index;
=======
export default Index;
>>>>>>> new-origin/main
