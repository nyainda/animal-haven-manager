import { DollarSign, Wallet, Layers, Activity, Tag } from 'lucide-react';

// Status badge color mapping
export const getStatusColor = (status: string | null | undefined): string => {
  const normalizedStatus = status?.toLowerCase()?.trim() || 'unknown';
  const statusMap: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/60',
    pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/60',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/60',
    canceled: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/60',
    processing: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/60',
    refunded: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/60',
    unknown: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/60',
  };
  return statusMap[normalizedStatus] || statusMap.unknown;
};

// Transaction type badge color mapping
export const getTypeColor = (type: string): string => {
  const typeMap: Record<string, string> = {
    sale: 'from-blue-500 to-blue-600',
    purchase: 'from-emerald-500 to-emerald-600',
    transfer: 'from-amber-500 to-amber-600',
    service: 'from-purple-500 to-purple-600',
  };
  return typeMap[type.toLowerCase()] || 'from-gray-500 to-gray-600';
};

// Transaction type icon mapping
export const getTypeIcon = (type: string): JSX.Element => {
  const typeMap: Record<string, JSX.Element> = {
    sale: <DollarSign className="h-4 w-4" />,
    purchase: <Wallet className="h-4 w-4" />,
    transfer: <Layers className="h-4 w-4" />,
    service: <Activity className="h-4 w-4" />,
  };
  return typeMap[type.toLowerCase()] || <Tag className="h-4 w-4" />;
};