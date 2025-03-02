
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, UnlockIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import zxcvbn from 'zxcvbn';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [strength, setStrength] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  
  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);
  
  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setStrength(result.score);
      
      const feedbacks = {
        0: 'Very weak',
        1: 'Weak',
        2: 'Fair',
        3: 'Good',
        4: 'Strong'
      };
      
      setFeedbackText(feedbacks[result.score as keyof typeof feedbacks]);
    } else {
      setStrength(0);
      setFeedbackText('');
    }
  }, [password]);
  
  const getStrengthColor = () => {
    const colors = {
      0: 'bg-destructive',
      1: 'bg-destructive',
      2: 'bg-amber-500',
      3: 'bg-amber-500',
      4: 'bg-emerald-500'
    };
    
    return colors[strength as keyof typeof colors];
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    
    if (!password) {
      setError('Please enter a new password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (strength < 2) {
      setError('Please choose a stronger password');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      
      // Animate the lock icon unlocking
      const lockIcon = document.getElementById('lock-icon');
      if (lockIcon) {
        lockIcon.classList.add('animate-unlock');
      }
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. The token may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isSuccess ? 'Password Reset Successfully' : 'Reset Your Password'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div id="lock-icon" className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <UnlockIcon className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              
              <p className="text-base font-medium">Your password has been reset successfully!</p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the login page shortly...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!token && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Invalid or missing reset token
                  </div>
                )}
                
                <div>
                  <div className="mb-2 text-sm font-medium flex justify-between items-center">
                    <label htmlFor="password">New Password</label>
                    {password && (
                      <span className={`text-xs ${
                        strength <= 1 ? 'text-destructive' : 
                        strength <= 3 ? 'text-amber-500' : 
                        'text-emerald-500'
                      }`}>
                        {feedbackText}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input 
                      id="password"
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Create new password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={!token || isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="mt-2">
                      <Progress value={strength * 25} className={getStrengthColor()} />
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="mb-2 text-sm font-medium block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input 
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="Confirm your password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={!token || isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                  disabled={!token || isSubmitting}
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="w-full text-center">
            {!isSuccess && (
              <Button 
                variant="link" 
                className="text-sm p-0 h-auto" 
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <style jsx>{`
        @keyframes unlock {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-20deg); }
          30% { transform: rotate(20deg); }
          45% { transform: rotate(-10deg); }
          60% { transform: rotate(10deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-unlock {
          animation: unlock 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
