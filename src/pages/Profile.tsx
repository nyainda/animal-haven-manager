import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Settings, LogOut, Moon, Sun, Camera, ChevronLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    avatar: null as File | null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        avatar: null,
      });
      setAvatarPreview(user?.avatar || null);
    }
  }, [isAuthenticated, navigate, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    const data = new FormData();
    if (formData.name && formData.name !== user?.name) data.append('name', formData.name);
    if (formData.email && formData.email !== user?.email) data.append('email', formData.email);
    if (formData.avatar) data.append('avatar', formData.avatar);
    if (formData.password) {
      data.append('password', formData.password);
      data.append('password_confirmation', formData.password_confirmation);
    }

    try {
      await updateProfile(data);
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '', password_confirmation: '', avatar: null }));
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        avatar: null,
      });
      setAvatarPreview(user?.avatar || null);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Collapsible on Mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-card shadow-md transform transition-transform duration-300 ease-in-out z-50',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static md:translate-x-0 md:shadow-none'
        )}
      >
        <div className="p-6 border-b border-muted flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Animal Haven</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-6">
          {[
            { path: '/dashboard', icon: Settings, label: 'Dashboard' },
            { path: '/profile', icon: User, label: 'Profile', active: true },
            { onClick: handleLogout, icon: LogOut, label: 'Logout' },
          ].map(item => (
            <div
              key={item.label}
              className={cn(
                'px-4 py-3 flex items-center cursor-pointer hover:bg-muted transition-colors',
                item.active && 'bg-muted border-l-4 border-primary'
              )}
              onClick={() => {
                if (item.path) navigate(item.path);
                else item.onClick?.();
                setIsSidebarOpen(false);
              }}
            >
              <item.icon className={cn('h-5 w-5', item.active ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('ml-4 font-medium', item.active && 'text-primary')}>
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <Settings className="h-6 w-6" />
            </Button>
            <h1 className="text-xl md:text-2xl font-semibold">My Profile</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="md:hidden"
              aria-label="Back to dashboard"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Profile Content */}
        <main className="flex-1 p-4 md:p-6 flex items-start md:items-center justify-center overflow-y-auto">
          <Card className="w-full max-w-lg shadow-lg">
            <CardHeader className="border-b border-muted">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl md:text-2xl font-bold">Personal Information</CardTitle>
                <Button
                  variant={isEditing ? 'outline' : 'default'}
                  onClick={toggleEdit}
                  className={cn(isEditing && 'border-destructive text-destructive hover:bg-destructive/10')}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24">
                      <AvatarImage src={avatarPreview || ''} alt="Profile avatar" />
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-primary text-white p-1.5 md:p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          disabled={!isEditing}
                        />
                      </label>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isEditing ? 'Tap to change avatar' : `${user?.name || 'User'}`}
                  </span>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email"
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>

                  {isEditing && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                          New Password
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Leave blank to keep current"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium">
                          Confirm Password
                        </Label>
                        <Input
                          id="password_confirmation"
                          name="password_confirmation"
                          type="password"
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <Button type="submit" className="w-full mt-6">
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Profile;