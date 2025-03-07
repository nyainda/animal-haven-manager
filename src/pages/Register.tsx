import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Mail, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Register = () => {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!name) {
      errors.name = 'Full name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      register(name, email, password, confirmPassword);
    }
  };

  // Password strength checker
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };
  
  const passwordStrength = getPasswordStrength();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center relative">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-secondary/20 rounded-full filter blur-3xl"></div>
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
                <UserPlus className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-foreground/70 mt-1">Sign up to get started</p>
            </div>
            
            {/* Form body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input 
                    id="name"
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                  {formErrors.name && <p className="text-destructive text-xs mt-1">{formErrors.name}</p>}
                </div>
                
                <div className="space-y-1">
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
                  {formErrors.email && <p className="text-destructive text-xs mt-1">{formErrors.email}</p>}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Min. 8 characters" 
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
                  {password && (
                    <div className="mt-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs">Password strength:</div>
                        <div className="text-xs font-medium">
                          {passwordStrength <= 25 && "Weak"}
                          {passwordStrength > 25 && passwordStrength <= 75 && "Medium"}
                          {passwordStrength > 75 && "Strong"}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-300",
                            passwordStrength <= 25 ? "bg-destructive" : 
                            passwordStrength <= 75 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {formErrors.password && <p className="text-destructive text-xs mt-1">{formErrors.password}</p>}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <Input 
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                  {formErrors.confirmPassword && <p className="text-destructive text-xs mt-1">{formErrors.confirmPassword}</p>}
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-2 mt-2"
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
                        Creating Account...
                      </span> 
                      : 
                      <span className="flex items-center justify-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </span>
                    }
                  </Button>
                </motion.div>
              </form>
              
              <div className="mt-6 text-center">
                <span className="text-foreground/70 text-sm">Already have an account? </span>
                <Link 
                  to="/login"
                  className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
