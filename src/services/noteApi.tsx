import { toast } from 'sonner';

// Define the Note type based on your JSON structure
export interface Note {
  notes_id: string;
  content: string;
  category: string;
  keywords: string[];
  file_path: string;
  add_to_calendar: boolean;
  priority: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  animal_id: string;
  user_id: string;
}

// Define the form data type for creating/updating notes
export interface NoteFormData {
  content: string;
  category: string;
  keywords: string[];
  file_path?: string;
  add_to_calendar: boolean;
  status: string;
  priority: string;
  due_date: string;
}

// Base API URL
const API_URL = 'http://127.0.0.1:8000/api/animals';
const CSRF_URL = 'http://127.0.0.1:8000/sanctum/csrf-cookie';

// Helper to fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    console.log('[NOTE] CSRF token fetched successfully');
  } catch (error) {
    console.warn('[NOTE] CSRF fetch failed, proceeding anyway:', error);
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

// Create a new note
export const createNote = async (animalId: string, noteData: NoteFormData): Promise<Note> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/notes`; // Correct endpoint for creating notes
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(noteData),
    });

    console.log('[NOTE] Create Note Status:', response.status);
    const rawData = await response.json();
    console.log('[NOTE] Raw Create Note Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const newNote = rawData.data || rawData;
    toast.success(rawData.message || 'Note created successfully');
    console.log('[NOTE] Created Note:', newNote);
    return newNote;
  } catch (error) {
    console.error('[NOTE] Error creating note:', error);
    toast.error(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch all notes for an animal (optional, for completeness)
export const fetchNotes = async (animalId: string): Promise<Note[]> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/notes`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[NOTE] Fetch Notes Status:', response.status);
    const rawData = await response.json();
    console.log('[NOTE] Raw Fetch Notes Response:', rawData);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const notes = Array.isArray(rawData.data) ? rawData.data : rawData;
    console.log('[NOTE] Processed Notes:', notes);
    return notes;
  } catch (error) {
    console.error(`[NOTE] Error fetching notes for animal ${animalId}:`, error);
    toast.error(`Failed to fetch notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};