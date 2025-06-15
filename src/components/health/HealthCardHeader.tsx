import React from 'react';
import { Calendar } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { HealthStatusRing } from './HealthStatusRing';
import { HealthRecord } from '@/types/HealthTypes';

interface HealthCardHeaderProps {
  health: HealthRecord;
}

export const HealthCardHeader: React.FC<HealthCardHeaderProps> = ({ health }) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return { text: 'text-green-600' };
      case 'sick':
        return { text: 'text-red-600' };
      case 'recovering':
        return { text: 'text-yellow-600' };
      case 'critical':
        return { text: 'text-orange-600' };
      default:
        return { text: 'text-gray-600' };
    }
  };

  const statusStyle = getStatusStyle(health.health_status);

  return (
    <CardHeader className="p-4 pb-2 flex items-center gap-4">
      <HealthStatusRing status={health.health_status} />
      
      <div className="flex-1">
        <CardTitle className={`text-lg font-semibold ${statusStyle.text} group-hover:text-primary transition-colors`}>
          {health.health_status}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground flex gap-x-3 gap-y-1 flex-wrap mt-1">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Created {formatDistanceToNow(new Date(health.created_at), { addSuffix: true })}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Creation Date</TooltipContent>
          </Tooltip>
          {health.vaccination_status && (
            <Badge variant="secondary" className="text-xs">
              {health.vaccination_status}
            </Badge>
          )}
        </CardDescription>
      </div>
    </CardHeader>
  );
};