import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchAnimals } from '@/services/animalService';
import { fetchProductionStatistics, ProductionStatistics } from '@/services/animalProductionApi';
import { fetchActivities, Activity } from '@/services/ActivityApi'; // Import fetchActivities and Activity type
import { Animal } from '@/types/AnimalTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Home, CalendarIcon, ActivityIcon, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { parseISO, differenceInYears } from 'date-fns';

import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ActionCards from '@/components/dashboard/ActionCards';
import AnimalStats from '@/components/dashboard/AnimalStats';
import Charts from '@/components/dashboard/Charts';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CalendarView from '@/components/dashboard/CalendarView';
import SettingsPanel from '@/components/dashboard/SettingsPanel';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'event' | 'meeting' | 'production';
}

// Updated Activity interface to match ActivityApi
interface Activity {
  id: string;
  animal_id: string;
  activity_type: string;
  activity_date: string;
  description: string;
  notes: string;
  breeding_date?: string;
  breeding_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  content: string;
  time: string;
  read: boolean;
}

interface AnimalStatsData {
  totalAnimals: number;
  mostCommonType: string;
  averageAge: number;
  breedingStockCount: number;
}

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Data states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]); // Updated to use Activity type from ActivityApi
  const [productionStats, setProductionStats] = useState<ProductionStatistics | null>(null);
  const [animalStats, setAnimalStats] = useState<AnimalStatsData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mobileNotifications, setMobileNotifications] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Load initial data (animals and activities)
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
          const mostCommonType = Object.entries(typeCounts).reduce((a, b) => (b[1] > a[1] ? b : a), ['N/A', 0])[0];

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
          localStorage.setItem('dashboard_animals', JSON.stringify(animalList));
          localStorage.setItem('dashboard_animalStats', JSON.stringify({
            totalAnimals: animalList.length,
            mostCommonType,
            averageAge,
            breedingStockCount,
          }));

          // Fetch activities for the first animal
          const initialActivities = await fetchActivities(animalList[0].id);
          setActivities(initialActivities);
          localStorage.setItem(`dashboard_activities_${animalList[0].id}`, JSON.stringify(initialActivities));
        } else {
          setAnimalStats({
            totalAnimals: 0,
            mostCommonType: 'N/A',
            averageAge: 0,
            breedingStockCount: 0,
          });
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load dashboard data');
        setAnimalStats({
          totalAnimals: 0,
          mostCommonType: 'N/A',
          averageAge: 0,
          breedingStockCount: 0,
        });
        const cachedAnimals = localStorage.getItem('dashboard_animals');
        const cachedStats = localStorage.getItem('dashboard_animalStats');
        if (cachedAnimals) setAnimals(JSON.parse(cachedAnimals));
        if (cachedStats) setAnimalStats(JSON.parse(cachedStats));
        const cachedActivities = localStorage.getItem(`dashboard_activities_${selectedAnimalId}`);
        if (cachedActivities) setActivities(JSON.parse(cachedActivities));
      } finally {
        setDataLoading(false);
        setInitialLoadComplete(true);
      }
    };

    loadInitialData();
  }, [isAuthenticated, authLoading]);

  // Fetch production stats and activities when selectedAnimalId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAnimalId || !isAuthenticated || authLoading) {
        setProductionStats(null);
        setActivities([]);
        return;
      }

      try {
        // Fetch production stats
        const stats = await fetchProductionStatistics(selectedAnimalId);
        setProductionStats(stats);
        localStorage.setItem(`productionStats_${selectedAnimalId}`, JSON.stringify(stats));

        // Fetch activities
        const animalActivities = await fetchActivities(selectedAnimalId);
        setActivities(animalActivities);
        localStorage.setItem(`dashboard_activities_${selectedAnimalId}`, JSON.stringify(animalActivities));
      } catch (error: any) {
        console.error(`Failed to fetch data for animal ${selectedAnimalId}:`, error);
        toast.error(error.message || 'Failed to load data');
        setProductionStats(null);
        setActivities([]);
        const cachedStats = localStorage.getItem(`productionStats_${selectedAnimalId}`);
        const cachedActivities = localStorage.getItem(`dashboard_activities_${selectedAnimalId}`);
        if (cachedStats) setProductionStats(JSON.parse(cachedStats));
        if (cachedActivities) setActivities(JSON.parse(cachedActivities));
      }
    };

    fetchData();
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

  // Authentication guard
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground dark:text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          setActiveTab={setActiveTab}
          notifications={notifications}
        />

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
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
                  activeTab === item.tab && 'bg-muted dark:bg-muted'
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
              <p className="text-muted-foreground dark:text-muted-foreground">Loading dashboard data...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 md:hidden bg-muted p-1 rounded-lg">
                <TabsTrigger value="overview" className="text-xs sm:text-sm font-sans">Overview</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm font-sans">Activity</TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs sm:text-sm font-sans">Calendar</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm font-sans">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {!animalStats || animalStats.totalAnimals === 0 ? (
                  <div className="text-center p-6">
                    <h2 className="text-xl font-serif font-semibold text-foreground dark:text-foreground sm:text-2xl">
                      Welcome to Your Dashboard!
                    </h2>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-4 mt-2 max-w-md mx-auto">
                      It looks like you don’t have any animals yet. Add some animals to start tracking statistics and production data.
                    </p>
                    <Button 
                      onClick={() => navigate('/animals')}
                      className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 sm:h-12.costom"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Animal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ActionCards setActiveTab={setActiveTab} selectedAnimalId={selectedAnimalId} />
                    <AnimalStats
                      animalStats={animalStats}
                      animals={animals}
                      productionStats={productionStats}
                      selectedAnimalId={selectedAnimalId}
                    />
                    <Charts animals={animals} productionStats={productionStats} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="font-serif"> {/* Applied font-serif here */}
                <ActivityFeed
                  activities={activities}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
                <Button
                  onClick={() => navigate(`/animals/${selectedAnimalId}/activities`)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 shadow-md"
                >
                  <ActivityIcon className="h-4 w-4 mr-2" />
                  View All Activities
                </Button>
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView
                  calendarEvents={calendarEvents}
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsPanel
                  emailNotifications={emailNotifications}
                  setEmailNotifications={setEmailNotifications}
                  mobileNotifications={mobileNotifications}
                  setMobileNotifications={setMobileNotifications}
                />
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;