import { toast } from 'sonner';

// Define the Task type based on your JSON structure
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

// Define the form data type for creating/updating tasks
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

// Base API URL
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
    console.log('[TASK] CSRF token fetched successfully');
  } catch (error) {
    console.warn('[TASK] CSRF fetch failed, proceeding anyway:', error);
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

// Create a new task
export const createTask = async (animalId: string, taskData: TaskFormData): Promise<Task> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/tasks`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(taskData),
    });

    console.log('[TASK] Create Task Status:', response.status);
    const rawData = await response.json();
    console.log('[TASK] Raw Create Task Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const newTask = rawData.data || rawData;
    toast.success(rawData.message || 'Task created successfully');
    console.log('[TASK] Created Task:', newTask);
    return newTask;
  } catch (error) {
    console.error('[TASK] Error creating task:', error);
    toast.error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    console.log('[TASK] Fetch Tasks Status:', response.status);
    const rawData = await response.json();
    console.log('[TASK] Raw Fetch Tasks Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const tasks = Array.isArray(rawData.data) ? rawData.data : 
                  rawData.data && Array.isArray(rawData.data.data) ? rawData.data.data : 
                  Array.isArray(rawData) ? rawData : [];
                  
    console.log('[TASK] Processed Tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error(`[TASK] Error fetching tasks for animal ${animalId}:`, error);
    toast.error(`Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch a single task
// Fetch a single task
export const fetchTask = async (animalId: string, taskId: string): Promise<Task> => {
  await fetchCsrfToken();
  try {
    // Ensure taskId is valid before making the request
    if (!taskId || taskId === 'undefined') {
      throw new Error('Invalid task ID provided');
    }
    
    
    const url = `${API_URL}/${animalId}/tasks/${taskId}`;
    console.log(`[TASK] Fetching task with URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[TASK] Fetch Task Status:', response.status);
    
    // Handle 404 specifically to provide a clearer error message
    if (response.status === 404) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    const rawData = await response.json();
    console.log('[TASK] Raw Fetch Task Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Check if the data structure matches what we expect
    const task = rawData.data || rawData;
    
    // Validate that we actually got a task object
    if (!task || !task.task_id) {
      throw new Error('Invalid task data received from server');
    }
    
    console.log('[TASK] Processed Task:', task);
    return task;
  } catch (error) {
    console.error(`[TASK] Error fetching task ${taskId} for animal ${animalId}:`, error);
    toast.error(`Failed to fetch task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Update a task
export const updateTask = async (animalId: string, taskId: string, taskData: Partial<TaskFormData>): Promise<Task> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/tasks/${taskId}`;
    const response = await fetch(url, {
      method: 'PUT', // Ensure this matches your Laravel route (PUT or PATCH)
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(taskData),
    });

    console.log('[TASK] Update Task Status:', response.status);
    const rawData = await response.json();
    console.log('[TASK] Raw Update Task Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const updatedTask = rawData.data || rawData;
    toast.success(rawData.message || 'Task updated successfully');
    console.log('[TASK] Updated Task:', updatedTask);
    return updatedTask;
  } catch (error) {
    console.error(`[TASK] Error updating task ${taskId} for animal ${animalId}:`, error);
    toast.error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    console.log('[TASK] Delete Task Status:', response.status);
    const rawData = await response.json();
    console.log('[TASK] Raw Delete Task Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success(rawData.message || 'Task deleted successfully');
  } catch (error) {
    console.error(`[TASK] Error deleting task ${taskId} for animal ${animalId}:`, error);
    toast.error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};