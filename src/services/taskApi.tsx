import { toast } from 'sonner';
import { apiConfig } from '@/config/api';

// Task and TaskFormData interfaces (unchanged)
export interface Task {
  task_id: string;
  title: string;
  task_type: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  duration: number;
  description?: string;
  health_notes?: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'archived';
  repeats?: 'daily' | 'weekly' | 'monthly';
  repeat_frequency?: number;
  end_repeat_date?: string;
  created_at: string;
  updated_at: string;
  animal_id: string;
}

export interface TaskFormData {
  title: string;
  task_type: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  duration: number;
  description?: string;
  health_notes?: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'archived';
  repeats?: 'daily' | 'weekly' | 'monthly';
  repeat_frequency?: number;
  end_repeat_date?: string;
}

// Custom error class to include field-specific errors
class ApiValidationError extends Error {
  public errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.errors = errors;
    this.name = 'ApiValidationError';
  }
}

// Base API URL and CSRF cache (unchanged)
const API_URL = apiConfig.API_URL;
const CSRF_URL = apiConfig.CSRF_URL;
let csrfTokenPromise: Promise<void> | null = null;

// Normalization functions (unchanged from previous response)
const normalizeDateTime = (date: string, time: string): { date: string; time: string } => {
  const normalizedDate = new Date(date).toISOString().split('T')[0];
  const normalizedTime = time.match(/^\d{2}:\d{2}$/) ? time : new Date(`1970-01-01T${time}`).toTimeString().slice(0, 5);
  return { date: normalizedDate, time: normalizedTime };
};

const normalizeTaskFormData = (data: TaskFormData): TaskFormData => {
  const normalized: TaskFormData = {
    title: data.title.trim(),
    task_type: data.task_type.trim(),
    start_date: normalizeDateTime(data.start_date, data.start_time).date,
    start_time: normalizeDateTime(data.start_date, data.start_time).time,
    end_date: normalizeDateTime(data.end_date, data.end_time).date,
    end_time: normalizeDateTime(data.end_date, data.end_time).time,
    duration: Math.max(0, Math.round(data.duration)),
    priority: ['low', 'medium', 'high'].includes(data.priority) ? data.priority : 'medium',
    status: ['pending', 'completed', 'archived'].includes(data.status) ? data.status : 'pending',
  };

  if (data.description) normalized.description = data.description.trim();
  if (data.health_notes) normalized.health_notes = data.health_notes.trim();
  if (data.location) normalized.location = data.location.trim();
  if (data.repeats) normalized.repeats = ['daily', 'weekly', 'monthly'].includes(data.repeats) ? data.repeats : undefined;
  if (data.repeat_frequency) normalized.repeat_frequency = Math.max(1, Math.round(data.repeat_frequency));
  if (data.end_repeat_date) normalized.end_repeat_date = normalizeDateTime(data.end_repeat_date, '00:00').date;

  return normalized;
};

const normalizeTaskResponse = (data: any): Task => {
  if (!data || !data.task_id) throw new Error('Invalid task data received');

  return {
    task_id: String(data.task_id),
    title: String(data.title || ''),
    task_type: String(data.task_type || ''),
    start_date: normalizeDateTime(data.start_date || new Date().toISOString(), data.start_time || '00:00').date,
    start_time: normalizeDateTime(data.start_date || new Date().toISOString(), data.start_time || '00:00').time,
    end_date: normalizeDateTime(data.end_date || new Date().toISOString(), data.end_time || '00:00').date,
    end_time: normalizeDateTime(data.end_date || new Date().toISOString(), data.end_time || '00:00').time,
    duration: Number(data.duration || 0),
    description: data.description ? String(data.description) : undefined,
    health_notes: data.health_notes ? String(data.health_notes) : undefined,
    location: data.location ? String(data.location) : undefined,
    priority: ['low', 'medium', 'high'].includes(data.priority) ? data.priority : 'medium',
    status: ['pending', 'completed', 'archived'].includes(data.status) ? data.status : 'pending',
    repeats: ['daily', 'weekly', 'monthly'].includes(data.repeats) ? data.repeats : undefined,
    repeat_frequency: data.repeat_frequency ? Number(data.repeat_frequency) : undefined,
    end_repeat_date: data.end_repeat_date ? normalizeDateTime(data.end_repeat_date, '00:00').date : undefined,
    created_at: new Date(data.created_at || new Date()).toISOString(),
    updated_at: new Date(data.updated_at || new Date()).toISOString(),
    animal_id: String(data.animal_id || ''),
  };
};

// Fetch CSRF token (unchanged)
const fetchCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = (async () => {
      try {
        const response = await fetch(CSRF_URL, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        console.log('[TASK] CSRF token fetched successfully');
      } catch (error) {
        console.warn('[TASK] CSRF fetch failed, proceeding anyway:', error);
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

// Create a new task
export const createTask = async (animalId: string, taskData: TaskFormData): Promise<Task> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeTaskFormData(taskData);
    const url = `${API_URL}/${animalId}/tasks`;
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

    const newTask = normalizeTaskResponse(rawData.data || rawData);
    toast.success(rawData.message ||  'Task created successfully');
    return newTask;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message); 
      throw error; 
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to create task: ${message}`);
    throw error;
  }
};

// Fetch all tasks for an animal
export const fetchTasks = async (animalId: string): Promise<Task[]> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/tasks`;
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

    const tasks = Array.isArray(rawData.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];
    return tasks.map(normalizeTaskResponse);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch tasks: ${message}`);
    throw error;
  }
};

// Fetch a single task
export const fetchTask = async (animalId: string, taskId: string): Promise<Task> => {
  await fetchCsrfToken();
  try {
    if (!taskId || taskId === 'undefined') {
      throw new Error('Invalid task ID provided');
    }

    const url = `${API_URL}/${animalId}/tasks/${taskId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 404) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    return normalizeTaskResponse(rawData.data || rawData);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch task: ${message}`);
    throw error;
  }
};

// Update a task
export const updateTask = async (animalId: string, taskId: string, taskData: Partial<TaskFormData>): Promise<Task> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeTaskFormData(taskData as TaskFormData); 
    const url = `${API_URL}/${animalId}/tasks/${taskId}`;
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

    const updatedTask = normalizeTaskResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Task updated successfully');
    return updatedTask;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to update task: ${message}`);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (animalId: string, taskId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/tasks/${taskId}`;
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

    toast.success(rawData.message || 'Task deleted successfully');
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to delete task: ${message}`);
    throw error;
  }
};