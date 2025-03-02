
import React from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const Register = () => {
  const { register, loading, error } = useAuth();
  
  const handleSubmit = (data: any) => {
    register(data.name, data.email, data.password);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center relative">
        {/* Background effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-secondary/20 rounded-full filter blur-3xl"></div>
          
          {/* Animal silhouettes */}
          <div className="absolute top-20 left-20 w-48 h-48 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
              <path d="M320 192h17.1c22.1 38.3 63.5 64 110.9 64c11 0 21.8-1.4 32-4v4 32V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V339.2L280 448h56c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-53 0-96-43-96-96V192.5c0-16.1-12-29.8-28-31.8l-7.9-1c-17.5-2.2-30-18.2-27.8-35.7s18.2-30 35.7-27.8l7.9 1c48 6 84.1 46.8 84.1 95.3v85.3c34.4-51.7 93.2-85.8 160-85.8zm160 26.5v0c-10 3.5-20.8 5.5-32 5.5c-28.4 0-54-12.4-71.6-32h0c-3.7-4.1-7-8.5-9.9-13.2C357.3 164 352 146.6 352 128v0V32 12 10.7C352 4.8 356.7 .1 362.6 0h.2c3.3 0 6.4 1.6 8.4 4.2l0 .1L384 21.3l27.2 36.3L416 64h64l4.8-6.4L512 21.3 524.8 4.3l0-.1c2-2.6 5.1-4.2 8.4-4.2h.2C539.3 .1 544 4.8 544 10.7V12 32v96c0 17.3-4.6 33.6-12.6 47.6c-11.3 19.8-29.6 35.2-51.4 42.9zM432 128a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zm48 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32z" />
            </svg>
          </div>
          
          <div className="absolute bottom-10 left-10 w-48 h-48 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
              <path d="M528.3 61.3c-11.4-42.7-55.3-68-98-56.6L414.9 8.8C397.8 13.4 387.7 31 392.3 48l2.3 8.6c2.8 10.6-3.2 21.5-13.8 24.3L316 94.5c-10.6 2.8-21.5-3.2-24.3-13.8l-2.3-8.6C282.9 54.7 265.2 44.7 248.2 49.2L109.7 82.7C67 94.1 41.7 138 53.1 180.7l8.6 32-177.7 47.4C-118.5 294.6-142.4 321-132.7 339l23.9 44.8c6.5 12.1 18.7 20.1 32.8 20.5c6.3 .2 12.5-1.2 18.2-4c7.6-3.7 15.9-5.8 24.2-5.8c19.9 0 37.4 10.8 46.9 27l14.1 24.8c5.7 10 16.3 16.2 27.8 16.2c3.8 0 7.4-.7 11-2c19-7.1 29-28 22-47L33.2 311.9 51.9 350c11.4 42.7 55.3 68 98 56.6L289.4 373c17.1-4.6 27.2-22.2 22.6-39.2l-8.6-32 154.3-41.2c42.7-11.4 68-55.3 56.6-98l-26.4-98.8 32-8.6c-2.6-9.5-3.5-19.5-2.7-29.6c1.1-12.9 6.4-24.9 15.2-34.5c6.8-7.4 15.3-13 24.8-16.3c14.7-5.1 25-18.9 25-34.9c0-20.2-16.4-36.6-36.6-36.6H556c-14.1 0-26.3 8-32.4 19.7c-1.3 2.5-3 4.7-5.3 6.5c-4.2 3.4-9.5 5.3-15.1 5.3c-1.6 0-3.2-.2-4.7-.5c-30.1-6.7-47.6 24.5-26.2 48c24.1 26.5 21.4 68.2-7.4 91c-33.2 26.2-81.8 13.3-97.8-26.3c-8.8-21.8 2.1-47 24.5-56.7c13.4-5.8 15.8-23.5 4.8-33.1c-2.3-2-4.9-3.6-7.7-4.8c-8.2-3.4-17.6-2.8-25.2 1.9c-9.4 5.9-17.3 14.1-22.2 24.8L328 116z" />
            </svg>
          </div>
        </div>
        
        <div className="glass max-w-md w-full mx-4 p-8 md:p-10 z-10 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-foreground/70">Sign up to get started with Animal Manager</p>
          </div>
          
          <AuthForm
            type="register"
            onSubmit={handleSubmit}
            loading={loading}
            error={error || undefined}
          >
            <div className="mt-6 text-center text-sm">
              <span className="text-foreground/70">Already have an account? </span>
              <Link 
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </AuthForm>
        </div>
      </div>
    </div>
  );
};

export default Register;
