import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Dog, Cat, Bird, Plus, FileText, Home, User, LogOut, Moon, Sun, Settings, CalendarIcon, ListTodo, ActivityIcon, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const animalData = [
    { name: 'Dogs', value: 5, color: '#10B981' },
    { name: 'Cats', value: 7, color: '#3B82F6' },
    { name: 'Birds', value: 3, color: '#F59E0B' },
    { name: 'Others', value: 2, color: '#8B5CF6' },
  ];

  const activityData = [
    { name: 'Mon', adoptions: 2, checkups: 3 },
    { name: 'Tue', adoptions: 3, checkups: 2 },
    { name: 'Wed', adoptions: 4, checkups: 4 },
    { name: 'Thu', adoptions: 2, checkups: 5 },
    { name: 'Fri', adoptions: 5, checkups: 3 },
    { name: 'Sat', adoptions: 6, checkups: 2 },
    { name: 'Sun', adoptions: 1, checkups: 1 },
  ];

  const COLORS = animalData.map(item => item.color);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const startWeek = startOfWeek(monthStart);
    
    const calendarCells = [];
    
    for (let i = 0; i < getDay(monthStart); i++) {
      const prevMonthDay = addDays(startWeek, i);
      calendarCells.push(
        <div key={`prev-${i}`} className="h-12 p-1 text-muted-foreground text-center border border-muted">
          <span className="text-xs">{format(prevMonthDay, 'd')}</span>
        </div>
      );
    }
    
    days.forEach(day => {
      const eventsForDay = calendarEvents.filter(event => 
        isSameDay(event.date, day)
      );
      
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());
      
      calendarCells.push(
        <div 
          key={day.toString()} 
          className={cn(
            "h-12 p-1 text-center border border-muted relative cursor-pointer hover:bg-muted/30 transition-colors",
            isSelected && "bg-primary/10 border-primary",
            isToday && "font-bold"
          )}
          onClick={() => setSelectedDate(day)}
        >
          <span className={cn(
            "text-xs inline-block w-6 h-6 rounded-full leading-6",
            isToday && "bg-primary text-primary-foreground"
          )}>
            {format(day, 'd')}
          </span>
          
          <div className="mt-1">
            {eventsForDay.length > 0 && (
              <div className="flex justify-center space-x-1">
                {eventsForDay.slice(0, 3).map((event, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "w-1 h-1 rounded-full",
                      event.type === 'appointment' && "bg-blue-500",
                      event.type === 'event' && "bg-green-500",
                      event.type === 'meeting' && "bg-amber-500"
                    )}
                    title={event.title}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    });
    
    const totalCells = 7 * Math.ceil(days.length / 7);
    const remainingCells = totalCells - calendarCells.length;
    
    for (let i = 1; i <= remainingCells; i++) {
      calendarCells.push(
        <div key={`next-${i}`} className="h-12 p-1 text-muted-foreground text-center border border-muted">
          <span className="text-xs">{i}</span>
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            Previous
          </Button>
          <h2 className="text-xl font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            Next
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-0">
          {weekDays.map(day => (
            <div key={day} className="text-center p-2 font-medium bg-muted/20">
              {day}
            </div>
          ))}
          {calendarCells}
        </div>
        
        {selectedDate && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
            <div className="mt-2">
              {calendarEvents.filter(event => isSameDay(event.date, selectedDate)).length > 0 ? (
                calendarEvents
                  .filter(event => isSameDay(event.date, selectedDate))
                  .map(event => (
                    <div key={event.id} className="py-2 border-b last:border-0">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground">No events scheduled for this day</p>
              )}
            </div>
            <Button className="mt-4" onClick={() => toast.success('This would open the event creation modal in a real app')}>
              Add Event
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 bg-sidebar text-sidebar-foreground shadow-md max-h-full overflow-auto hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Animal Haven</h2>
        </div>
        <nav className="mt-6">
          <div className={`px-4 py-2 hover:bg-sidebar-accent cursor-pointer ${activeTab === 'overview' && 'bg-sidebar-accent border-l-4 border-primary'}`} onClick={() => setActiveTab('overview')}>
            <div className="flex items-center">
              <Home className={`h-5 w-5 ${activeTab === 'overview' ? 'text-primary' : 'text-sidebar-foreground'}`} />
              <span className={`mx-4 font-medium ${activeTab === 'overview' && 'text-primary'}`}>Dashboard</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer" onClick={() => navigate('/animals')}>
            <div className="flex items-center">
              <Dog className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Animals</span>
            </div>
          </div>
          <div className={`px-4 py-2 hover:bg-sidebar-accent cursor-pointer ${activeTab === 'activity' && 'bg-sidebar-accent border-l-4 border-primary'}`} onClick={() => setActiveTab('activity')}>
            <div className="flex items-center">
              <ActivityIcon className={`h-5 w-5 ${activeTab === 'activity' ? 'text-primary' : 'text-sidebar-foreground'}`} />
              <span className={`mx-4 font-medium ${activeTab === 'activity' && 'text-primary'}`}>Activity</span>
            </div>
          </div>
          <div className={`px-4 py-2 hover:bg-sidebar-accent cursor-pointer ${activeTab === 'calendar' && 'bg-sidebar-accent border-l-4 border-primary'}`} onClick={() => setActiveTab('calendar')}>
            <div className="flex items-center">
              <CalendarIcon className={`h-5 w-5 ${activeTab === 'calendar' ? 'text-primary' : 'text-sidebar-foreground'}`} />
              <span className={`mx-4 font-medium ${activeTab === 'calendar' && 'text-primary'}`}>Calendar</span>
            </div>
          </div>
          <div className={`px-4 py-2 hover:bg-sidebar-accent cursor-pointer ${activeTab === 'settings' && 'bg-sidebar-accent border-l-4 border-primary'}`} onClick={() => setActiveTab('settings')}>
            <div className="flex items-center">
              <Settings className={`h-5 w-5 ${activeTab === 'settings' ? 'text-primary' : 'text-sidebar-foreground'}`} />
              <span className={`mx-4 font-medium ${activeTab === 'settings' && 'text-primary'}`}>Settings</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center">
              <User className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Profile</span>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex md:hidden">
              <Button variant="ghost" size="sm" className="mr-2" onClick={() => toast.info('This would open the mobile menu')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <h1 className="text-xl font-semibold">Animal Haven</h1>
            </div>
            
            <h1 className="text-xl font-semibold hidden md:block">Hi, {user?.name || 'User'}!</h1>
            
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
              
              <div className="relative">
                <button 
                  className="p-2 rounded-full hover:bg-secondary relative"
                  onClick={() => toast.info('This would open the notifications panel')}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="hidden sm:block">
                <Input
                  type="text"
                  placeholder="Search animals..."
                  className="w-40 md:w-60 lg:w-80"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 md:hidden">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="animals">Animals</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                <Card className="p-6 hover:shadow-md transition-all duration-200">
                  <h3 className="font-medium text-muted-foreground">Total Animals</h3>
                  <p className="text-3xl font-bold mt-2">17</p>
                  <p className="text-green-500 mt-2 text-sm">+2 this month</p>
                </Card>
                <Card className="p-6 hover:shadow-md transition-all duration-200">
                  <h3 className="font-medium text-muted-foreground">Species</h3>
                  <p className="text-3xl font-bold mt-2">4</p>
                  <div className="flex flex-wrap mt-2 gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs">Dogs</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-xs">Cats</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-full text-xs">Birds</span>
                  </div>
                </Card>
                <Card className="p-6 hover:shadow-md transition-all duration-200">
                  <h3 className="font-medium text-muted-foreground">Health Alerts</h3>
                  <p className="text-3xl font-bold mt-2 text-amber-500">2</p>
                  <p className="text-amber-500 mt-2 text-sm">2 animals need checkups</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Species Breakdown</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={animalData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {animalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Recent Animals</h2>
                    <Button variant="outline" size="sm" onClick={() => navigate('/animals')}>View All</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Species</th>
                          <th className="px-4 py-2 text-left">Age</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted">
                          <td className="px-4 py-3">Luna</td>
                          <td className="px-4 py-3 flex items-center">
                            <Cat className="h-4 w-4 mr-2" />
                            Cat
                          </td>
                          <td className="px-4 py-3">2 years</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs">Healthy</span>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted">
                          <td className="px-4 py-3">Max</td>
                          <td className="px-4 py-3 flex items-center">
                            <Dog className="h-4 w-4 mr-2" />
                            Dog
                          </td>
                          <td className="px-4 py-3">3 years</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full text-xs">Checkup Needed</span>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted">
                          <td className="px-4 py-3">Tweetie</td>
                          <td className="px-4 py-3 flex items-center">
                            <Bird className="h-4 w-4 mr-2" />
                            Bird
                          </td>
                          <td className="px-4 py-3">1 year</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs">Healthy</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => navigate('/animals/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Animal
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Weekly Activity</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="adoptions" fill="#10B981" name="Adoptions" />
                        <Bar dataKey="checkups" fill="#3B82F6" name="Checkups" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <div key={activity.id} className="flex items-start p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3",
                          activity.type === 'add' && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-100",
                          activity.type === 'update' && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-100",
                          activity.type === 'adoption' && "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-100",
                          activity.type === 'medical' && "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-100",
                        )}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{activity.content}</p>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">By {activity.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="ghost">View All Activity</Button>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-3 rounded-lg border relative",
                          !notification.read && "bg-primary/5 border-primary/30",
                          "hover:bg-muted/30 transition-colors"
                        )}
                      >
                        {!notification.read && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <p className="font-medium">{notification.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="ghost">Mark All as Read</Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="calendar">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Calendar</h2>
                <div className="flex space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Appointments</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Events</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm">Meetings</span>
                  </div>
                </div>
                {renderCalendar()}
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Notification Preferences</h3>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive email updates about animal care, events, and system alerts</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mobile-notifications" className="font-medium">Mobile Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on your mobile device</p>
                      </div>
                      <Switch
                        id="mobile-notifications"
                        checked={mobileNotifications}
                        onCheckedChange={setMobileNotifications}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Display Settings</h3>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="system-theme" className="font-medium">Use System Theme</Label>
                        <p className="text-sm text-muted-foreground">Automatically match your system's theme setting</p>
                      </div>
                      <Switch
                        id="system-theme"
                        checked={darkModeSystem}
                        onCheckedChange={setDarkModeSystem}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="mt-6" 
                    onClick={() => {
                      toast.success('Settings saved successfully');
                    }}
                  >
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="animals">
              <div className="text-center p-12">
                <h2 className="text-xl font-medium mb-2">Animals Management</h2>
                <p className="text-muted-foreground mb-6">
                  Manage your animals and livestock in one place.
                </p>
                <Button onClick={() => navigate('/animals')}>
                  Go to Animals Dashboard
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
