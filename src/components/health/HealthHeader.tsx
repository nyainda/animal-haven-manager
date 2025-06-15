import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HealthHeaderProps {
  animalName: string;
  onBack: () => void;
  onAddHealthRecord: () => void;
}

export const HealthHeader: React.FC<HealthHeaderProps> = ({
  animalName,
  onBack,
  onAddHealthRecord
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={onBack}
              aria-label="Back to animal details"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Back to {animalName}'s Details</p>
          </TooltipContent>
        </Tooltip>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Health Records for {animalName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage health information for {animalName}.
          </p>
        </div>
      </div>
      <Button onClick={onAddHealthRecord} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Health Record
      </Button>
    </header>
  );
};