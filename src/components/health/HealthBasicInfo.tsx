import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, isValid, differenceInDays } from 'date-fns';
import { HealthRecord } from '@/types/HealthTypes';

interface HealthBasicInfoProps {
  health: HealthRecord;
}

export const HealthBasicInfo: React.FC<HealthBasicInfoProps> = ({ health }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return 'Not specified';
    }
  };

  const daysSinceVetVisit = health.last_vet_visit
    ? differenceInDays(new Date(), new Date(health.last_vet_visit))
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Neutered/Spayed</span>
        <Badge variant="outline" className="text-xs font-medium">
          {health.neutered_spayed ? 'Yes' : 'No'}
        </Badge>
      </div>
      {health.last_vet_visit && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Vet Visit</span>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className={`text-xs font-medium transition-transform duration-300 hover:scale-105 ${
                  daysSinceVetVisit && daysSinceVetVisit > 365 ? 'border-red-400 text-red-600' : ''
                }`}
              >
                {formatDate(health.last_vet_visit)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {daysSinceVetVisit
                ? `${daysSinceVetVisit} days since last visit`
                : 'Vet visit date'}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};