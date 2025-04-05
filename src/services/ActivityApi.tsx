import { toast } from 'sonner';

// Define the Activity type based on your JSON structure
export interface Activity {
  id: string;
  animal_id: string;
  activity_type: string;
  activity_date: string;
  description: string;
  notes: string;
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

// Base API URL
// const API_URL = 'http://127.0.0.1:8000/api/animals';
// const CSRF_URL = 'http://127.0.0.1:8000/sanctum/csrf-cookie';

const API_URL = 'https://animal-management-system-backend-master-fugzaz.laravel.cloud/api/animals';
const CSRF_URL = 'https://animal-management-system-backend-master-fugzaz.laravel.cloud/sanctum/csrf-cookie';

// Helper to fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    console.log('[ACTIVITY] CSRF token fetched successfully');
  } catch (error) {
    console.warn('[ACTIVITY] CSRF fetch failed, proceeding anyway:', error);
  }
};

// Helper to get authentication headers
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
    const url = `${API_URL}/${animalId}/activities`; 
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(activityData),
    });

    console.log('[ACTIVITY] Create Activity Status:', response.status);
    const rawData = await response.json();
    console.log('[ACTIVITY] Raw Create Activity Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const newActivity = rawData.data || rawData;
    toast.success(rawData.message || 'Activity created successfully');
    console.log('[ACTIVITY] Created Activity:', newActivity);
    return newActivity;
  } catch (error) {
    console.error('[ACTIVITY] Error creating activity:', error);
    toast.error(`Failed to create activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch all activities for an animal
export const fetchActivities = async (animalId: string): Promise<Activity[]> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/activities`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[ACTIVITY] Fetch Activities Status:', response.status);
    const rawData = await response.json();
    console.log('[ACTIVITY] Raw Fetch Activities Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Handle different API response formats
    const activities = Array.isArray(rawData.data) ? rawData.data : 
                  rawData.data && Array.isArray(rawData.data.data) ? rawData.data.data : 
                  Array.isArray(rawData) ? rawData : [];
                  
    console.log('[ACTIVITY] Processed Activities:', activities);
    return activities;
  } catch (error) {
    console.error(`[ACTIVITY] Error fetching activities for animal ${animalId}:`, error);
    toast.error(`Failed to fetch activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch a single activity
export const fetchActivity = async (animalId: string, activityId: string): Promise<Activity> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/activities/${activityId}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[ACTIVITY] Fetch Activity Status:', response.status);
    const rawData = await response.json();
    console.log('[ACTIVITY] Raw Fetch Activity Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const activity = rawData.data || rawData;
    console.log('[ACTIVITY] Processed Activity:', activity);
    return activity;
  } catch (error) {
    console.error(`[ACTIVITY] Error fetching activity ${activityId} for animal ${animalId}:`, error);
    toast.error(`Failed to fetch activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Update an activity
export const updateActivity = async (animalId: string, activityId: string, activityData: Partial<ActivityFormData>): Promise<Activity> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/activities/${activityId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(activityData),
    });

    console.log('[ACTIVITY] Update Activity Status:', response.status);
    const rawData = await response.json();
    console.log('[ACTIVITY] Raw Update Activity Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const updatedActivity = rawData.data || rawData;
    toast.success(rawData.message || 'Activity updated successfully');
    console.log('[ACTIVITY] Updated Activity:', updatedActivity);
    return updatedActivity;
  } catch (error) {
    console.error(`[ACTIVITY] Error updating activity ${activityId} for animal ${animalId}:`, error);
    toast.error(`Failed to update activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    console.log('[ACTIVITY] Delete Activity Status:', response.status);
    const rawData = await response.json();
    console.log('[ACTIVITY] Raw Delete Activity Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success(rawData.message || 'Activity deleted successfully');
  } catch (error) {
    console.error(`[ACTIVITY] Error deleting activity ${activityId} for animal ${animalId}:`, error);
    toast.error(`Failed to delete activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};