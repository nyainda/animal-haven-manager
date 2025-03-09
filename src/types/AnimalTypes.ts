
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
  birth_status?: 'normal' | 'difficult' | 'cesarean' | 'unknown';
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
  'alpaca',
  'llama',
  'donkey',
  'buffalo',
  'deer',
  'other'
];

export const breedsByType: Record<string, string[]> = {
  cattle: [
    'Angus', 'Hereford', 'Holstein', 'Jersey', 'Limousin', 'Simmental', 
    'Charolais', 'Brahman', 'Galloway', 'Highland', 'Shorthorn', 
    'Texas Longhorn', 'Belted Galloway', 'Dexter', 'Other'
  ],
  sheep: [
    'Merino', 'Suffolk', 'Dorper', 'Romney', 'Dorset', 'Texel', 
    'Border Leicester', 'Corriedale', 'Jacob', 'Cheviot', 'Hampshire',
    'Polypay', 'Rambouillet', 'Southdown', 'Katahdin', 'Other'
  ],
  goat: [
    'Boer', 'Alpine', 'Saanen', 'Nubian', 'LaMancha', 'Toggenburg', 
    'Angora', 'Nigerian Dwarf', 'Kiko', 'Spanish', 'Pygmy',
    'Oberhasli', 'Sable', 'Kinder', 'Myotonic', 'Other'
  ],
  pig: [
    'Duroc', 'Hampshire', 'Yorkshire', 'Landrace', 'Berkshire', 'Pietrain', 
    'Spot', 'Tamworth', 'Gloucestershire Old Spot', 'Large Black',
    'Kunekune', 'Mangalitsa', 'Mulefoot', 'Red Wattle', 'Other'
  ],
  horse: [
    'Thoroughbred', 'Arabian', 'Quarter Horse', 'Appaloosa', 'Morgan', 
    'Clydesdale', 'Percheron', 'Standardbred', 'Andalusian', 'Friesian',
    'Tennessee Walker', 'Mustang', 'Haflinger', 'Belgian', 'Other'
  ],
  chicken: [
    'Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Orpington', 'Sussex', 
    'Wyandotte', 'Brahma', 'Australorp', 'Silkie', 'Cochin', 'Marans',
    'Polish', 'Easter Egger', 'Ameraucana', 'New Hampshire', 'Other'
  ],
  duck: [
    'Pekin', 'Muscovy', 'Mallard', 'Indian Runner', 'Call Duck', 
    'Rouen', 'Cayuga', 'Swedish', 'Magpie', 'Welsh Harlequin',
    'Saxony', 'Khaki Campbell', 'Blue Swedish', 'Silver Appleyard', 'Other'
  ],
  rabbit: [
    'New Zealand', 'Californian', 'Rex', 'Dutch', 'Flemish Giant', 
    'Mini Lop', 'Angora', 'Netherland Dwarf', 'Holland Lop', 'English Spot',
    'Belgian Hare', 'American Chinchilla', 'Jersey Wooly', 'Lionhead', 'Other'
  ],
  alpaca: [
    'Huacaya', 'Suri', 'Mixed', 'Other'
  ],
  llama: [
    'Classic', 'Wooly', 'Silky', 'Standard', 'Other'
  ],
  donkey: [
    'Standard', 'Miniature', 'Mammoth', 'Spotted Ass', 'Other'
  ],
  buffalo: [
    'Water Buffalo', 'Cape Buffalo', 'American Bison', 'Other'
  ],
  deer: [
    'White-tailed', 'Red Deer', 'Elk', 'Fallow', 'Axis', 'Sika', 'Other'
  ],
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
  { value: 'Sold', label: 'Sold' },
  { value: 'Deceased', label: 'Deceased' },
  { value: 'Transferred', label: 'Transferred' },
  { value: 'Loaned', label: 'Loaned' },
  { value: 'Quarantined', label: 'Quarantined' },
  { value: 'Treatment', label: 'Under Treatment' }
];

export const weightUnits = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' }
];

// Add form type definitions for other forms
export interface NoteFormData {
  title: string;
  content: string;
  category?: string;
  date: string;
}

export interface FeedingFormData {
  feed_type: string;
  amount: number;
  unit: string;
  date: string;
  time: string;
  notes?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  due_time?: string;
  assign_to?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  is_completed: boolean;
}

export interface TransactionFormData {
  transaction_type: 'expense' | 'income';
  category: string;
  amount: number;
  currency: string;
  date: string;
  payment_method: string;
  description?: string;
  vendor?: string;
  receipt_number?: string;
}
