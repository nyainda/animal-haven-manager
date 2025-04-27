import { Animal, AnimalFormData } from "../types/AnimalTypes";
import { apiConfig } from '@/config/api';
import { toast } from 'react-toastify';

// Constants
const API_URL = apiConfig.API_URL;
const CSRF_URL = apiConfig.CSRF_URL;
const CACHE_VERSION = 'v1'; // Cache versioning to invalidate old data
const CSRF_CACHE_KEY = 'csrf_token';
const CSRF_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

// Normalized cache structure
interface AnimalCache {
  animals: Record<string, Animal>; // Keyed by animal ID
  ids: string[]; // List of animal IDs for ordering
  lastUpdated: number; // Timestamp for cache expiration
}

// Utility to manage localStorage with versioning
const getCache = (key: string): any => {
  const raw = localStorage.getItem(`${CACHE_VERSION}_${key}`);
  return raw ? JSON.parse(raw) : null;
};

const setCache = (key: string, data: any): void => {
  localStorage.setItem(`${CACHE_VERSION}_${key}`, JSON.stringify({
    ...data,
    lastUpdated: Date.now(),
  }));
};

// Fetch CSRF token with caching
const fetchCsrfToken = async (retryCount = 0): Promise<void> => {
  const maxRetries = 2;
  const cachedCsrf = getCache(CSRF_CACHE_KEY);
  
  // Use cached CSRF token if not expired
  if (cachedCsrf && Date.now() - cachedCsrf.lastUpdated < CSRF_CACHE_DURATION) {
    console.log('[ANIMAL] Using cached CSRF token');
    return;
  }

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
    setCache(CSRF_CACHE_KEY, { token: true }); // Store token presence
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

// Centralized API fetch utility
const apiFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
      credentials: 'include',
    });

    const data = await response.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ANIMAL] API Response:', { status: response.status, data });
    }

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

// Fetch animals with pagination support
export const fetchAnimals = async (page = 1, perPage = 20): Promise<Animal[]> => {
  try {
    const cacheKey = `animals_page_${page}`;
    const cached = getCache(cacheKey);
    const cacheDuration = 5 * 60 * 1000; // 5 minutes cache

    if (cached && Date.now() - cached.lastUpdated < cacheDuration) {
      toast.info('Loaded cached animals');
      return Object.values(cached.animals);
    }

    const response = await apiFetch(`${API_URL}?page=${page}&per_page=${perPage}`);
    const animals = response.data && Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data) ? response.data : [];

    // Normalize animals into a flat structure
    const normalized: AnimalCache = {
      animals: animals.reduce((acc: Record<string, Animal>, animal: Animal) => {
        acc[animal.id] = animal;
        return acc;
      }, {}),
      ids: animals.map((animal: Animal) => animal.id),
      lastUpdated: Date.now(),
    };

    setCache(cacheKey, normalized);
    return animals;
  } catch (error) {
    console.error('[ANIMAL] Error fetching animals:', error);
    const cached = getCache(`animals_page_${page}`);
    if (cached) {
      toast.info('Loaded cached animals due to fetch error');
      return Object.values(cached.animals);
    }
    toast.error(`Failed to fetch animals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch single animal
export const fetchAnimal = async (id: string): Promise<Animal> => {
  try {
    const cacheKey = `animal_${id}`;
    const cached = getCache(cacheKey);
    const cacheDuration = 5 * 60 * 1000; // 5 minutes cache

    if (cached && Date.now() - cached.lastUpdated < cacheDuration) {
      toast.info('Loaded cached animal');
      return cached.animals[id];
    }

    const response = await apiFetch(`${API_URL}/${id}`);
    const animal = response.data || response;

    setCache(cacheKey, { animals: { [id]: animal } });
    return animal;
  } catch (error) {
    console.error(`[ANIMAL] Error fetching animal ${id}:`, error);
    const cached = getCache(`animal_${id}`);
    if (cached) {
      toast.info('Loaded cached animal due to fetch error');
      return cached.animals[id];
    }
    toast.error(`Failed to fetch animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Create animal
export const createAnimal = async (animalData: AnimalFormData): Promise<Animal> => {
  try {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(animalData),
    });
    const newAnimal = response.data || response;
    toast.success(`Animal ${newAnimal.name} created successfully`);

    // Update cache for page 1 (assuming new animals appear on the first page)
    const cacheKey = `animals_page_1`;
    const cached = getCache(cacheKey) || { animals: {}, ids: [] };
    cached.animals[newAnimal.id] = newAnimal;
    cached.ids.unshift(newAnimal.id); // Add to start of list
    setCache(cacheKey, cached);

    return newAnimal;
  } catch (error) {
    toast.error(`Failed to create animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Update animal
export const updateAnimal = async (id: string, animalData: Partial<AnimalFormData>): Promise<Animal> => {
  try {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animalData),
    });
    const updatedAnimal = response.data || response;
    toast.success(`Animal ${updatedAnimal.name} updated successfully`);

    // Update all relevant caches
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith(`${CACHE_VERSION}_animals_page_`));
    cacheKeys.forEach(cacheKey => {
      const cached = getCache(cacheKey.replace(`${CACHE_VERSION}_`, ''));
      if (cached && cached.animals[id]) {
        cached.animals[id] = updatedAnimal;
        setCache(cacheKey.replace(`${CACHE_VERSION}_`, ''), cached);
      }
    });

    // Update individual animal cache
    setCache(`animal_${id}`, { animals: { [id]: updatedAnimal } });

    return updatedAnimal;
  } catch (error) {
    toast.error(`Failed to update animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Delete animal
export const deleteAnimal = async (id: string): Promise<void> => {
  try {
    await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' });
    toast.success('Animal deleted successfully');

    // Update all relevant caches
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith(`${CACHE_VERSION}_animals_page_`));
    cacheKeys.forEach(cacheKey => {
      const cached = getCache(cacheKey.replace(`${CACHE_VERSION}_`, ''));
      if (cached && cached.animals[id]) {
        delete cached.animals[id];
        cached.ids = cached.ids.filter((animalId: string) => animalId !== id);
        setCache(cacheKey.replace(`${CACHE_VERSION}_`, ''), cached);
      }
    });

    // Remove individual animal cache
    localStorage.removeItem(`${CACHE_VERSION}_animal_${id}`);
  } catch (error) {
    toast.error(`Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Export animals to CSV with streaming
export const exportAnimalsToCSV = async (): Promise<void> => {
  try {
    const animals = await fetchAnimals(1, 1000); // Adjust perPage for larger datasets
    const fields = [
      'id', 'name', 'type', 'breed', 'gender', 'birth_date', 'tag_number',
      'status', 'is_breeding_stock', 'age', 'is_deceased',
    ];

    const header = fields.join(',');
    const rows: string[] = [];

    // Generate rows in chunks to avoid memory issues
    for (const animal of animals) {
      const row = fields.map(field => {
        if (field === 'is_breeding_stock' || field === 'is_deceased') {
          return animal[field] ? 'Yes' : 'No';
        }
        const value = animal[field] ?? '';
        return String(value).includes(',') ? `"${value}"` : value;
      }).join(',');
      rows.push(row);
    }

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