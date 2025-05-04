import React, { useState, useEffect, FC } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchAnimals, createAnimal } from '@/services/animalService';
import { fetchProductionStatistics, ProductionStatistics } from '@/services/animalProductionApi';
import { fetchActivities, createActivity, Activity, ActivityFormData } from '@/services/ActivityApi';
import { createNote, Note, NoteFormData } from '@/services/noteApi';
import { createTask, Task, TaskFormData } from '@/services/taskApi';
import { Animal, HealthStatistics, ReproductiveStatistics, GrowthStatistics } from '@/types/AnimalTypes';
import { CalendarEvent, Notification, AnimalStatsData, DashboardActivity } from '../types/DashboardTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, CalendarIcon, ActivityIcon, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { parseISO, differenceInYears, addDays } from 'date-fns';

import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ActionCards from '@/components/dashboard/ActionCards';
import AnimalStats from '@/components/dashboard/AnimalStats';
import Charts from '@/components/dashboard/Charts';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CalendarView from '@/components/dashboard/CalendarView';
import SettingsPanel from '@/components/dashboard/SettingsPanel';

// Define AnimalFormData based on createAnimal requirements
interface AnimalFormData {
  name: string;
  type: string;
  birth_date: string;
  is_breeding_stock: boolean;
  [key: string]: any; 
}

const Dashboard: FC = () => {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [productionStats, setProductionStats] = useState<ProductionStatistics | null>(null);
  const [animalStats, setAnimalStats] = useState<AnimalStatsData | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStatistics | null>(null);
  const [reproStats, setReproStats] = useState<ReproductiveStatistics | null>(null);
  const [growthStats, setGrowthStats] = useState<GrowthStatistics | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mobileNotifications, setMobileNotifications] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Compute health stats
  const computeHealthStats = (animals: Animal[]): HealthStatistics => {
    const healthyAnimals = animals.filter(a => a.status === 'Healthy' && !a.is_deceased).length;
    const animalsRequiringCheckup = animals.filter(
      a => a.next_checkup_date && new Date(a.next_checkup_date) <= new Date()
    ).length;

    return {
      vaccination_rate: animals.filter(a => a.vaccinations && a.vaccinations.length > 0).length / (animals.length || 1) * 100,
      health_incidents: animals.filter(a => a.status === 'Sick').length,
      animals_requiring_checkup: animalsRequiringCheckup,
      healthy_animals: healthyAnimals,
    };
  };

  // Compute reproductive stats
  const computeReproStats = (animals: Animal[]): ReproductiveStatistics => {
    return {
      breeding_success_rate: 0,
      average_gestation: 0,
      successful_births: animals.filter(a => a.multiple_birth).length,
      failed_births: 0,
    };
  };

  // Compute growth stats
  const computeGrowthStats = (animals: Animal[]): GrowthStatistics => {
    const weightByAgeGroup = animals.reduce((acc, animal) => {
      if (animal.birth_weight && animal.age !== undefined) {
        const ageGroup = animal.age <= 1 ? '0-1 year' : animal.age <= 2 ? '1-2 years' : '2+ years';
        acc[ageGroup] = (acc[ageGroup] || 0) + animal.birth_weight;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      average_weight_gain: 0,
      weight_by_age_group: weightByAgeGroup,
    };
  };

  // Handle activity creation
  const handleActivityCreated = async (animalId: string, activityData: ActivityFormData) => {
    try {
      const newActivity = await createActivity(animalId, activityData);
      const dashboardActivity: DashboardActivity = {
        id: newActivity.id,
        type: 'activity',
        description: `Activity: ${newActivity.description}`,
        timestamp: newActivity.created_at,
        animalId: newActivity.animal_id,
        activityType: newActivity.activity_type,
        status: 'pending',
      };
      
      setActivities(prev => [dashboardActivity, ...prev]);
      
      if (newActivity.activity_date) {
        setCalendarEvents(prev => [
          ...prev,
          {
            id: newActivity.id,
            title: `Activity: ${newActivity.description.substring(0, 20)}...`,
            date: new Date(newActivity.activity_date),
            type: 'activity',
            animalId: newActivity.animal_id,
            activityType: newActivity.activity_type,
            status: 'pending',
          },
        ]);
      }
      
      setNotifications(prev => [
        {
          id: `activity-${newActivity.id}`,
          content: `New activity created for ${animals.find(a => a.id === newActivity.animal_id)?.name || 'animal'}: ${newActivity.activity_type}`,
          time: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Failed to create activity:', error);
      toast.error('Failed to create activity');
    }
  };

  // Handle note creation
  const handleNoteCreated = async (animalId: string, noteData: NoteFormData) => {
    try {
      const newNote = await createNote(animalId, noteData);
      const newActivity: DashboardActivity = {
        id: newNote.notes_id,
        type: 'note',
        description: `Note added: ${newNote.content}`,
        timestamp: newNote.created_at,
        animalId: newNote.animal_id,
        category: newNote.category,
        priority: newNote.priority,
        status: newNote.status,
      };
      setActivities(prev => [newActivity, ...prev]);
      if (newNote.add_to_calendar) {
        setCalendarEvents(prev => [
          ...prev,
          {
            id: newNote.notes_id,
            title: `Note: ${newNote.content.substring(0, 20)}...`,
            date: new Date(newNote.due_date),
            type: 'note',
            animalId: newNote.animal_id,
            priority: newNote.priority,
            status: newNote.status,
          },
        ]);
      }
      setNotifications(prev => [
        {
          id: `note-${newNote.notes_id}`,
          content: `New note added for ${animals.find(a => a.id === newNote.animal_id)?.name || 'animal'}`,
          time: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  };

  // Handle task creation
  const handleTaskCreated = async (animalId: string, taskData: TaskFormData) => {
    try {
      const newTask = await createTask(animalId, taskData);
      const newActivity: DashboardActivity = {
        id: newTask.task_id,
        type: 'task',
        description: `Task created: ${newTask.title}`,
        timestamp: newTask.created_at,
        animalId: newTask.animal_id,
        taskType: newTask.task_type,
        priority: newTask.priority,
        status: newTask.status,
      };
      setActivities(prev => [newActivity, ...prev]);
      setCalendarEvents(prev => [
        ...prev,
        {
          id: newTask.task_id,
          title: `Task: ${newTask.title.substring(0, 20)}...`,
          date: new Date(newTask.start_date),
          time: newTask.start_time,
          type: 'task',
          animalId: newTask.animal_id,
          priority: newTask.priority,
          status: newTask.status,
          taskType: newTask.task_type,
        },
      ]);
      setNotifications(prev => [
        {
          id: `task-${newTask.task_id}`,
          content: `New task created for ${animals.find(a => a.id === newTask.animal_id)?.name || 'animal'}`,
          time: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  // Handle animal creation with notification
  const handleCreateAnimal = async (animalData: AnimalFormData) => {
    try {
      const newAnimal = await createAnimal(animalData);
      setAnimals(prev => [...prev, newAnimal]);
      setNotifications(prev => [
        {
          id: `animal-${newAnimal.id}`,
          content: `New animal added: ${newAnimal.name} (${newAnimal.type})`,
          time: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
      toast.success('Animal created successfully');
      const updatedAnimals = [...animals, newAnimal];
      setAnimalStats({
        totalAnimals: updatedAnimals.length,
        mostCommonType: Object.entries(
          updatedAnimals.reduce((acc: Record<string, number>, animal) => {
            acc[animal.type] = (acc[animal.type] || 0) + 1;
            return acc;
          }, {})
        ).reduce((a, b) => (b[1] > a[1] ? b : a), ['N/A', 0])[0],
        averageAge:
updatedAnimals.reduce((sum, animal) => {
  if (animal.age) return sum + animal.age;
  if (animal.birth_date) {
    const birthDate = parseISO(animal.birth_date);
    return sum + differenceInYears(new Date(), birthDate);
  }
  return sum;
}, 0) / (updatedAnimals.length || 1),
        breedingStockCount: updatedAnimals.filter(animal => animal.is_breeding_stock).length,
      });
      setHealthStats(computeHealthStats(updatedAnimals));
      setReproStats(computeReproStats(updatedAnimals));
      setGrowthStats(computeGrowthStats(updatedAnimals));
    } catch (error) {
      console.error('Failed to create animal:', error);
      toast.error('Failed to create animal');
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated || authLoading) return;

      setDataLoading(true);
      try {
        const animalList = await fetchAnimals();
        setAnimals(animalList);

        const events: CalendarEvent[] = animalList.flatMap((animal) =>
          animal.next_checkup_date
            ? [
                {
                  id: `${animal.id}-checkup`,
                  title: `${animal.name} Checkup`,
                  date: new Date(animal.next_checkup_date),
                  type: 'appointment',
                  animalId: animal.id,
                },
              ]
            : []
        );
        events.push(
          {
            id: 'mock-1',
            title: 'Team Meeting',
            date: addDays(new Date(), 2),
            type: 'meeting',
          },
          {
            id: 'mock-2',
            title: 'Production Review',
            date: addDays(new Date(), 3),
            type: 'production',
          }
        );
        setCalendarEvents(events);

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

          setHealthStats(computeHealthStats(animalList));
          setReproStats(computeReproStats(animalList));
          setGrowthStats(computeGrowthStats(animalList));

          setSelectedAnimalId(animalList[0].id);
          localStorage.setItem('dashboard_animals', JSON.stringify(animalList));
          localStorage.setItem('dashboard_animalStats', JSON.stringify({
            totalAnimals: animalList.length,
            mostCommonType,
            averageAge,
            breedingStockCount,
          }));

          const initialActivities = await fetchActivities(animalList[0].id);
          setActivities(initialActivities.map(activity => ({
            id: activity.id,
            type: 'activity',
            description: `Activity: ${activity.description}`,
            timestamp: activity.created_at,
            animalId: activity.animal_id,
            activityType: activity.activity_type,
            status: 'pending',
          })));
          localStorage.setItem(`dashboard_activities_${animalList[0].id}`, JSON.stringify(initialActivities));
        } else {
          setAnimalStats({
            totalAnimals: 0,
            mostCommonType: 'N/A',
            averageAge: 0,
            breedingStockCount: 0,
          });
          setHealthStats(computeHealthStats([]));
          setReproStats(computeReproStats([]));
          setGrowthStats(computeGrowthStats([]));
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
        setHealthStats(computeHealthStats([]));
        setReproStats(computeReproStats([]));
        setGrowthStats(computeGrowthStats([]));
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

  // Fetch production stats and activities
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAnimalId || !isAuthenticated || authLoading) {
        setProductionStats(null);
        setActivities([]);
        return;
      }

      try {
        const stats = await fetchProductionStatistics(selectedAnimalId);
        setProductionStats(stats);
        localStorage.setItem(`productionStats_${selectedAnimalId}`, JSON.stringify(stats));

        const animalActivities = await fetchActivities(selectedAnimalId);
        setActivities(animalActivities.map(activity => ({
          id: activity.id,
          type: 'activity',
          description: `Activity: ${activity.description}`,
          timestamp: activity.created_at,
          animalId: activity.animal_id,
          activityType: activity.activity_type,
          status: 'pending',
        })));
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

  // Map DashboardActivity to Activity for ActivityFeed
  const mapToActivity = (dashboardActivity: DashboardActivity): Activity => ({
    id: dashboardActivity.id,
    animal_id: dashboardActivity.animalId || '',
    activity_type: dashboardActivity.activityType || 'custom',
    activity_date: dashboardActivity.timestamp,
    description: dashboardActivity.description,
    created_at: dashboardActivity.timestamp,
    updated_at: dashboardActivity.timestamp,
    notes: dashboardActivity.category, // Optional: map category to notes
    breeding_date: undefined, // Adjust based on your needs
    breeding_notes: undefined, // Adjust based on your needs
  });

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
                    <p className="text-sm font-sans text-muted-foreground dark:text-muted-foreground mb-4 mt-2 max-w-md mx-auto">
                      It looks like you don’t have any animals yet. Add some animals to start tracking statistics and production data.
                    </p>
                    <Button 
                      onClick={() => {
                        handleCreateAnimal({
                          name: 'New Animal',
                          type: 'Cow',
                          birth_date: new Date().toISOString(),
                          is_breeding_stock: false,
                        });
                      }}
                      className="font-sans bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 sm:h-12"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Animal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <Select
                        value={selectedAnimalId || ''}
                        onValueChange={setSelectedAnimalId}
                      >
                        <SelectTrigger className="w-full max-w-md">
                          <SelectValue placeholder="Select an animal" />
                        </SelectTrigger>
                        <SelectContent>
                          {animals.map(animal => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.name} ({animal.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <ActionCards setActiveTab={setActiveTab} selectedAnimalId={selectedAnimalId} />
                    <AnimalStats
                      animalStats={animalStats}
                      animals={animals}
                      productionStats={productionStats}
                      selectedAnimalId={selectedAnimalId}
                      healthStats={healthStats}
                      reproStats={reproStats}
                      growthStats={growthStats}
                    />
                    <Charts animals={animals} productionStats={productionStats} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="font-sans">
                <ActivityFeed
                  activities={activities.map(mapToActivity)}
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
                  animals={animals}
                  onNoteCreated={handleNoteCreated}
                  onTaskCreated={handleTaskCreated}
                  onActivityCreated={handleActivityCreated}
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
function beforeEach(callback: () => void): void {
  try {
    callback();
  } catch (error) {
    console.error('Error in beforeEach:', error);
  }
}
