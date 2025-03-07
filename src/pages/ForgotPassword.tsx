import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await forgotPassword(email);
      setStep(2);
      setCooldown(30); // 30 second cooldown for resend
      
      // Animation effect for email envelope
      const envelope = document.getElementById('envelope-icon');
      if (envelope) {
        envelope.classList.add('animate-fly-off');
      }
    } catch (err) {
      setError('There was a problem sending the reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setIsSubmitting(true);
    
    try {
      await forgotPassword(email);
      toast.success('Reset link sent successfully!');
      setCooldown(30);
    } catch (err) {
      setError('Failed to resend the reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center mt-4">
            {step === 1 ? 'Forgot Password' : 'Check Your Email'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Progress stepper */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex space-x-2 sm:space-x-4">
              <div className={`flex flex-col items-center`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <span>1</span>
                </div>
                <span className="text-xs mt-1">Enter Email</span>
              </div>
              <div className={`w-16 sm:w-24 h-0.5 mt-4 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex flex-col items-center`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <span>2</span>
                </div>
                <span className="text-xs mt-1">Check Email</span>
              </div>
            </div>
          </div>
          
          {step === 1 ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" id="envelope-icon" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <p>
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Check your inbox and click the reset link to reset your password.
              </p>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleResend}
                  disabled={cooldown > 0 || isSubmitting}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Link'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="w-full text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Remember your password? Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      <style>{`
        @keyframes fly-off {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-100px) translateX(100px); opacity: 0; }
        }
        .animate-fly-off {
          animation: fly-off 0.6s forwards;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
