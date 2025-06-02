import React from 'react';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

interface TaskStatusIconProps {
  status?: string;
}

export const TaskStatusIcon: React.FC<TaskStatusIconProps> = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return <CheckCircle2 className="h-3 w-3 mr-1" />;
    case 'pending':
      return <Clock className="h-3 w-3 mr-1" />;
    case 'in progress':
      return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
    default:
      return <XCircle className="h-3 w-3 mr-1" />;
  }
};

// components/TaskCardActions.tsx

