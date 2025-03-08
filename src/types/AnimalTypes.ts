
export interface Animal {
  id: string;
  internal_id: string;
  animal_id: string;
  name: string;
  type: string;
  breed: string;
  gender: 'male' | 'female' | 'unknown';
  birth_date: string;
  birth_time: string;
  tag_number: string;
  status: string;
  is_breeding_stock: boolean;
  age: number;
  is_deceased: boolean;
  next_checkup_date: string | null;
  birth_weight: number | null;
  weight_unit: string | null;
  birth_status: 'normal' | 'difficult' | 'ceasarean' | 'unknown';
  colostrum_intake: string | null;
  health_at_birth: 'healthy' | 'weak' | 'sick' | 'unknown';
  vaccinations: string[];
  milk_feeding: string | null;
  multiple_birth: boolean;
  birth_order: number | null;
  gestation_length: number | null;
  breeder_info: string | null;
  raised_purchased: 'raised' | 'purchased';
  birth_photos: string | null;
  physical_traits: string[];
  keywords: string[];
}

export interface AnimalFormData {
  name: string;
  type: string;
  breed: string;
  gender: 'male' | 'female' | 'unknown';
  birth_date: string;
  birth_time?: string;
  tag_number?: string;
  status?: string;
  is_breeding_stock?: boolean;
  is_deceased?: boolean;
  birth_weight?: number | null;
  weight_unit?: string | null;
  birth_status?: 'normal' | 'difficult' | 'ceasarean' | 'unknown';
  health_at_birth?: 'healthy' | 'weak' | 'sick' | 'unknown';
  multiple_birth?: boolean;
  raised_purchased?: 'raised' | 'purchased';
  physical_traits?: string[];
  keywords?: string[];
}

export const animalTypes = [
  'cattle',
  'sheep',
  'goat',
  'pig',
  'horse',
  'chicken',
  'duck',
  'rabbit',
  'other'
];

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' }
];

export const birthStatusOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'difficult', label: 'Difficult' },
  { value: 'ceasarean', label: 'Ceasarean' },
  { value: 'unknown', label: 'Unknown' }
];

export const healthAtBirthOptions = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'weak', label: 'Weak' },
  { value: 'sick', label: 'Sick' },
  { value: 'unknown', label: 'Unknown' }
];

export const raisedPurchasedOptions = [
  { value: 'raised', label: 'Raised' },
  { value: 'purchased', label: 'Purchased' }
];

export const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Deceased', label: 'Deceased' },
  { value: 'Transferred', label: 'Transferred' }
];
