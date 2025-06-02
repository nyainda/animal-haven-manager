import { useMemo } from 'react';
import { Task } from '@/services/taskApi';
import { isTaskOverdue } from '../utils/taskUtils';

export const useFilteredTasks = (tasks: Task[], activeTab: string) => {
  return useMemo(() => {
    const lowerCaseTab = activeTab.toLowerCase();
    if (lowerCaseTab === 'all') return tasks;
    if (lowerCaseTab === 'overdue') return tasks.filter(task => isTaskOverdue(task));
    return tasks.filter(task => task.status?.toLowerCase() === lowerCaseTab);
  }, [tasks, activeTab]);
};
