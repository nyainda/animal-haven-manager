import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from "@/lib/utils";
import { FormSectionProps } from '@/types/types';
import { formatDateToYMDString } from '@/utils/health';

export const MedicalHistorySection: React.FC<FormSectionProps> = ({ formData, onUpdate }) => {
  const [medicalHistoryDate, setMedicalHistoryDate] = useState<Date | undefined>(undefined);
  const [medicalHistoryNote, setMedicalHistoryNote] = useState('');

  const addMedicalHistory = () => {
    const dateString = formatDateToYMDString(medicalHistoryDate);
    const note = medicalHistoryNote.trim();

    if (dateString && note) {
      if (formData.medical_history[dateString]) {
        toast.warning(`Entry for ${dateString} already exists. Update manually if needed.`);
        return;
      }
      onUpdate({
        medical_history: {
          ...formData.medical_history,
          [dateString]: note,
        }
      });
      setMedicalHistoryDate(undefined);
      setMedicalHistoryNote('');
    } else {
      toast.info("Please select a date and enter a note for the medical history entry.");
    }
  };

  const removeMedicalHistory = (date: string) => {
    const { [date]: removed, ...rest } = formData.medical_history;
    onUpdate({ medical_history: rest });
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Medical History</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="medicalHistoryDateTrigger" className="text-sm">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="medicalHistoryDateTrigger"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !medicalHistoryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {medicalHistoryDate ? format(medicalHistoryDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={medicalHistoryDate}
                onSelect={setMedicalHistoryDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="medicalHistoryNote" className="text-sm">Note</Label>
          <Input
            id="medicalHistoryNote"
            value={medicalHistoryNote}
            onChange={e => setMedicalHistoryNote(e.target.value)}
            placeholder="Condition, treatment, etc."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMedicalHistory();
              }
            }}
          />
        </div>
        
        <Button
          type="button"
          onClick={addMedicalHistory}
          variant="outline"
          size="sm"
        >
          Add Entry
        </Button>
      </div>

      {Object.keys(formData.medical_history).length > 0 && (
        <div className="mt-4 space-y-2 border rounded-md p-3 bg-muted/20">
          {Object.entries(formData.medical_history)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([date, note]) => (
              <div
                key={date}
                className="flex items-center justify-between p-2 border-b last:border-b-0"
              >
                <p className="text-sm flex-1 mr-4">
                  <strong className="font-medium">{date}:</strong> {note}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedicalHistory(date)}
                  className="text-destructive hover:text-destructive/80 h-7 px-2"
                  aria-label={`Remove history entry for ${date}`}
                >
                  Remove
                </Button>
              </div>
            ))}
        </div>
      )}
    </section>
  );
};