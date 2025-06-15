import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from "@/lib/utils";
import { FormSectionProps } from '@/types/types';

export const BasicInfoSection: React.FC<FormSectionProps> = ({ formData, onUpdate }) => {
  const handleDateSelect = (date: Date | undefined) => {
    onUpdate({ last_vet_visit: date });
  };

  const handleSwitchChange = (checked: boolean) => {
    onUpdate({ neutered_spayed: checked });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
      <div className="space-y-1.5">
        <Label htmlFor="last_vet_visit_trigger" className="text-sm font-medium">
          Last Vet Visit
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="last_vet_visit_trigger"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.last_vet_visit && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.last_vet_visit ? format(formData.last_vet_visit, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.last_vet_visit}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center space-x-3 pt-1.5 md:pt-7">
        <Label htmlFor="neutered_spayed" className="text-sm font-medium">
          Neutered/Spayed
        </Label>
        <Switch
          id="neutered_spayed"
          checked={formData.neutered_spayed}
          onCheckedChange={handleSwitchChange}
          name="neutered_spayed"
        />
      </div>
    </section>
  );
};
