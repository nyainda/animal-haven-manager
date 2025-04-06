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
  'turkey',
  'alpaca',
  'llama',
  'buffalo',
  'deer',
  'emu',
  'ostrich',
  'quail',
  'pheasant',
  'geese',
  'bison',
  'donkey',
  'mule',
  'camel',
  'fish',
  'guinea fowl',
  'other'
];

export const breedsByType: Record<string, string[]> = {
  cattle: [
    'Angus', 'Hereford', 'Holstein', 'Jersey', 'Limousin', 'Simmental', 'Charolais', 'Brahman', 
    'Galloway', 'Highland', 'Shorthorn', 'Belgian Blue', 'Dexter', 'Belted Galloway', 'Maine-Anjou',
    'Piedmontese', 'Texas Longhorn', 'Wagyu', 'Ayrshire', 'Guernsey', 'Brown Swiss', 'Santa Gertrudis',
    'Beefmaster', 'Chianina', 'Devon', 'Red Angus', 'Brangus', 'Other'
  ],
  sheep: [
    'Merino', 'Suffolk', 'Dorper', 'Romney', 'Dorset', 'Texel', 'Border Leicester', 'Corriedale',
    'Hampshire', 'Lincoln', 'Southdown', 'Rambouillet', 'Jacob', 'Cheviot', 'Columbia', 'Polypay',
    'Katahdin', 'Finn', 'Icelandic', 'Shetland', 'Blackface', 'Clun Forest', 'East Friesian', 
    'Barbados Blackbelly', 'Navajo-Churro', 'Karakul', 'Bluefaced Leicester', 'Other'
  ],
  goat: [
    'Boer', 'Alpine', 'Saanen', 'Nubian', 'LaMancha', 'Toggenburg', 'Angora', 'Nigerian Dwarf',
    'Oberhasli', 'Pygmy', 'Kiko', 'Spanish', 'Myotonic/Fainting', 'Cashmere', 'Golden Guernsey',
    'Sable', 'Kinder', 'Savanna', 'Verata', 'Damascus', 'Beetal', 'British Alpine', 'French Alpine',
    'Canary Island', 'Mubende', 'Murcia-Granada', 'Other'
  ],
  pig: [
    'Duroc', 'Hampshire', 'Yorkshire', 'Landrace', 'Berkshire', 'Pietrain', 'Spot', 'Tamworth',
    'Large Black', 'Gloucestershire Old Spot', 'Hereford', 'Chester White', 'Poland China', 'Mangalitsa',
    'American Guinea Hog', 'Mulefoot', 'Red Wattle', 'Kunekune', 'Ossabaw Island', 'Meishan', 
    'British Saddleback', 'Iron Age', 'Large White', 'Middle White', 'Other'
  ],
  horse: [
    'Thoroughbred', 'Arabian', 'Quarter Horse', 'Appaloosa', 'Morgan', 'Clydesdale', 'Percheron', 'Standardbred',
    'Tennessee Walking Horse', 'Friesian', 'Andalusian', 'Lipizzaner', 'Haflinger', 'Icelandic', 'Belgian Draft',
    'Shire', 'Shetland Pony', 'Welsh Pony', 'Mustang', 'Akhal-Teke', 'Fjord', 'Warmblood', 'Paso Fino',
    'Paint Horse', 'Gypsy Vanner', 'Miniature Horse', 'Suffolk Punch', 'Other'
  ],
  chicken: [
    'Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Orpington', 'Sussex', 'Wyandotte', 'Brahma', 'Australorp',
    'Silkie', 'Ameraucana', 'Cochin', 'Marans', 'Dominique', 'Polish', 'Cornish Cross', 'Barred Rock',
    'New Hampshire Red', 'Welsummer', 'Easter Egger', 'Hamburg', 'Langshan', 'Faverolles', 'Dorking',
    'Araucana', 'Delaware', 'Java', 'Jersey Giant', 'Naked Neck', 'Other'
  ],
  duck: [
    'Pekin', 'Muscovy', 'Mallard', 'Indian Runner', 'Call Duck', 'Rouen', 'Cayuga', 'Swedish',
    'Khaki Campbell', 'Magpie', 'Welsh Harlequin', 'Crested', 'Ancona', 'Appleyard', 'Buff', 'Saxony',
    'Blue Swedish', 'Golden Cascade', 'Black East Indian', 'White Crested', 'American Pekin', 'Aylesbury', 
    'Bali', 'Hook Bill', 'Other'
  ],
  rabbit: [
    'New Zealand', 'Californian', 'Rex', 'Dutch', 'Flemish Giant', 'Mini Lop', 'Angora', 'Netherland Dwarf',
    'Holland Lop', 'Lionhead', 'Silver Fox', 'Palomino', 'American', 'Chinchilla', 'English Spot', 'Florida White',
    'French Lop', 'Harlequin', 'Havana', 'Himalayan', 'Jersey Wooly', 'Polish', 'Satin', 'Silver Marten',
    'Tan', 'Vienna', 'Belgian Hare', 'Other'
  ],
  turkey: [
    'Broad Breasted White', 'Broad Breasted Bronze', 'Bourbon Red', 'Narragansett', 'Standard Bronze',
    'Royal Palm', 'Beltsville Small White', 'Black Spanish', 'Blue Slate', 'Midget White', 'Chocolate', 
    'Lavender', 'Jersey Buff', 'White Holland', 'Other'
  ],
  alpaca: [
    'Huacaya', 'Suri', 'Mixed', 'Other'
  ],
  llama: [
    'Classic', 'Wooly', 'Silky', 'Suri', 'Argentine', 'Bolivian', 'Chilean', 'Other'
  ],
  buffalo: [
    'River Buffalo', 'Swamp Buffalo', 'Mediterranean', 'Murrah', 'Nili-Ravi', 'Jaffarabadi', 
    'Surti', 'Bhadawari', 'Mehsana', 'Bulgarian Murrah', 'Italian Mediterranean', 'Other'
  ],
  deer: [
    'Red Deer', 'Fallow Deer', 'Elk/Wapiti', 'Axis Deer', 'Sika Deer', 'White-tailed Deer', 
    'Reindeer/Caribou', 'Roe Deer', 'Sambar', 'Barasingha', 'Muntjac', 'Pere David','Deer', 'Other'
  ],
  emu: [
    'Common Emu', 'Coastal Emu', 'Tasmanian Emu', 'Other'
  ],
  ostrich: [
    'African Black', 'Blue Neck', 'Red Neck', 'Zimbabwe Blue', 'Kenyan Red', 'Hybrid', 'Other'
  ],
  quail: [
    'Coturnix/Japanese', 'Bobwhite', 'California', 'Mountain', 'Button', 'Chinese Painted', 
    'Gambel', 'Brown', 'Texas A&M', 'Pharaoh', 'Tibetan', 'Other'
  ],
  pheasant: [
    'Ringneck', 'Golden', 'Lady Amherst', 'Silver', 'Reeves', 'Blue Eared', 'Impeyan', 
    'Swinhoe', 'Mikado', 'Tragopan', 'Edward', 'Green', 'Ornamental', 'Other'
  ],
  geese: [
    'Embden', 'Toulouse', 'Chinese', 'African', 'Pilgrim', 'American Buff', 'Sebastopol', 
    'Roman', 'Egyptian', 'Canada', 'Snow', 'Pomeranian', 'Shetland', 'Steinbacher', 'Other'
  ],
  bison: [
    'Plains Bison', 'Wood Bison', 'European Bison/Wisent', 'Beefalo', 'Cattalo', 'Other'
  ],
  donkey: [
    'Miniature', 'Standard', 'Mammoth', 'Andalusian', 'American Spotted', 'Poitou', 
    'Sicilian', 'Burro', 'Catalan', 'Ethiopian', 'Zamorano-Leonés', 'Other'
  ],
  mule: [
    'Draft Mule', 'Saddle Mule', 'Pack Mule', 'Mammoth Jack Mule', 'Hinny', 'Molly Mule', 'Other'
  ],
  camel: [
    'Dromedary', 'Bactrian', 'Wild Bactrian', 'Hybrid', 'Tulu', 'Arvana', 'Other'
  ],
  fish: [
    'Tilapia', 'Catfish', 'Trout', 'Salmon', 'Carp', 'Bass', 'Perch', 'Barramundi', 
    'Arctic Char', 'Sturgeon', 'Pangasius', 'Cod', 'Halibut', 'Bream', 'Other'
  ],
  'guinea fowl': [
    'Pearl', 'White', 'Lavender', 'Royal Purple', 'Coral Blue', 'Buff', 'Pied', 'Porcelain', 'Other'
  ],
  other: ['Custom Breed']
};

// Animal production types mapping
export const productionTypesByAnimal = {
  // Dairy animals
  cattle: ["Milk", "Meat"],
  goat: ["Milk", "Meat"],
  sheep: ["Milk", "Meat", "Wool"],
  buffalo: ["Milk", "Meat"],
  camel: ["Milk", "Meat"],
  donkey: ["Milk"],
  
  // Poultry/birds
  chicken: ["Eggs", "Meat"],
  duck: ["Eggs", "Meat"],
  turkey: ["Eggs", "Meat"],
  quail: ["Eggs", "Meat"],
  pheasant: ["Eggs", "Meat"],
  geese: ["Eggs", "Meat"],
  ostrich: ["Eggs", "Meat"],
  emu: ["Eggs", "Meat"],
  "guinea fowl": ["Eggs", "Meat"],
  
  // Meat animals
  pig: ["Meat"],
  rabbit: ["Meat", "Fur"],
  deer: ["Meat", "Antlers"],
  bison: ["Meat"],
  
  // Fiber animals
  alpaca: ["Fiber", "Meat"],
  llama: ["Fiber", "Meat"],
  
  // Working animals
  horse: ["Service"],
  mule: ["Service"],
  
  // Aquaculture
  fish: ["Meat"],
  
  // For custom animals
  other: ["Custom Production"]
};

// Production measurement units mapping
export const measurementUnitsByProductionType = {
  Milk: ["Liters", "Gallons", "kg"],
  Eggs: ["Count", "Dozen"],
  Meat: ["kg", "lbs"],
  Wool: ["kg", "lbs"],
  Fiber: ["kg", "lbs"],
  Fur: ["Count", "kg"],
  Antlers: ["Count", "kg"],
  Service: ["Hours", "Days"],
  "Custom Production": ["Custom Unit"]
};

// Production quality grades mapping
export const qualityGradesByProductionType = {
  Milk: ["Grade A", "Grade B", "Premium", "Organic", "Raw"],
  Eggs: ["Grade A", "Grade B", "Premium", "Organic", "Free Range"],
  Meat: ["Premium", "Standard", "Organic", "Grass-fed", "Grain-fed"],
  Wool: ["Fine", "Medium", "Coarse", "Premium"],
  Fiber: ["Fine", "Medium", "Coarse", "Premium"],
  Fur: ["Premium", "Standard"],
  Antlers: ["Premium", "Standard"],
  Service: ["Certified", "Trained", "In Training"],
  "Custom Production": ["Custom Grade"]
};

// Production methods mapping
export const productionMethodsByProductionType = {
  Milk: ["Traditional Milking", "Machine Milking", "Robotic Milking", "Organic"],
  Eggs: ["Free Range", "Cage-Free", "Conventional", "Organic", "Pastured"],
  Meat: ["Grass-Fed", "Grain-Fed", "Organic", "Free Range", "Conventional"],
  Wool: ["Hand Shearing", "Machine Shearing"],
  Fiber: ["Hand Shearing", "Machine Shearing"],
  Fur: ["Traditional", "Humane"],
  Antlers: ["Natural Shed", "Harvested"],
  Service: ["Training", "Working", "Recreational"],
  "Custom Production": ["Custom Method"]
};

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  
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