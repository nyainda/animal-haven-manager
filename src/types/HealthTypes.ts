export interface HealthRecord {
    Health_id: number;
    health_status: string;
    vaccination_status?: string;
    neutered_spayed: boolean;
    last_vet_visit?: string;
    dietary_restrictions?: string;
    medical_history?: Record<string, string>;
    regular_medication?: string[];
    notes?: string[];
    created_at: string;
  }
  
  export interface HealthCardProps {
    health: HealthRecord;
    animalId: string;
    onEdit: () => void;
    onDelete: () => void;
    onViewContent: (content: string, title: string) => void;
  }