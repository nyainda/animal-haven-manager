
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center relative">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-secondary/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-4 z-10"
        >
          <div className="bg-card border border-border shadow-xl rounded-2xl overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 text-center">
              <div className="mx-auto bg-card/80 backdrop-blur-sm rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4 shadow-lg border border-border">
                <LogIn className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-foreground/70 mt-1">Sign in to your account</p>
            </div>
            
            {/* Form body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Password
                    </Label>
                    <Link 
                      to="/forgot-password"
                      className="text-primary hover:text-primary/80 transition-colors text-xs font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Your password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-background/50"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-2"
                >
                  <Button 
                    type="submit" 
                    className="w-full font-semibold"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        Signing in...
                      </span> 
                      : 
                      <span className="flex items-center justify-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </span>
                    }
                  </Button>
                </motion.div>
              </form>
              
              <div className="mt-6 text-center">
                <span className="text-foreground/70 text-sm">Don't have an account? </span>
                <Link 
                  to="/register"
                  className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
