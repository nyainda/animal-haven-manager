import { parseISO, format, formatDistanceToNowStrict, isPast } from 'date-fns';
import { Task } from '@/services/taskApi';

export interface BadgeStyleProps {
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const getPriorityStyles = (priority?: string) => {
  const baseStyle: BadgeStyleProps = { bgClass: '', textClass: '', borderClass: '' };
  
  switch (priority?.toLowerCase()) {
    case 'high':
      return {
        borderClass: 'border-l-4 border-red-500',
        iconColorClass: 'text-red-500',
        badgeStyle: { ...baseStyle, bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-500' }
      };
    case 'medium':
      return {
        borderClass: 'border-l-4 border-amber-500',
        iconColorClass: 'text-amber-500',
        badgeStyle: { ...baseStyle, bgClass: 'bg-amber-100', textClass: 'text-amber-800', borderClass: 'border-amber-500' }
      };
    case 'low':
      return {
        borderClass: 'border-l-4 border-green-500',
        iconColorClass: 'text-green-500',
        badgeStyle: { ...baseStyle, bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' }
      };
    default:
      return {
        borderClass: 'border-l-4 border-gray-300 dark:border-gray-600',
        iconColorClass: 'text-gray-500',
        badgeStyle: { ...baseStyle, bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' }
      };
  }
};

export const getStatusBadgeStyle = (status?: string): BadgeStyleProps => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return { bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-500' };
    case 'pending':
      return { bgClass: 'bg-amber-100', textClass: 'text-amber-800', borderClass: 'border-amber-500' };
    case 'in progress':
      return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', borderClass: 'border-blue-500' };
    default:
      return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-500' };
  }
};

export const formatDateTime = (dateStr: string, timeStr: string): string => {
  try {
    const dateTime = parseISO(`${dateStr}T${timeStr || '00:00'}`);
    return format(dateTime, 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (dateStr: string): string => {
  try {
    return formatDistanceToNowStrict(parseISO(dateStr), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

export const isTaskOverdue = (task: Task): boolean => {
  if (!task.start_date || !task.start_time || task.status?.toLowerCase() === 'completed') return false;
  try {
    const dueDate = parseISO(`${task.start_date}T${task.start_time}`);
    return isPast(dueDate);
  } catch {
    return false;
  }
};