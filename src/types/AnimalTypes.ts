// AnimalTypes.ts
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
  birth_status: 'normal' | 'difficult' | 'cesarean' | 'unknown';
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
  internal_id: string;
  breed: string;
  gender: 'male' | 'female' | 'unknown';
  birth_date: string;
  birth_time: string; // Required to match Animal and UI
  tag_number?: string;
  status?: string;
  is_breeding_stock?: boolean;
  is_deceased?: boolean;
  birth_weight?: number | null;
  weight_unit?: string | null;
  birth_status?: 'normal' | 'difficult' | 'cesarean' | 'unknown';
  colostrum_intake?: string | null;
  health_at_birth?: 'healthy' | 'weak' | 'sick' | 'unknown';
  vaccinations?: string[];
  milk_feeding?: string | null;
  multiple_birth?: boolean;
  birth_order?: number | null;
  gestation_length?: number | null;
  breeder_info?: string | null;
  raised_purchased?: 'raised' | 'purchased';
  birth_photos?: string | null;
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

export const breedsByType: Record<string, string[]> = {
  cattle: ['Angus', 'Hereford', 'Holstein', 'Jersey', 'Limousin', 'Simmental', 'Charolais', 'Brahman', 'Other'],
  sheep: ['Merino', 'Suffolk', 'Dorper', 'Romney', 'Dorset', 'Texel', 'Border Leicester', 'Corriedale', 'Other'],
  goat: ['Boer', 'Alpine', 'Saanen', 'Nubian', 'LaMancha', 'Toggenburg', 'Angora', 'Nigerian Dwarf', 'Other'],
  pig: ['Duroc', 'Hampshire', 'Yorkshire', 'Landrace', 'Berkshire', 'Pietrain', 'Spot', 'Tamworth', 'Other'],
  horse: ['Thoroughbred', 'Arabian', 'Quarter Horse', 'Appaloosa', 'Morgan', 'Clydesdale', 'Percheron', 'Standardbred', 'Other'],
  chicken: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Orpington', 'Sussex', 'Wyandotte', 'Brahma', 'Australorp', 'Other'],
  duck: ['Pekin', 'Muscovy', 'Mallard', 'Indian Runner', 'Call Duck', 'Rouen', 'Cayuga', 'Swedish', 'Other'],
  rabbit: ['New Zealand', 'Californian', 'Rex', 'Dutch', 'Flemish Giant', 'Mini Lop', 'Angora', 'Netherland Dwarf', 'Other'],
  other: ['Custom Breed']
};

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' }
];

export const birthStatusOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'difficult', label: 'Difficult' },
  { value: 'cesarean', label: 'Cesarean' },
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
  { value: 'Butchered', label: 'Butchered' },
  { value: 'Culled', label: 'Culled' },
  { value: 'Deceased', label: 'Deceased' },
  { value: 'Dry', label: 'Dry' },
  { value: 'Finishing', label: 'Finishing' },
  { value: 'For Sale', label: 'For Sale' },
  { value: 'Lactating', label: 'Lactating' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Off Farm', label: 'Off Farm' },
  { value: 'Quarantined', label: 'Quarantined' },
  { value: 'Reference', label: 'Reference' },
  { value: 'Sick', label: 'Sick' },
  { value: 'Healthy', label: 'Healthy' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Weaning', label: 'Weaning' },
  { value: 'Archived', label: 'Archived' },
  { value: 'Pending Approval', label: 'Pending Approval' },
  { value: 'Retired', label: 'Retired' },
  { value: 'In Reproduction', label: 'In Reproduction' },
  { value: 'In Transit', label: 'In Transit' },
  { value: 'Awaiting Adoption', label: 'Awaiting Adoption' },
  { value: 'Ready for Breeding', label: 'Ready for Breeding' },
  { value: 'In Training', label: 'In Training' },
  { value: 'Recovering', label: 'Recovering' },
  { value: 'On Display', label: 'On Display' },
  { value: 'Under Evaluation', label: 'Under Evaluation' },
];

export const weightUnits = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' }
];