import { toast } from "sonner";
import { Animal, AnimalFormData } from "../types/AnimalTypes";

const API_URL = "https://animal-management-master-wyohh0.laravel.cloud/api/animals";
const CSRF_URL = "https://animal-management-master-wyohh0.laravel.cloud/sanctum/csrf-cookie";

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

// Fetch CSRF token with retry logic
const fetchCsrfToken = async (retryCount = 0): Promise<void> => {
  const maxRetries = 2;
  if (retryCount > maxRetries) {
    throw new Error('Failed to fetch CSRF token after multiple attempts');
  }

  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`CSRF fetch failed: ${response.status}`);
    console.log('[ANIMAL] CSRF token fetched successfully');
  } catch (error) {
    console.warn(`[ANIMAL] CSRF fetch attempt ${retryCount + 1} failed:`, error);
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return fetchCsrfToken(retryCount + 1);
    }
    throw error;
  }
};

// Get authentication headers
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

// API fetch utility specific to animal service
const apiFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('[ANIMAL] API Response:', { status: response.status, data });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }
      throw new Error(data.message || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[ANIMAL] API Error:', error);
    throw error;
  }
};

export const fetchAnimals = async (): Promise<Animal[]> => {
  try {
    const response = await apiFetch(API_URL);
    const animals = response.data && Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data) ? response.data : [];
    
    // Cache animals
    localStorage.setItem('dashboard_animals', JSON.stringify(animals));
    return animals;
  } catch (error) {
    console.error('[ANIMAL] Error fetching animals:', error);
    const cached = localStorage.getItem('dashboard_animals');
    if (cached) {
      toast.info('Loaded cached animals due to fetch error');
      return JSON.parse(cached);
    }
    toast.error(`Failed to fetch animals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const fetchAnimal = async (id: string): Promise<Animal> => {
  try {
    const response = await apiFetch(`${API_URL}/${id}`);
    const animal = response.data || response;
    localStorage.setItem(`animal_${id}`, JSON.stringify(animal));
    return animal;
  } catch (error) {
    console.error(`[ANIMAL] Error fetching animal ${id}:`, error);
    const cached = localStorage.getItem(`animal_${id}`);
    if (cached) {
      toast.info('Loaded cached animal due to fetch error');
      return JSON.parse(cached);
    }
    toast.error(`Failed to fetch animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const createAnimal = async (animalData: AnimalFormData): Promise<Animal> => {
  try {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(animalData),
    });
    const newAnimal = response.data || response;
    toast.success(`Animal ${newAnimal.name} created successfully`);
    
    // Update cached animals list
    const cachedAnimals = JSON.parse(localStorage.getItem('dashboard_animals') || '[]');
    cachedAnimals.push(newAnimal);
    localStorage.setItem('dashboard_animals', JSON.stringify(cachedAnimals));
    
    return newAnimal;
  } catch (error) {
    toast.error(`Failed to create animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const updateAnimal = async (id: string, animalData: Partial<AnimalFormData>): Promise<Animal> => {
  try {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animalData),
    });
    const updatedAnimal = response.data || response;
    toast.success(`Animal ${updatedAnimal.name} updated successfully`);
    
    // Update cached animals list
    const cachedAnimals = JSON.parse(localStorage.getItem('dashboard_animals') || '[]');
    const updatedAnimals = cachedAnimals.map((animal: Animal) =>
      animal.id === id ? updatedAnimal : animal
    );
    localStorage.setItem('dashboard_animals', JSON.stringify(updatedAnimals));
    
    return updatedAnimal;
  } catch (error) {
    toast.error(`Failed to update animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const deleteAnimal = async (id: string): Promise<void> => {
  try {
    await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' });
    toast.success('Animal deleted successfully');
    
    // Update cached animals list
    const cachedAnimals = JSON.parse(localStorage.getItem('dashboard_animals') || '[]');
    const updatedAnimals = cachedAnimals.filter((animal: Animal) => animal.id !== id);
    localStorage.setItem('dashboard_animals', JSON.stringify(updatedAnimals));
  } catch (error) {
    toast.error(`Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const exportAnimalsToCSV = async (): Promise<void> => {
  try {
    const animals = await fetchAnimals();
    const fields = [
      'id', 'name', 'type', 'breed', 'gender', 'birth_date', 'tag_number',
      'status', 'is_breeding_stock', 'age', 'is_deceased',
    ];

    const header = fields.join(',');
    const rows = animals.map(animal =>
      fields.map(field => {
        if (field === 'is_breeding_stock' || field === 'is_deceased') {
          return animal[field] ? 'Yes' : 'No';
        }
        const value = animal[field] ?? '';
        return String(value).includes(',') ? `"${value}"` : value;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `animal_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Animals exported to CSV successfully');
  } catch (error) {
    toast.error(`Failed to export animals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};