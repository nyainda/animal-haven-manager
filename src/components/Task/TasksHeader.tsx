import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Animal } from '@/types/AnimalTypes';

interface TasksHeaderProps {
  animal: Animal | null;
  loading: boolean;
  onBack: () => void;
  onAddTask: () => void;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({ animal, loading, onBack, onAddTask }) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full flex-shrink-0 h-10 w-10" 
              onClick={onBack} 
              disabled={!animal}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Back to {animal?.name || 'Animal'}'s Details</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-3">
          {loading && !animal ? (
            <Skeleton className="h-12 w-12 rounded-full" />
          ) : (
            <Avatar className="h-12 w-12 border">
              <AvatarFallback className="text-lg bg-muted">
                {animal?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {loading && !animal ? (
              <>
                <Skeleton className="h-6 w-40 mb-1.5" />
                <Skeleton className="h-4 w-60" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {animal?.name}'s Tasks
                </h1>
                <p className="text-sm text-muted-foreground">
                  View and manage tasks for {animal?.name}.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <Button onClick={onAddTask} disabled={loading || !animal} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add New Task
      </Button>
    </header>
  );
};