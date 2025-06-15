import React from 'react';
import { ArrayInputSection } from './ArrayInputSection';
import { UpdatedHealthFormData } from '@/types/types';

interface AdditionalInfoSectionProps {
  formData: UpdatedHealthFormData;
  inputValues: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
  onAdd: (field: string) => void;
  onRemove: (field: keyof UpdatedHealthFormData, item: string) => void;
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  formData,
  inputValues,
  onInputChange,
  onAdd,
  onRemove,
}) => {
  const fields = [
    { field: 'regular_medication', label: 'Regular Medication' },
    { field: 'exercise_requirements', label: 'Exercise Requirements' },
    { field: 'parasite_prevention', label: 'Parasite Prevention' },
    { field: 'allergies', label: 'Allergies' },
    { field: 'notes', label: 'Additional Notes' },
  ];

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-medium mb-3">Additional Information</h3>
      {fields.map(({ field, label }) => (
        <ArrayInputSection
          key={field}
          field={field as keyof UpdatedHealthFormData & keyof typeof inputValues}
          label={label}
          formData={formData}
          inputValues={inputValues}
          handleInputChange={onInputChange}
          handleAdd={onAdd}
          handleRemove={onRemove}
        />
      ))}
    </section>
  );
};