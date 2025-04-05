import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ 
  label, error, className, ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className={cn(
        "relative transition-all duration-200",
        "group border border-input rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary",
        error && "border-destructive focus-within:ring-destructive focus-within:border-destructive"
      )}>
        <input
          className={cn(
            "block w-full rounded-lg py-2 px-3 text-foreground placeholder:text-muted-foreground",
            "bg-transparent focus:outline-none",
            isPassword && "pr-10",
            className
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
          type={isPassword && showPassword ? 'text' : props.type}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
};

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password';
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  error?: string;
  serverErrors?: Record<string, string>;
  setServerErrors?: (errors: Record<string, string>) => void;
  children?: React.ReactNode; // Fixed: Added children to interface
}

const AuthForm: React.FC<AuthFormProps> = ({ 
  type, onSubmit, loading = false, error, serverErrors = {}, setServerErrors, children 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Merge server errors into form errors when they change
  useEffect(() => {
    setFormErrors(prev => ({ ...prev, ...serverErrors }));
  }, [serverErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name] || serverErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
      if (setServerErrors) setServerErrors({ ...serverErrors, [name]: '' });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (type === 'register' || type === 'login' || type === 'forgot-password') {
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
      }
    }
    
    if (type === 'register' || type === 'login') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } 
      
      if (type === 'register') {
        if (!formData.name) {
          errors.name = 'Full name is required';
        }
        
        if (formData.password && formData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (formData.password && !/\d/.test(formData.password)) {
          errors.password = 'Password must contain at least one number';
        } else if (formData.password && !/[!@#$%^&*]/.test(formData.password)) {
          errors.password = 'Password must contain at least one special character';
        }
        
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        await onSubmit(formData);
        // Clear form data and errors on success
        setFormData({});
        setFormErrors({});
        if (setServerErrors) setServerErrors({});
      } catch (err: any) {
        // Errors are handled by the parent component
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
            {error}
          </div>
        )}
        
        {type === 'register' && (
          <AuthInput
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name || ''}
            onChange={handleChange}
            error={formErrors.name}
            required
          />
        )}
        
        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email || ''}
            onChange={handleChange}
            error={formErrors.email}
            required
          />
          
          {(type === 'login' || type === 'register') && (
            <AuthInput
              label="Password"
              type="password"
              name="password"
              placeholder={type === 'register' ? "Min. 8 characters" : "Your password"}
              value={formData.password || ''}
              onChange={handleChange}
              error={formErrors.password}
              required
            />
          )}
          
          {type === 'register' && (
            <AuthInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword || ''}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
            />
          )}
          
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              {type === 'login' && 'Sign In'}
              {type === 'register' && 'Create Account'}
              {type === 'forgot-password' && 'Send Reset Link'}
            </Button>
          </div>
          
          {children}
        </form>
      </div>
    );
  };
  
  export default AuthForm;