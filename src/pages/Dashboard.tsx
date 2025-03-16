import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { fetchAnimals } from '@/services/animalService';
import { fetchProductionStatistics, ProductionStatistics } from '@/services/animalProductionApi';
import { Animal } from '@/types/AnimalTypes';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Dog,
  Cat,
  Bird,
  Home,
  User,
  LogOut,
  Moon,
  Sun,
  Settings,
  CalendarIcon,
  ActivityIcon,
  Bell,
  DollarSign,
  Menu,
  X,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek, addDays, differenceInYears, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'event' | 'meeting' | 'production';
}

interface Activity {
  id: string;
  type: 'add' | 'update' | 'adoption' | 'medical' | 'production';
  content: string;
  time: string;
  user: string;
}

interface Notification {
  id: string;
  content: string;
  time: string;
  read: boolean;
}

interface AnimalStats {
  totalAnimals: number;
  mostCommonType: string;
  averageAge: number;
  breedingStockCount: number;
}

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Data states
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', content: 'Milk production report ready', time: '1 hour ago', read: false },
    { id: '2', content: 'Max (Dog) due for checkup', time: '3 hours ago', read: false },
  ]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Vet Appointment', date: new Date(2025, 2, 15), type: 'appointment' },
    { id: '2', title: 'Milk Production Check', date: new Date(2025, 2, 20), type: 'production' },
  ]);
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', type: 'production', content: 'Added 50L milk production', time: '2 hours ago', user: 'John Doe' },
    { id: '2', type: 'medical', content: 'Scheduled checkup for Max', time: 'Yesterday', user: 'Jane Smith' },
  ]);
  const [productionStats, setProductionStats] = useState<ProductionStatistics | null>(null);
  const [animalStats, setAnimalStats] = useState<AnimalStats | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mobileNotifications, setMobileNotifications] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  const animalData = [
    { name: 'Dogs', value: 5, color: '#10B981' },
    { name: 'Cats', value: 7, color: '#3B82F6' },
    { name: 'Birds', value: 3, color: '#F59E0B' },
  ];
  const COLORS = animalData.map(item => item.color);

  // Load initial data with error handling and persistence
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated || authLoading) return;

      setDataLoading(true);
      try {
        const animalList = await fetchAnimals();
        setAnimals(animalList);

        if (animalList.length > 0) {
          const typeCounts = animalList.reduce((acc: Record<string, number>, animal) => {
            acc[animal.type] = (acc[animal.type] || 0) + 1;
            return acc;
          }, {});
          const mostCommonType = Object.entries(typeCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

          const totalAge = animalList.reduce((sum, animal) => {
            if (animal.age) return sum + animal.age;
            if (animal.birth_date) {
              const birthDate = parseISO(animal.birth_date);
              return sum + differenceInYears(new Date(), birthDate);
            }
            return sum;
          }, 0);
          const averageAge = animalList.length > 0 ? totalAge / animalList.length : 0;

          const breedingStockCount = animalList.filter(animal => animal.is_breeding_stock).length;

          setAnimalStats({
            totalAnimals: animalList.length,
            mostCommonType,
            averageAge,
            breedingStockCount,
          });

          setSelectedAnimalId(animalList[0].id);
          // Cache data in localStorage
          localStorage.setItem('dashboard_animals', JSON.stringify(animalList));
          localStorage.setItem('dashboard_animalStats', JSON.stringify({
            totalAnimals: animalList.length,
            mostCommonType,
            averageAge,
            breedingStockCount,
          }));
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load dashboard data');
        // Load from cache if available
        const cachedAnimals = localStorage.getItem('dashboard_animals');
        const cachedStats = localStorage.getItem('dashboard_animalStats');
        if (cachedAnimals) setAnimals(JSON.parse(cachedAnimals));
        if (cachedStats) setAnimalStats(JSON.parse(cachedStats));
      } finally {
        setDataLoading(false);
        setInitialLoadComplete(true);
      }
    };

    loadInitialData();
  }, [isAuthenticated, authLoading]);

  // Fetch production stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedAnimalId || !isAuthenticated || authLoading) return;

      try {
        const stats = await fetchProductionStatistics(selectedAnimalId);
        setProductionStats(stats);
        localStorage.setItem(`productionStats_${selectedAnimalId}`, JSON.stringify(stats));
      } catch (error: any) {
        console.error(`Failed to fetch stats for animal ${selectedAnimalId}:`, error);
        toast.error(error.message || 'Failed to load production statistics');
        // Load from cache if available
        const cachedStats = localStorage.getItem(`productionStats_${selectedAnimalId}`);
        if (cachedStats) setProductionStats(JSON.parse(cachedStats));
      }
    };

    fetchStats();
  }, [selectedAnimalId, isAuthenticated, authLoading]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  // Notification handlers
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // Calendar rendering
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startWeek = startOfWeek(monthStart);

    const calendarCells = [];
    for (let i = 0; i < getDay(monthStart); i++) {
      const prevDay = addDays(startWeek, i);
      calendarCells.push(
        <div key={`prev-${i}`} className="h-12 p-1 text-muted-foreground text-center border border-muted">
          <span className="text-xs">{format(prevDay, 'd')}</span>
        </div>
      );
    }

    days.forEach(day => {
      const eventsForDay = calendarEvents.filter(event => isSameDay(event.date, day));
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());

      calendarCells.push(
        <div
          key={day.toString()}
          className={cn(
            'h-12 p-1 text-center border border-muted relative cursor-pointer hover:bg-muted/30',
            isSelected && 'bg-primary/10 border-primary',
            isToday && 'font-bold'
          )}
          onClick={() => setSelectedDate(day)}
        >
          <span className={cn('text-xs inline-block w-6 h-6 rounded-full leading-6', isToday && 'bg-primary text-white')}>
            {format(day, 'd')}
          </span>
          {eventsForDay.length > 0 && (
            <div className="flex justify-center space-x-1 mt-1">
              {eventsForDay.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-1 h-1 rounded-full',
                    event.type === 'appointment' && 'bg-blue-500',
                    event.type === 'event' && 'bg-green-500',
                    event.type === 'meeting' && 'bg-amber-500',
                    event.type === 'production' && 'bg-purple-500'
                  )}
                  title={event.title}
                />
              ))}
            </div>
          )}
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
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            Previous
          </Button>
          <h2 className="text-xl font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Next
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {weekDays.map(day => (
            <div key={day} className="text-center p-2 font-medium bg-muted/20">{day}</div>
          ))}
          {calendarCells}
        </div>
        {selectedDate && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
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
              <p className="text-muted-foreground">No events scheduled</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Chart data transformation
  const qualityDistributionData = productionStats
    ? Object.entries(productionStats.quality_distribution).map(([name, value]) => ({ name, value }))
    : [];
  const productionTrendsData = productionStats
    ? Object.entries(productionStats.production_trends).map(([month, quantity]) => ({ month, quantity }))
    : [];
  const topMethodsData = productionStats
    ? Object.entries(productionStats.top_production_methods).map(([name, count]) => ({ name, count }))
    : [];
  const organicData = productionStats
    ? [
        { name: 'Organic', value: productionStats.organic_vs_non_organic['1'] || 0 },
        { name: 'Non-Organic', value: productionStats.total_production - (productionStats.organic_vs_non_organic['1'] || 0) },
      ].filter(item => item.value > 0)
    : [];

  // Authentication guard
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Main render
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative bg-card w-64 h-full shadow-lg">
            <div className="p-4 flex items-center justify-between border-b">
              <h2 className="text-xl font-bold text-primary">Animal Haven</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-4">
              {[
                { tab: 'overview', icon: Home, label: 'Dashboard' },
                { path: '/animals', icon: Dog, label: 'Animals' },
                { path: '/forms/transaction', icon: DollarSign, label: 'Transactions' },
                { tab: 'calendar', icon: CalendarIcon, label: 'Calendar' },
                { tab: 'activity', icon: ActivityIcon, label: 'Activity' },
                { tab: 'settings', icon: Settings, label: 'Settings' },
                { path: '/profile', icon: User, label: 'Profile' },
                { onClick: handleLogout, icon: LogOut, label: 'Logout' },
              ].map(item => (
                <div
                  key={item.label}
                  className={cn(
                    'px-4 py-3 hover:bg-muted cursor-pointer',
                    activeTab === item.tab && 'bg-muted border-l-4 border-primary'
                  )}
                  onClick={() => {
                    item.path ? navigate(item.path) : item.tab ? setActiveTab(item.tab) : item.onClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <item.icon className={cn('h-5 w-5', activeTab === item.tab ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('ml-4 font-medium', activeTab === item.tab && 'text-primary')}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card shadow-md hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Animal Haven</h2>
        </div>
        <nav className="mt-6">
          {[
            { tab: 'overview', icon: Home, label: 'Dashboard' },
            { path: '/animals', icon: Dog, label: 'Animals' },
            { path: '/forms/transaction', icon: DollarSign, label: 'Transactions' },
            { tab: 'calendar', icon: CalendarIcon, label: 'Calendar' },
            { tab: 'activity', icon: ActivityIcon, label: 'Activity' },
            { tab: 'settings', icon: Settings, label: 'Settings' },
            { path: '/profile', icon: User, label: 'Profile' },
            { onClick: handleLogout, icon: LogOut, label: 'Logout' },
          ].map(item => (
            <div
              key={item.label}
              className={cn(
                'px-4 py-2 hover:bg-muted cursor-pointer',
                activeTab === item.tab && 'bg-muted border-l-4 border-primary'
              )}
              onClick={() => item.path ? navigate(item.path) : item.tab ? setActiveTab(item.tab) : item.onClick?.()}
            >
              <div className="flex items-center">
                <item.icon className={cn('h-5 w-5', activeTab === item.tab ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('mx-4 font-medium', activeTab === item.tab && 'text-primary')}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold truncate">Welcome, {user?.name || 'User'}!</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('activity')}>
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t">
          <div className="grid grid-cols-4 gap-1 p-2">
            {[
              { tab: 'overview', icon: Home, label: 'Dashboard' },
              { tab: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              { tab: 'activity', icon: ActivityIcon, label: 'Activity' },
              { tab: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <Button
                key={item.tab}
                variant="ghost"
                className={cn(
                  'h-14 flex-col gap-1 rounded-none',
                  activeTab === item.tab && 'bg-muted'
                )}
                onClick={() => setActiveTab(item.tab)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
          {dataLoading && !initialLoadComplete ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 md:hidden">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                {animals.length === 0 && !animalStats ? (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">No animals available to display statistics.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground">
                        Production stats for: {animals.find(a => a.id === selectedAnimalId)?.name || selectedAnimalId}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">Total Animals</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{animalStats?.totalAnimals || 0}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">Most Common Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{animalStats?.mostCommonType || 'N/A'}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">Average Age</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{animalStats?.averageAge.toFixed(1) || 0} yrs</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">Breeding Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{animalStats?.breedingStockCount || 0}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">Total Production</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{productionStats?.total_production || 0} L/kg</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Production</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{productionStats?.average_production.toFixed(1) || 0} L/kg</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-muted-foreground">Passed Quality</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold text-green-500">{productionStats?.quality_distribution.Passed || 0}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Quality Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={qualityDistributionData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {qualityDistributionData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Production Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productionTrendsData}>
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="quantity" fill="#10B981" name="Quantity (L/kg)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Top Production Methods</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topMethodsData}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#3B82F6" name="Count" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Organic vs Non-Organic</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={organicData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {organicData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activities.map(activity => (
                        <div
                          key={activity.id}
                          className="flex items-start p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                        >
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center mr-3',
                              activity.type === 'production' && 'bg-purple-100 text-purple-600',
                              activity.type === 'medical' && 'bg-amber-100 text-amber-600'
                            )}
                          >
                            <ActivityIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{activity.content}</p>
                              <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">By {activity.user}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-3 rounded-lg border relative cursor-pointer hover:bg-muted/30',
                            !notification.read && 'bg-primary/5 border-primary/30'
                          )}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          {!notification.read && (
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                          )}
                          <p className="font-medium">{notification.content}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      ))}
                      <Button variant="ghost" className="mt-4" onClick={markAllNotificationsAsRead}>
                        Mark All as Read
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4 mb-4">
                      {[
                        { type: 'appointment', color: 'bg-blue-500', label: 'Appointments' },
                        { type: 'event', color: 'bg-green-500', label: 'Events' },
                        { type: 'meeting', color: 'bg-amber-500', label: 'Meetings' },
                        { type: 'production', color: 'bg-purple-500', label: 'Production' },
                      ].map(item => (
                        <div key={item.type} className="flex items-center space-x-1">
                          <div className={cn('w-3 h-3 rounded-full', item.color)} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    {renderCalendar()}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg">Notifications</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates via email</p>
                          </div>
                          <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Mobile Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive push notifications</p>
                          </div>
                          <Switch checked={mobileNotifications} onCheckedChange={setMobileNotifications} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Appearance</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                          </div>
                          <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                          />
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => toast.success('Settings saved')}>Save Settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;