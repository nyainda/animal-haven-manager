
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

const VerifyEmail: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();
  
  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  // Get email from location state (passed from register page)
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);
  
  // Cooldown timer for resend button
  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown]);
  
  // Verify email token if present
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      setIsVerifying(true);
      setError('');
      
      try {
        await verifyEmail(token);
        setIsVerified(true);
        
        // Trigger confetti animation
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 300);
      } catch (err) {
        setError('Failed to verify email. The link may have expired.');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, [token, verifyEmail]);
  
  const handleResendEmail = async () => {
    if (cooldown > 0 || !email) return;
    
    setIsResending(true);
    setError('');
    
    try {
      // Mock API call - in a real app, would call a resend verification endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCooldown(30); // 30 second cooldown
      
      // Show success message
      const resendSuccess = document.getElementById('resend-success');
      if (resendSuccess) {
        resendSuccess.classList.remove('hidden');
        setTimeout(() => {
          resendSuccess.classList.add('hidden');
        }, 5000);
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isVerified ? 'Email Verified!' : token ? 'Verifying Email...' : 'Verify Your Email'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {token ? (
            <div className="text-center space-y-4">
              {isVerifying ? (
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  </div>
                </div>
              ) : isVerified ? (
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                </div>
              )}
              
              {isVerified ? (
                <>
                  <p className="text-base font-medium">Your email has been verified successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    You can now proceed to log in to your account.
                  </p>
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </Button>
                  </div>
                </>
              ) : error ? (
                <>
                  <p className="text-base font-medium text-destructive">Verification Failed</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/login')}
                    >
                      Back to Login
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-base">Verifying your email...</p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <p className="text-base font-medium">Please verify your email address</p>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to{' '}
                <span className="font-medium">{email || 'your email address'}</span>.
                Check your inbox and click the verification link to activate your account.
              </p>
              
              <div 
                id="resend-success" 
                className="hidden p-3 rounded-lg bg-emerald-50 text-emerald-600 text-sm flex items-center animate-fade-in"
              >
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                Verification email has been resent!
              </div>
              
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleResendEmail}
                  disabled={cooldown > 0 || isResending || !email}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="w-full text-center">
            {!token && !isVerified && (
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
    </div>
  );
};

export default VerifyEmail;
