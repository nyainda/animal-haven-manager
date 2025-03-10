import { toast } from "sonner";
import { Animal, AnimalFormData } from "../types/AnimalTypes";

// Base API URLs
const API_URL = "http://127.0.0.1:8000/api/animals";
const CSRF_URL = "http://127.0.0.1:8000/sanctum/csrf-cookie";


interface PaginatedResponse {
  current_page: number;
  data: Animal[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Helper to fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include', // Include cookies for Sanctum
    });
    if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    console.log('[ANIMAL] CSRF token fetched successfully');
  } catch (error) {
    console.warn('[ANIMAL] CSRF fetch failed, proceeding anyway:', error);
    // Proceed anyway, as some setups might not require CSRF for GET
  }
};

// Helper to get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
  };
};

// Fetch all animals (handles paginated response)
export const fetchAnimals = async (): Promise<Animal[]> => {
  await fetchCsrfToken();
  try {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[ANIMAL] Fetch Animals Status:', response.status);
    const rawData = await response.json();
    console.log('[ANIMAL] Raw Fetch Animals Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Extract animals from paginated response
    const animals = rawData.data && Array.isArray(rawData.data.data)
      ? rawData.data.data
      : [];
    console.log('[ANIMAL] Processed Animals:', animals);
    return animals;
  } catch (error) {
    console.error('[ANIMAL] Error fetching animals:', error);
    toast.error(`Failed to fetch animals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch a single animal by ID
export const fetchAnimal = async (id: string): Promise<Animal> => {
  await fetchCsrfToken();
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[ANIMAL] Fetch Animal Status:', response.status);
    const rawData = await response.json();
    console.log('[ANIMAL] Raw Fetch Animal Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Handle potential wrapping in 'data'
    const animal = rawData.data || rawData;
    console.log('[ANIMAL] Processed Animal:', animal);
    return animal;
  } catch (error) {
    console.error(`[ANIMAL] Error fetching animal ${id}:`, error);
    toast.error(`Failed to fetch animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Create a new animal
export const createAnimal = async (animalData: AnimalFormData): Promise<Animal> => {
  await fetchCsrfToken();
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(animalData),
    });

    console.log('[ANIMAL] Create Animal Status:', response.status);
    const rawData = await response.json();
    console.log('[ANIMAL] Raw Create Animal Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const newAnimal = rawData.data || rawData;
    toast.success(`Animal ${newAnimal.name} created successfully`);
    console.log('[ANIMAL] Created Animal:', newAnimal);
    return newAnimal;
  } catch (error) {
    console.error('[ANIMAL] Error creating animal:', error);
    toast.error(`Failed to create animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Update an existing animal
export const updateAnimal = async (id: string, animalData: Partial<AnimalFormData>): Promise<Animal> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(animalData),
    });

    console.log('[ANIMAL] Update Animal Status:', response.status);
    const rawData = await response.json();
    console.log('[ANIMAL] Raw Update Animal Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const updatedAnimal = rawData.data || rawData;
    toast.success(`Animal ${updatedAnimal.name} updated successfully`);
    console.log('[ANIMAL] Updated Animal:', updatedAnimal);
    return updatedAnimal;
  } catch (error) {
    console.error(`[ANIMAL] Error updating animal ${id}:`, error);
    toast.error(`Failed to update animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Delete an animal
export const deleteAnimal = async (id: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[ANIMAL] Delete Animal Status:', response.status);
    const rawData = await response.json();
    console.log('[ANIMAL] Raw Delete Animal Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success('Animal deleted successfully');
  } catch (error) {
    console.error(`[ANIMAL] Error deleting animal ${id}:`, error);
    toast.error(`Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Export animals to CSV
export const exportAnimalsToCSV = async (): Promise<void> => {
  try {
    const animals = await fetchAnimals();

    // Define fields to export based on your Animal type
    const fields = [
      'id', 'name', 'type', 'breed', 'gender', 'birth_date', 'tag_number',
      'status', 'is_breeding_stock', 'age', 'is_deceased',
    ];

    const header = fields.join(',');

    const rows = animals.map(animal => {
      return fields.map(field => {
        if (field === 'is_breeding_stock' || field === 'is_deceased') {
          return animal[field] ? 'Yes' : 'No';
        }
        const value = animal[field] !== null && animal[field] !== undefined
          ? String(animal[field]).replace(/,/g, ' ')
          : '';
        return value.includes(' ') ? `"${value}"` : value;
      }).join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `animal_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Animals exported to CSV successfully');
  } catch (error) {
    console.error('[ANIMAL] Error exporting animals to CSV:', error);
    toast.error(`Failed to export animals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};