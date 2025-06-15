import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionProps, UpdatedHealthFormData } from '@/types/types';

export const DetailsSection: React.FC<FormSectionProps> = ({ formData, onUpdate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const fields = [
    { name: 'dietary_restrictions', label: 'Dietary Restrictions' },
    { name: 'insurance_details', label: 'Insurance Details' },
    { name: 'vaccinations', label: 'Vaccination Details / History' },
  ];

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-medium mb-3">Details</h3>
      {fields.map(field => (
        <div key={field.name} className="space-y-1.5">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
          </Label>
          <Textarea
            id={field.name}
            name={field.name}
            value={formData[field.name as keyof UpdatedHealthFormData] as string}
            onChange={handleChange}
            rows={3}
            className="resize-y min-h-[80px]"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        </div>
      ))}
    </section>
  );
};