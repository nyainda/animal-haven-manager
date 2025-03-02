
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const ForgotPassword = () => {
  const { forgotPassword, loading, error } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (data: any) => {
    await forgotPassword(data.email);
    setIsSubmitted(true);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center relative">
        {/* Background effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl"></div>
          
          {/* Sleeping cat silhouette */}
          <div className="absolute bottom-20 right-20 w-64 h-64 opacity-5 transform rotate-45">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z" />
            </svg>
          </div>
        </div>
        
        <div className="glass max-w-md w-full mx-4 p-8 md:p-10 z-10 animate-scale-in">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-foreground/70">Enter your email and we'll send you a reset link</p>
              </div>
              
              <AuthForm
                type="forgot-password"
                onSubmit={handleSubmit}
                loading={loading}
                error={error || undefined}
              >
                <div className="mt-6 text-center text-sm">
                  <span className="text-foreground/70">Remembered your password? </span>
                  <Link 
                    to="/login"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </AuthForm>
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-foreground/70 mb-6">
                We've sent a password reset link to your email address. Please check your inbox.
              </p>
              
              <Link 
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Return to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
