import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSectionProps } from '@/types/types';
import { UpdatedHealthFormData } from '@/types/types';

export const StatusSection: React.FC<FormSectionProps> = ({ formData, onUpdate }) => {
  const handleSelectChange = (field: keyof UpdatedHealthFormData) => (value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="health_status" className="text-sm font-medium">
          Health Status <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.health_status}
          onValueChange={handleSelectChange('health_status')}
          name="health_status"
        >
          <SelectTrigger id="health_status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {['Healthy', 'Sick', 'Recovering', 'Critical', 'Unknown'].map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="vaccination_status" className="text-sm font-medium">
          Vaccination Status <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.vaccination_status}
          onValueChange={handleSelectChange('vaccination_status')}
          name="vaccination_status"
        >
          <SelectTrigger id="vaccination_status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {['Up-to-date', 'Pending', 'Overdue', 'Not Applicable', 'Unknown'].map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
};
