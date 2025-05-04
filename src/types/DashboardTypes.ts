export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    time?: string;
    type: 'appointment' | 'note' | 'task' | 'meeting' | 'production' | 'activity';
    animalId?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'completed' | 'archived';
    taskType?: string;
    activityType?: string;
  }
  
  export interface Notification {
    id: string;
    content: string;
    time: string;
    read: boolean;
  }
  
  export interface AnimalStatsData {
    totalAnimals: number;
    mostCommonType: string;
    averageAge: number;
    breedingStockCount: number;
  }
  
  export interface DashboardActivity {
    id: string;
    type: 'checkup' | 'note' | 'task' | 'production' | 'activity';
    description: string;
    timestamp: string;
    animalId?: string;
    category?: string;
    taskType?: string;
    activityType?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'completed' | 'archived';
  }