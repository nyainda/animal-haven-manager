import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'in_progress';

interface TransactionStatusBadgeProps {
  status: TransactionStatus | null;
  className?: string;
}

const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  className,
}) => {
  if (!status) return null;

  const variants: Record<TransactionStatus, string> = {
    completed: "bg-green-100 text-green-800 hover:bg-green-200",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
    in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  };

  const labels: Record<TransactionStatus, string> = {
    completed: "Completed",
    pending: "Pending",
    cancelled: "Cancelled",
    in_progress: "In Progress",
  };

  return (
    <Badge className={cn(variants[status], className)}>
      {labels[status]}
    </Badge>
  );
};

export default TransactionStatusBadge;