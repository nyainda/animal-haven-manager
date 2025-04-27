import { toast } from 'sonner';
import { apiConfig } from '@/config/api';

// Health and HealthFormData interfaces
export interface Health {
  Health_id: string;
  animal_id: string;
  health_status: string;
  vaccination_status: string;
  vet_contact_id: string | null;
  medical_history: Record<string, string> | null;
  dietary_restrictions: string | null;
  neutered_spayed: boolean;
  regular_medication: string[] | null;
  last_vet_visit: string | null;
  insurance_details: string | null;
  exercise_requirements: string[] | null;
  parasite_prevention: string[] | null;
  vaccinations: string | null;
  allergies: string[] | null;
  notes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface HealthFormData {
  health_status: string;
  vaccination_status: string;
  vet_contact_id?: string | null;
  medical_history?: Record<string, string> | null;
  dietary_restrictions?: string | null;
  neutered_spayed: boolean;
  regular_medication?: string[] | null;
  last_vet_visit?: string | null;
  insurance_details?: string | null;
  exercise_requirements?: string[] | null;
  parasite_prevention?: string[] | null;
  vaccinations?: string | null;
  allergies?: string[] | null;
  notes?: string[] | null;
}

// Custom error class for field-specific errors
class ApiValidationError extends Error {
  public errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.errors = errors;
    this.name = 'ApiValidationError';
  }
}

// Base API URL and CSRF cache
const API_URL = apiConfig.API_URL;
const CSRF_URL = apiConfig.CSRF_URL;
let csrfTokenPromise: Promise<void> | null = null;

// Normalization functions
const normalizeDate = (date: string | null): string | null => {
  return date ? new Date(date).toISOString().split('T')[0] : null;
};

const normalizeHealthFormData = (data: HealthFormData): HealthFormData => {
  const normalized: HealthFormData = {
    health_status: data.health_status.trim(),
    vaccination_status: data.vaccination_status.trim(),
    neutered_spayed: Boolean(data.neutered_spayed),
  };

  if (data.vet_contact_id) normalized.vet_contact_id = data.vet_contact_id;
  if (data.medical_history) normalized.medical_history = Object.fromEntries(
    Object.entries(data.medical_history).map(([k, v]) => [k.trim(), v.trim()])
  );
  if (data.dietary_restrictions) normalized.dietary_restrictions = data.dietary_restrictions.trim();
  if (data.regular_medication) normalized.regular_medication = Array.isArray(data.regular_medication)
    ? data.regular_medication.map(m => m.trim()).filter(m => m)
    : null;
  if (data.last_vet_visit) normalized.last_vet_visit = normalizeDate(data.last_vet_visit);
  if (data.insurance_details) normalized.insurance_details = data.insurance_details?.trim();
  if (data.exercise_requirements) normalized.exercise_requirements = Array.isArray(data.exercise_requirements)
    ? data.exercise_requirements.map(r => r.trim()).filter(r => r)
    : null;
  if (data.parasite_prevention) normalized.parasite_prevention = Array.isArray(data.parasite_prevention)
    ? data.parasite_prevention.map(p => p.trim()).filter(p => p)
    : null;
  if (data.vaccinations) normalized.vaccinations = data.vaccinations.trim();
  if (data.allergies) normalized.allergies = Array.isArray(data.allergies)
    ? data.allergies.map(a => a.trim()).filter(a => a)
    : null;
  if (data.notes) normalized.notes = Array.isArray(data.notes)
    ? data.notes.map(n => n.trim()).filter(n => n)
    : null;

  return normalized;
};

const normalizeHealthResponse = (data: any): Health => {
  if (!data || !data.Health_id) throw new Error('Invalid health record data received');

  return {
    Health_id: String(data.Health_id),
    animal_id: String(data.animal_id || ''),
    health_status: String(data.health_status || ''),
    vaccination_status: String(data.vaccination_status || ''),
    vet_contact_id: data.vet_contact_id ? String(data.vet_contact_id) : null,
    medical_history: data.medical_history ? Object.fromEntries(
      Object.entries(data.medical_history).map(([k, v]) => [String(k), String(v)])
    ) : null,
    dietary_restrictions: data.dietary_restrictions ? String(data.dietary_restrictions) : null,
    neutered_spayed: Boolean(data.neutered_spayed),
    regular_medication: Array.isArray(data.regular_medication) ? data.regular_medication.map(String) : null,
    last_vet_visit: normalizeDate(data.last_vet_visit),
    insurance_details: data.insurance_details ? String(data.insurance_details) : null,
    exercise_requirements: Array.isArray(data.exercise_requirements) ? data.exercise_requirements.map(String) : null,
    parasite_prevention: Array.isArray(data.parasite_prevention) ? data.parasite_prevention.map(String) : null,
    vaccinations: data.vaccinations ? String(data.vaccinations) : null,
    allergies: Array.isArray(data.allergies) ? data.allergies.map(String) : null,
    notes: Array.isArray(data.notes) ? data.notes.map(String) : null,
    created_at: new Date(data.created_at || new Date()).toISOString(),
    updated_at: new Date(data.updated_at || new Date()).toISOString(),
  };
};

// Fetch CSRF token
const fetchCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = (async () => {
      try {
        const response = await fetch(CSRF_URL, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        console.log('[HEALTH] CSRF token fetched successfully');
      } catch (error) {
        console.warn('[HEALTH] CSRF fetch failed, proceeding anyway:', error);
      } finally {
        setTimeout(() => (csrfTokenPromise = null), 1000);
      }
    })();
  }
  return csrfTokenPromise;
};

// Get authentication headers
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
    const normalizedData = normalizeHealthFormData(healthData);
    const url = `${API_URL}/${animalId}/health`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(normalizedData),
    });

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    const newHealth = normalizeHealthResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Health record created successfully');
    return newHealth;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to create health record: ${message}`);
    throw error;
  }
};

// Fetch all health records for an animal with pagination
export const fetchHealthRecords = async (
  animalId: string,
  options: { page?: number; perPage?: number; fields?: string[] } = {}
): Promise<Health[]> => {
  await fetchCsrfToken();
  try {
    const { page = 1, perPage = 10, fields } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(fields ? { fields: fields.join(',') } : {}),
    });
    const url = `${API_URL}/${animalId}/health?${params}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    const healthRecords = Array.isArray(rawData.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];
    return healthRecords.map(normalizeHealthResponse);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch health records: ${message}`);
    throw error;
  }
};

// Fetch a single health record
export const fetchHealthRecord = async (animalId: string, healthId: string): Promise<Health> => {
  await fetchCsrfToken();
  try {
    if (!healthId || healthId === 'undefined') {
      throw new Error('Invalid health record ID provided');
    }

    const url = `${API_URL}/${animalId}/health/${healthId}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 404) {
      throw new Error(`Health record with ID ${healthId} not found`);
    }

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    return normalizeHealthResponse(rawData.data || rawData);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch health record: ${message}`);
    throw error;
  }
};

// Update a health record
export const updateHealthRecord = async (
  animalId: string,
  healthId: string,
  healthData: Partial<HealthFormData>
): Promise<Health> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeHealthFormData(healthData as HealthFormData);
    const url = `${API_URL}/${animalId}/health/${healthId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(normalizedData),
    });

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    const updatedHealth = normalizeHealthResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Health record updated successfully');
    return updatedHealth;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to update health record: ${message}`);
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

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    toast.success(rawData.message || 'Health record deleted successfully');
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to delete health record: ${message}`);
    throw error;
  }
};

// Fetch health reports for an animal
export const fetchHealthReports = async (
  animalId: string,
  options: { page?: number; perPage?: number; fields?: string[] } = {}
): Promise<any> => {
  await fetchCsrfToken();
  try {
    const { page = 1, perPage = 10, fields } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(fields ? { fields: fields.join(',') } : {}),
    });
    const url = `${API_URL}/${animalId}/health/reports?${params}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    return rawData.data || rawData;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch health reports: ${message}`);
    throw error;
  }
};