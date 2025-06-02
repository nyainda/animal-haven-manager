import React from 'react';
import { Calendar, Clock, BarChart3, AlertTriangle } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Task } from '@/services/taskApi';
import { formatDateTime, formatRelativeTime, getPriorityStyles, isTaskOverdue } from '../../utils/taskUtils';

interface TaskCardHeaderProps {
  task: Task;
}

export const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({ task }) => {
  const isOverdue = isTaskOverdue(task);
  const { iconColorClass: priorityIconColor } = getPriorityStyles(task.priority);

  return (
    <CardHeader className="p-4 pb-3">
      <div className="flex justify-between items-start gap-2 mb-1">
        <CardTitle className="text-base font-semibold leading-tight pr-8 group-hover:text-primary transition-colors">
          {task.title || "Untitled Task"}
        </CardTitle>
        {task.priority && (
          <Tooltip>
            <TooltipTrigger>
              <BarChart3 className={`h-4 w-4 flex-shrink-0 ${priorityIconColor} transform rotate-90`} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{task.priority} Priority</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <CardDescription className="text-xs text-muted-foreground flex items-center gap-x-3 gap-y-1 flex-wrap">
        <Tooltip>
          <TooltipTrigger className="flex items-center cursor-default">
            <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>{formatDateTime(task.start_date, task.start_time)}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">Due Date & Time</TooltipContent>
        </Tooltip>
        <span className="text-muted-foreground/50 hidden sm:inline">•</span>
        <Tooltip>
          <TooltipTrigger className="flex items-center cursor-default">
            <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>Created {formatRelativeTime(task.created_at)}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">Creation Date</TooltipContent>
        </Tooltip>
      </CardDescription>
      {isOverdue && (
        <Badge variant="destructive" className="mt-2 text-xs w-fit">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Past Due
        </Badge>
      )}
    </CardHeader>
  );
};