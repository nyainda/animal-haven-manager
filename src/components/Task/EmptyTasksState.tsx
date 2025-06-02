import React from 'react';
import { Plus, Inbox, AlertTriangle, CheckSquare, TimerOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyTasksStateProps {
  activeTab: string;
  animalName?: string;
  onAddTask: () => void;
}

export const EmptyTasksState: React.FC<EmptyTasksStateProps> = ({ activeTab, animalName, onAddTask }) => {
  const getIcon = () => {
    switch (activeTab) {
      case 'pending': return <AlertTriangle className="h-10 w-10 text-amber-500" />;
      case 'completed': return <CheckSquare className="h-10 w-10 text-green-500" />;
      case 'overdue': return <TimerOff className="h-10 w-10 text-red-500" />;
      default: return <Inbox className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border-dashed border-border shadow-none mt-8">
      <CardContent className="py-12 flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-muted mb-4">
          {getIcon()}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">
          No {activeTab !== 'all' ? `${activeTab} ` : ''}Tasks Found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {activeTab === 'all'
            ? `There are currently no tasks scheduled for ${animalName ?? 'this animal'}. Add one!`
            : `No tasks match the filter "${activeTab}".`}
        </p>
        {activeTab === 'all' && (
          <Button onClick={onAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Task
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
