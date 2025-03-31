import { toast } from 'sonner';

// Define the Health type based on your JSON structure, updated to match API expectations
export interface Health {
  Health_id: string;
  animal_id: string;
  health_status: string;
  vaccination_status: string;
  vet_contact_id: string | null;
  medical_history: Record<string, string> | null;
  dietary_restrictions: string | null;
  neutered_spayed: boolean;
  regular_medication: string[] | null; // Changed to string[] | null
  last_vet_visit: string | null;
  insurance_details: string | null;
  exercise_requirements: string[] | null; // Changed to string[] | null
  parasite_prevention: string[] | null; // Changed to string[] | null
  vaccinations: string | null;
  allergies: string[] | null; // Changed to string[] | null
  notes: string[] | null; // Changed to string[] | null
  created_at: string;
  updated_at: string;
}

// Define the form data type for creating/updating health records, updated to match API expectations
export interface HealthFormData {
  health_status: string;
  vaccination_status: string;
  vet_contact_id?: string | null;
  medical_history?: Record<string, string> | null;
  dietary_restrictions?: string | null;
  neutered_spayed: boolean;
  regular_medication?: string[] | null; // Changed to string[] | null
  last_vet_visit?: string | null;
  insurance_details?: string | null;
  exercise_requirements?: string[] | null; // Changed to string[] | null
  parasite_prevention?: string[] | null; // Changed to string[] | null
  vaccinations?: string | null;
  allergies?: string[] | null; // Changed to string[] | null
  notes?: string[] | null; // Changed to string[] | null
}

const API_URL = 'https://animal-management-master-wyohh0.laravel.cloud/api/animals';
const CSRF_URL = 'https://animal-management-master-wyohh0.laravel.cloud/sanctum/csrf-cookie';

// Helper to fetch CSRF token (reusing from notes service)
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    console.log('[HEALTH] CSRF token fetched successfully');
  } catch (error) {
    console.warn('[HEALTH] CSRF fetch failed, proceeding anyway:', error);
  }
};

// Helper to get authentication headers (reusing from notes service)
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const xsrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
  };
};

// Create a new health record
export const createHealthRecord = async (animalId: string, healthData: HealthFormData): Promise<Health> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/health`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(healthData),
    });

    console.log('[HEALTH] Create Health Status:', response.status);
    const rawData = await response.json();
    console.log('[HEALTH] Raw Create Health Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const newHealth = rawData.data || rawData;
    toast.success(rawData.message || 'Health record created successfully');
    console.log('[HEALTH] Created Health Record:', newHealth);
    return newHealth;
  } catch (error) {
    console.error('[HEALTH] Error creating health record:', error);
    toast.error(`Failed to create health record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch all health records for an animal
export const fetchHealthRecords = async (animalId: string): Promise<Health[]> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/health`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[HEALTH] Fetch Health Status:', response.status);
    const rawData = await response.json();
    console.log('[HEALTH] Raw Fetch Health Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const healthRecords = Array.isArray(rawData.data) ? rawData.data : 
                         rawData.data && Array.isArray(rawData.data.data) ? rawData.data.data : 
                         Array.isArray(rawData) ? rawData : [];
                         
    console.log('[HEALTH] Processed Health Records:', healthRecords);
    return healthRecords;
  } catch (error) {
    console.error(`[HEALTH] Error fetching health records for animal ${animalId}:`, error);
    toast.error(`Failed to fetch health records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch a single health record
export const fetchHealthRecord = async (animalId: string, healthId: string): Promise<Health> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/health/${healthId}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[HEALTH] Fetch Health Status:', response.status);
    const rawData = await response.json();
    console.log('[HEALTH] Raw Fetch Health Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const health = rawData.data || rawData;
    console.log('[HEALTH] Processed Health Record:', health);
    return health;
  } catch (error) {
    console.error(`[HEALTH] Error fetching health record ${healthId} for animal ${animalId}:`, error);
    toast.error(`Failed to fetch health record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Update a health record
export const updateHealthRecord = async (animalId: string, healthId: string, healthData: Partial<HealthFormData>): Promise<Health> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/health/${healthId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(healthData),
    });

    console.log('[HEALTH] Update Health Status:', response.status);
    const rawData = await response.json();
    console.log('[HEALTH] Raw Update Health Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const updatedHealth = rawData.data || rawData;
    toast.success(rawData.message || 'Health record updated successfully');
    console.log('[HEALTH] Updated Health Record:', updatedHealth);
    return updatedHealth;
  } catch (error) {
    console.error(`[HEALTH] Error updating health record ${healthId} for animal ${animalId}:`, error);
    toast.error(`Failed to update health record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Delete a health record
export const deleteHealthRecord = async (animalId: string, healthId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/health/${healthId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[HEALTH] Delete Health Status:', response.status);
    const rawData = await response.json();
    console.log('[HEALTH] Raw Delete Health Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success(rawData.message || 'Health record deleted successfully');
  } catch (error) {
    console.error(`[HEALTH] Error deleting health record ${healthId} for animal ${animalId}:`, error);
    toast.error(`Failed to delete health record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch health reports for an animal
export const fetchHealthReports = async (animalId: string): Promise<any> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/health/reports`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[HEALTH] Fetch Reports Status:', response.status);
    const rawData = await response.json();
    console.log('[HEALTH] Raw Fetch Reports Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return rawData.data || rawData;
  } catch (error) {
    console.error(`[HEALTH] Error fetching health reports for animal ${animalId}:`, error);
    toast.error(`Failed to fetch health reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};