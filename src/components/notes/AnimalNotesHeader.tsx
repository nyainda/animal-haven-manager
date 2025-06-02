import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Animal } from '@/types/AnimalTypes';

interface AnimalNotesHeaderProps {
  animal: Animal;
  onBack: () => void;
  onAddNote: () => void;
}

const AnimalNotesHeader: React.FC<AnimalNotesHeaderProps> = ({ animal, onBack, onAddNote }) => (
  <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full flex-shrink-0 h-10 w-10"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Back to {animal.name}'s Details</p>
        </TooltipContent>
      </Tooltip>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Notes for {animal.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage notes for {animal.name}.
        </p>
      </div>
    </div>
    <Button onClick={onAddNote} className="w-full sm:w-auto">
      <Plus className="mr-2 h-4 w-4" />
      Add Note
    </Button>
  </header>
);

export default AnimalNotesHeader;