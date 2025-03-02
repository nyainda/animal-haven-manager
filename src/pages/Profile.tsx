
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Simulate profile update
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset form if canceling edit
    if (isEditing) {
      setName(user?.name || '');
      setEmail(user?.email || '');
      setPassword('');
      setConfirmPassword('');
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - reused from Dashboard */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Animal Haven</h2>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Dashboard</span>
            </div>
          </div>
          <div className="px-4 py-2 bg-sidebar-accent border-l-4 border-primary">
            <div className="flex items-center">
              <User className="h-5 w-5 text-primary" />
              <span className="mx-4 font-medium text-primary">Profile</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer" onClick={handleLogout}>
            <div className="flex items-center">
              <LogOut className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Logout</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Header */}
        <header className="bg-card shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">My Profile</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-secondary"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main className="p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <Button 
                  variant={isEditing ? "outline" : "default"} 
                  onClick={toggleEdit}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile}>
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    {isEditing && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="password">New Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Leave blank to keep current password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isEditing && (
                    <Button className="w-full" type="submit">
                      Save Changes
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Profile;
