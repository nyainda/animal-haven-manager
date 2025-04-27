import { toast } from 'sonner';
import { apiConfig } from '@/config/api';

// API URLs
const API_URL = apiConfig.API_URL;
const CSRF_URL = apiConfig.CSRF_URL;

// Define the Activity type
export interface Activity {
  id: string;
  animal_id: string;
  activity_type: string;
  activity_date: string;
  description: string;
  notes?: string;
  breeding_date?: string;
  breeding_notes?: string;
  created_at: string;
  updated_at: string;
}

// Define the form data type for creating/updating activities
export interface ActivityFormData {
  activity_type: string;
  activity_date: string;
  description: string;
  notes?: string;
  breeding_date?: string;
  breeding_notes?: string;
}

// Valid activity types (example, adjust based on your requirements)
const VALID_ACTIVITY_TYPES = [
  'vaccination',
  'feeding',
  'breeding',
  'health_check',
  'milking',
  'shearing',
  'custom',
] as const;

// Custom error class
class ApiValidationError extends Error {
  public errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.errors = errors;
    this.name = 'ApiValidationError';
  }
}

// CSRF token cache
let csrfTokenPromise: Promise<void> | null = null;

// Normalization functions
const normalizeDate = (date: string): string => {
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    console.warn('[ACTIVITY] Invalid date format, using current date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

const normalizeActivityFormData = (data: ActivityFormData): ActivityFormData => {
  const normalized: ActivityFormData = {
    activity_type: VALID_ACTIVITY_TYPES.includes(data.activity_type.trim() as any)
      ? data.activity_type.trim()
      : VALID_ACTIVITY_TYPES[0],
    activity_date: normalizeDate(data.activity_date),
    description: data.description.trim(),
  };

  if (data.notes) normalized.notes = data.notes.trim();
  if (data.breeding_date) normalized.breeding_date = normalizeDate(data.breeding_date);
  if (data.breeding_notes) normalized.breeding_notes = data.breeding_notes.trim();

  return normalized;
};

const normalizeActivityResponse = (data: any): Activity => {
  if (!data || !data.id) throw new Error('Invalid activity data received');

  return {
    id: String(data.id),
    animal_id: String(data.animal_id || ''),
    activity_type: VALID_ACTIVITY_TYPES.includes(data.activity_type as any)
      ? data.activity_type
      : VALID_ACTIVITY_TYPES[0],
    activity_date: normalizeDate(data.activity_date || new Date().toISOString()),
    description: String(data.description || ''),
    notes: data.notes ? String(data.notes) : undefined,
    breeding_date: data.breeding_date ? normalizeDate(data.breeding_date) : undefined,
    breeding_notes: data.breeding_notes ? String(data.breeding_notes) : undefined,
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
        console.log('[ACTIVITY] CSRF token fetched successfully');
      } catch (error) {
        console.warn('[ACTIVITY] CSRF fetch failed, proceeding anyway:', error);
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

// Create a new activity
export const createActivity = async (animalId: string, activityData: ActivityFormData): Promise<Activity> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeActivityFormData(activityData);
    const url = `${API_URL}/${animalId}/activities`;
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

    const newActivity = normalizeActivityResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Activity created successfully');
    return newActivity;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to create activity: ${message}`);
    throw error;
  }
};

// Fetch all activities for an animal
export const fetchActivities = async (animalId: string): Promise<Activity[]> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/activities`;
    const response = await fetch(url, {
      method: 'GET',
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

    const activities = Array.isArray(rawData.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];
    return activities.map(normalizeActivityResponse);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch activities: ${message}`);
    throw error;
  }
};

// Fetch a single activity
export const fetchActivity = async (animalId: string, activityId: string): Promise<Activity> => {
  await fetchCsrfToken();
  try {
    if (!activityId || activityId === 'undefined') {
      throw new Error('Invalid activity ID provided');
    }

    const url = `${API_URL}/${animalId}/activities/${activityId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 404) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    return normalizeActivityResponse(rawData.data || rawData);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch activity: ${message}`);
    throw error;
  }
};

// Update an activity
export const updateActivity = async (
  animalId: string,
  activityId: string,
  activityData: Partial<ActivityFormData>
): Promise<Activity> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeActivityFormData(activityData as ActivityFormData);
    const url = `${API_URL}/${animalId}/activities/${activityId}`;
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

    const updatedActivity = normalizeActivityResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Activity updated successfully');
    return updatedActivity;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to update activity: ${message}`);
    throw error;
  }
};

// Delete an activity
export const deleteActivity = async (animalId: string, activityId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/activities/${activityId}`;
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

    toast.success(rawData.message || 'Activity deleted successfully');
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to delete activity: ${message}`);
    throw error;
  }
};