import React from 'react';
import { Card } from '@/components/ui/card';
import { Task } from '@/services/taskApi';
import { getPriorityStyles, isTaskOverdue } from '../../utils/taskUtils';
import { TaskCardActions } from './TaskCardActions';
import { TaskCardHeader } from './TaskCardHeader';
import { TaskCardContent } from './TaskCardContent';

interface TaskCardProps {
  task: Task;
  animalId: string;
  onEdit: (taskId: string) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, animalId, onEdit, onDelete }) => {
  const isOverdue = isTaskOverdue(task);
  const { borderClass: priorityBorderClass } = getPriorityStyles(task.priority);

  return (
    <Card
      className={`group relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col h-full ${priorityBorderClass} ${
        isOverdue 
          ? 'border-t-destructive/60 border-r-destructive/60 border-b-destructive/60 bg-destructive/5 dark:bg-destructive/10' 
          : 'border-border'
      }`}
    >
      <TaskCardActions task={task} onEdit={onEdit} onDelete={onDelete} />
      <TaskCardHeader task={task} />
      <TaskCardContent task={task} />
    </Card>
  );
};