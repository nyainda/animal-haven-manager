import { toast } from 'sonner';
import { apiConfig } from '@/config/api';

// Note and NoteFormData interfaces
export interface Note {
  notes_id: string;
  content: string;
  category: string;
  keywords: string[];
  file_path?: string;
  add_to_calendar: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'archived';
  due_date: string;
  created_at: string;
  updated_at: string;
  animal_id: string;
  user_id: string;
}

export interface NoteFormData {
  content: string;
  category: string;
  keywords: string[];
  file_path?: string;
  add_to_calendar: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'archived';
  due_date: string;
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
const normalizeDate = (date: string): string => {
  return new Date(date).toISOString().split('T')[0];
};

const normalizeNoteFormData = (data: NoteFormData): NoteFormData => {
  const normalized: NoteFormData = {
    content: data.content.trim(),
    category: data.category.trim(),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(k => k.trim()).filter(k => k) : [],
    add_to_calendar: Boolean(data.add_to_calendar),
    priority: ['low', 'medium', 'high'].includes(data.priority) ? data.priority : 'medium',
    status: ['pending', 'completed', 'archived'].includes(data.status) ? data.status : 'pending',
    due_date: normalizeDate(data.due_date),
  };

  if (data.file_path) normalized.file_path = data.file_path.trim();

  return normalized;
};

const normalizeNoteResponse = (data: any): Note => {
  if (!data || !data.notes_id) throw new Error('Invalid note data received');

  return {
    notes_id: String(data.notes_id),
    content: String(data.content || ''),
    category: String(data.category || ''),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    file_path: data.file_path ? String(data.file_path) : undefined,
    add_to_calendar: Boolean(data.add_to_calendar),
    priority: ['low', 'medium', 'high'].includes(data.priority) ? data.priority : 'medium',
    status: ['pending', 'completed', 'archived'].includes(data.status) ? data.status : 'pending',
    due_date: normalizeDate(data.due_date || new Date().toISOString()),
    created_at: new Date(data.created_at || new Date()).toISOString(),
    updated_at: new Date(data.updated_at || new Date()).toISOString(),
    animal_id: String(data.animal_id || ''),
    user_id: String(data.user_id || ''),
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
        console.log('[NOTE] CSRF token fetched successfully');
      } catch (error) {
        console.warn('[NOTE] CSRF fetch failed, proceeding anyway:', error);
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

// Create a new note
export const createNote = async (animalId: string, noteData: NoteFormData): Promise<Note> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeNoteFormData(noteData);
    const url = `${API_URL}/${animalId}/notes`;
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

    const newNote = normalizeNoteResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Note created successfully');
    return newNote;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to create note: ${message}`);
    throw error;
  }
};

// Fetch all notes for an animal with pagination
export const fetchNotes = async (
  animalId: string,
  options: { page?: number; perPage?: number; fields?: string[] } = {}
): Promise<Note[]> => {
  await fetchCsrfToken();
  try {
    const { page = 1, perPage = 10, fields } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(fields ? { fields: fields.join(',') } : {}),
    });
    const url = `${API_URL}/${animalId}/notes?${params}`;
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

    const notes = Array.isArray(rawData.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];
    return notes.map(normalizeNoteResponse);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch notes: ${message}`);
    throw error;
  }
};

// Fetch a single note
export const fetchNote = async (animalId: string, noteId: string): Promise<Note> => {
  await fetchCsrfToken();
  try {
    if (!noteId || noteId === 'undefined') {
      throw new Error('Invalid note ID provided');
    }

    const url = `${API_URL}/${animalId}/notes/${noteId}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 404) {
      throw new Error(`Note with ID ${noteId} not found`);
    }

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    return normalizeNoteResponse(rawData.data || rawData);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch note: ${message}`);
    throw error;
  }
};

// Update a note
export const updateNote = async (
  animalId: string,
  noteId: string,
  noteData: Partial<NoteFormData>
): Promise<Note> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeNoteFormData(noteData as NoteFormData);
    const url = `${API_URL}/${animalId}/notes/${noteId}`;
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

    const updatedNote = normalizeNoteResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Note updated successfully');
    return updatedNote;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to update note: ${message}`);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (animalId: string, noteId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/notes/${noteId}`;
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

    toast.success(rawData.message || 'Note deleted successfully');
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to delete note: ${message}`);
    throw error;
  }
};