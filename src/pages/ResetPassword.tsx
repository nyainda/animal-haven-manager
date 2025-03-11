
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const token = searchParams.get('token') || '';
  
  useEffect(() => {
    // Get email from the URL query parameters
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
    }
    
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (!token) {
      toast.error('Reset token is missing');
      navigate('/forgot-password');
    }
  }, [token, navigate]);
  
  useEffect(() => {
    // Simple password strength calculation
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) {
      strength += 1;
    }
    
    // Contains number
    if (/\d/.test(password)) {
      strength += 1;
    }
    
    // Contains lowercase
    if (/[a-z]/.test(password)) {
      strength += 1;
    }
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) {
      strength += 1;
    }
    
    // Contains special char
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    }
    
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);
  
  const getStrengthText = () => {
    if (!password) return '';
    const strengths = ['Weak', 'Fair', 'Good', 'Strong'];
    return strengths[Math.min(passwordStrength - 1, 3)];
  };
  
  const getStrengthColor = () => {
    if (!password) return 'bg-gray-200';
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[Math.min(passwordStrength - 1, 3)];
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordStrength < 3) {
      toast.error('Please choose a stronger password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(token, email, password, confirmPassword);
      setIsSuccess(true);
      
      const lockIcon = document.getElementById('lock-icon');
      if (lockIcon) {
        lockIcon.classList.add('animate-bounce');
        setTimeout(() => {
          lockIcon.classList.remove('animate-bounce');
          lockIcon.classList.add('text-green-500');
        }, 1000);
      }
      
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <Lock id="lock-icon" className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            {isSuccess 
              ? 'Your password has been reset successfully!'
              : 'Create a new password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the login page in a moment.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {password && (
                  <div className="space-y-1 mt-1">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()}`} 
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex justify-between">
                      <span>Password strength</span>
                      <span className={passwordStrength >= 3 ? "text-green-600" : "text-amber-600"}>
                        {getStrengthText()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
                
                {password && confirmPassword && password !== confirmPassword && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Passwords do not match</span>
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;