import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Plus, Dog, DollarSign, CalendarIcon, Truck, 
  PiggyBank, CheckSquare, FileText 
} from 'lucide-react';
import { toast } from 'sonner';
interface ActionCardsProps {
  setActiveTab: (tab: string) => void;
  selectedAnimalId?: string | null;
}

const ActionCards: React.FC<ActionCardsProps> = ({ setActiveTab, selectedAnimalId }) => {
  const navigate = useNavigate();

  // Quick Actions definition using { label, href, icon } structure
  const quickActions = [
    { 
      label: 'Add New Animal', 
      href: '/animals/new', 
      icon: Plus, 
      description: 'Create a new animal record' 
    },
    { 
      label: 'View Animals', 
      href: '/animals', 
      icon: Dog, 
      description: 'Manage your animal list' 
    },
    { 
      label: 'Manage Suppliers', 
      href: selectedAnimalId ? `/animals/${selectedAnimalId}/suppliers` : '/animals', 
      icon: Truck, 
      description: 'View or add suppliers' 
    },
    { 
      label: 'Manage Production', 
      href: selectedAnimalId ? `/animals/${selectedAnimalId}/production` : '/animals', 
      icon: PiggyBank, 
      description: 'Track production records' 
    },
    { 
      label: 'Create Task', 
      href: selectedAnimalId ? `/animals/${selectedAnimalId}/tasks/new` : '/animals', 
      icon: CheckSquare, 
      description: 'Add a new task' 
    },
    { 
      label: 'Add Notes', 
      href: selectedAnimalId ? `/animals/${selectedAnimalId}/notes/new` : '/animals', 
      icon: FileText, 
      description: 'Record new notes' 
    },
    { 
      label: 'Export Data', 
      href: '#', // Placeholder; no route yet
      icon: DollarSign, 
      description: 'Download animal data as CSV', 
      onClick: () => toast.info('Export feature coming soon') // Override for toast
    },
    { 
      label: 'Schedule Event', 
      href: '#', // Placeholder; uses tab switch
      icon: CalendarIcon, 
      description: 'Add an event to your calendar', 
      onClick: () => setActiveTab('calendar') // Override for tab switch
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-6">
      {quickActions.map((action) => (
        <Card
          key={action.label}
          className="border-border shadow-md cursor-pointer hover:shadow-lg transition-shadow bg-card dark:bg-card"
          onClick={action.onClick || (() => navigate(action.href))} // Use onClick if provided, else navigate
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-serif font-medium text-foreground dark:text-foreground">
              <action.icon className="h-5 w-5 mr-2 text-primary dark:text-primary" />
              {action.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-sans text-muted-foreground dark:text-muted-foreground">
              {action.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActionCards;