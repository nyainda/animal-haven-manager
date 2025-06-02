import { useMemo } from 'react';
import { Task } from '@/services/taskApi';
import { isTaskOverdue } from '../utils/taskUtils';

export const useTaskCounts = (tasks: Task[]) => {
  return useMemo(() => {
    const counts = { all: tasks.length, pending: 0, completed: 0, overdue: 0 };
    tasks.forEach(task => {
      const status = task.status?.toLowerCase();
      if (status === 'pending') counts.pending++;
      if (status === 'completed') counts.completed++;
      if (isTaskOverdue(task)) counts.overdue++;
    });
    return counts;
  }, [tasks]);
};