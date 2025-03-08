
import { Animal, AnimalFormData } from "../types/AnimalTypes";

// Mock animal data
const MOCK_ANIMALS: Animal[] = [
  {
    id: "1",
    internal_id: "CAT/25/0001",
    animal_id: "anim-001",
    name: "Bella",
    type: "cattle",
    breed: "Angus",
    gender: "female",
    birth_date: "2023-05-15",
    birth_time: "08:30:00",
    tag_number: "TAG1234",
    status: "Active",
    is_breeding_stock: true,
    age: 2,
    is_deceased: false,
    next_checkup_date: "2025-04-15",
    birth_weight: 75,
    weight_unit: "kg",
    birth_status: "normal",
    colostrum_intake: "good",
    health_at_birth: "healthy",
    vaccinations: ["rabies", "distemper"],
    milk_feeding: "formula",
    multiple_birth: false,
    birth_order: null,
    gestation_length: 283,
    breeder_info: "Alpine Farms",
    raised_purchased: "raised",
    birth_photos: null,
    physical_traits: ["black coat", "white face"],
    keywords: ["registered", "show quality"]
  },
  {
    id: "2",
    internal_id: "CAT/25/0002",
    animal_id: "anim-002",
    name: "Max",
    type: "cattle",
    breed: "Hereford",
    gender: "male",
    birth_date: "2022-08-10",
    birth_time: "14:45:00",
    tag_number: "TAG5678",
    status: "Active",
    is_breeding_stock: true,
    age: 3,
    is_deceased: false,
    next_checkup_date: "2025-05-10",
    birth_weight: 82,
    weight_unit: "kg",
    birth_status: "normal",
    colostrum_intake: "excellent",
    health_at_birth: "healthy",
    vaccinations: ["rabies", "blackleg"],
    milk_feeding: "dam raised",
    multiple_birth: false,
    birth_order: null,
    gestation_length: 275,
    breeder_info: "Mountain View Ranch",
    raised_purchased: "purchased",
    birth_photos: null,
    physical_traits: ["red coat", "white face"],
    keywords: ["prize winner"]
  },
  {
    id: "3",
    internal_id: "PIG/25/0001",
    animal_id: "anim-003",
    name: "Wilbur",
    type: "pig",
    breed: "Yorkshire",
    gender: "male",
    birth_date: "2024-01-20",
    birth_time: "10:15:00",
    tag_number: "TAG9012",
    status: "Active",
    is_breeding_stock: false,
    age: 1,
    is_deceased: false,
    next_checkup_date: "2025-04-20",
    birth_weight: 2.5,
    weight_unit: "kg",
    birth_status: "normal",
    colostrum_intake: "good",
    health_at_birth: "healthy",
    vaccinations: ["erysipelas"],
    milk_feeding: "sow raised",
    multiple_birth: true,
    birth_order: 3,
    gestation_length: 115,
    breeder_info: "Green Valley Farm",
    raised_purchased: "raised",
    birth_photos: null,
    physical_traits: ["pink", "curly tail"],
    keywords: ["friendly"]
  }
];

export const fetchAnimals = async (): Promise<Animal[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...MOCK_ANIMALS];
  } catch (error) {
    console.error('Error fetching animals:', error);
    throw error;
  }
};

export const fetchAnimal = async (id: string): Promise<Animal> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const animal = MOCK_ANIMALS.find(a => a.id === id);
    if (!animal) {
      throw new Error('Animal not found');
    }
    
    return { ...animal };
  } catch (error) {
    console.error(`Error fetching animal ${id}:`, error);
    throw error;
  }
};

export const createAnimal = async (animalData: AnimalFormData): Promise<Animal> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new animal with mock data
    const newAnimal: Animal = {
      id: `${Date.now()}`,
      internal_id: `${animalData.type.toUpperCase()}/${new Date().getFullYear().toString().slice(-2)}/${String(MOCK_ANIMALS.length + 1).padStart(4, '0')}`,
      animal_id: `anim-${Date.now().toString().slice(-6)}`,
      name: animalData.name,
      type: animalData.type,
      breed: animalData.breed,
      gender: animalData.gender,
      birth_date: animalData.birth_date,
      birth_time: animalData.birth_time || "08:00:00",
      tag_number: animalData.tag_number || `TAG${Math.floor(Math.random() * 10000000)}`,
      status: animalData.status || "Active",
      is_breeding_stock: animalData.is_breeding_stock || false,
      age: new Date().getFullYear() - new Date(animalData.birth_date).getFullYear(),
      is_deceased: animalData.is_deceased || false,
      next_checkup_date: null,
      birth_weight: animalData.birth_weight || null,
      weight_unit: animalData.weight_unit || null,
      birth_status: animalData.birth_status || "normal",
      colostrum_intake: null,
      health_at_birth: animalData.health_at_birth || "healthy",
      vaccinations: [],
      milk_feeding: null,
      multiple_birth: animalData.multiple_birth || false,
      birth_order: null,
      gestation_length: null,
      breeder_info: null,
      raised_purchased: animalData.raised_purchased || "raised",
      birth_photos: null,
      physical_traits: animalData.physical_traits || [],
      keywords: animalData.keywords || []
    };
    
    // In a real app, we would send this to the server
    // For demo purposes, we'll just return the new animal
    MOCK_ANIMALS.push(newAnimal);
    
    return newAnimal;
  } catch (error) {
    console.error('Error creating animal:', error);
    throw error;
  }
};

export const updateAnimal = async (id: string, animalData: Partial<AnimalFormData>): Promise<Animal> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const animalIndex = MOCK_ANIMALS.findIndex(a => a.id === id);
    if (animalIndex === -1) {
      throw new Error('Animal not found');
    }
    
    // Update the animal
    const updatedAnimal = {
      ...MOCK_ANIMALS[animalIndex],
      ...animalData,
    };
    
    MOCK_ANIMALS[animalIndex] = updatedAnimal;
    
    return updatedAnimal;
  } catch (error) {
    console.error(`Error updating animal ${id}:`, error);
    throw error;
  }
};

export const deleteAnimal = async (id: string): Promise<void> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const animalIndex = MOCK_ANIMALS.findIndex(a => a.id === id);
    if (animalIndex === -1) {
      throw new Error('Animal not found');
    }
    
    MOCK_ANIMALS.splice(animalIndex, 1);
  } catch (error) {
    console.error(`Error deleting animal ${id}:`, error);
    throw error;
  }
};
