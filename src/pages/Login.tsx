import React from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const Login = () => {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = (data: any) => {
    login(data.email, data.password);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center relative">
        {/* Background effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-secondary/20 rounded-full filter blur-3xl"></div>
          
          {/* Animal silhouette */}
          <div className="absolute bottom-10 right-10 w-64 h-64 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z" />
            </svg>
          </div>
        </div>
        
        <div className="glass max-w-md w-full mx-4 p-8 md:p-10 z-10 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-foreground/70">Sign in to your account to continue</p>
          </div>
          
          <AuthForm
            type="login"
            onSubmit={handleSubmit}
            loading={loading}
            error={error || undefined}
          >
            <div className="mt-6 flex flex-col space-y-4 text-sm">
              <div className="flex justify-between">
                <Link 
                  to="/forgot-password"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              
              <div className="text-center">
                <span className="text-foreground/70">Don't have an account? </span>
                <Link 
                  to="/register"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default Login;
