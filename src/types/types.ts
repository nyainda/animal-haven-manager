export interface UpdatedHealthFormData extends Omit<HealthFormData, 'allergies' | 'exercise_requirements' | 'notes' | 'parasite_prevention' | 'regular_medication' | 'last_vet_visit'> {
    allergies: string[];
    exercise_requirements: string[];
    notes: string[];
    parasite_prevention: string[];
    regular_medication: string[];
    medical_history: Record<string, string>;
    last_vet_visit: Date | undefined;
  }
  
  export interface FormSectionProps {
    formData: UpdatedHealthFormData;
    onUpdate: (updates: Partial<UpdatedHealthFormData>) => void;
  }