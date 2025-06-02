import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/services/taskApi';
import { getStatusBadgeStyle } from '../../utils/taskUtils';
import { TaskStatusIcon } from './TaskStatusIcon';

interface TaskCardContentProps {
  task: Task;
}

export const TaskCardContent: React.FC<TaskCardContentProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusStyle = getStatusBadgeStyle(task.status);
  const description = task.description || 'No description provided.';
  const isLongDescription = description.length > 150;

  return (
    <CardContent className="p-4 pt-2 pb-3 flex-grow">
      <div className="flex flex-wrap gap-2 mb-3">
        {task.task_type && (
          <Badge variant="secondary" className="text-xs font-medium">
            <Tag className="h-3 w-3 mr-1.5" />
            {task.task_type}
          </Badge>
        )}
        {task.status && (
          <Badge
            variant="outline"
            className={`text-xs font-medium flex items-center ${statusStyle.bgClass} ${statusStyle.textClass} ${statusStyle.borderClass}`}
          >
            <TaskStatusIcon status={task.status} />
            {task.status}
          </Badge>
        )}
      </div>

      <div>
        <p
          className={`text-sm text-foreground/90 whitespace-pre-wrap ${
            !task.description ? 'text-muted-foreground italic' : ''
          } ${!isExpanded && isLongDescription ? 'line-clamp-3' : ''}`}
        >
          {description}
        </p>
        {isLongDescription && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 mt-1 text-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </Button>
        )}
      </div>
    </CardContent>
  );
};
