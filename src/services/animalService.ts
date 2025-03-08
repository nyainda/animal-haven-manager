
import { Animal, AnimalFormData } from "../types/AnimalTypes";

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchAnimals = async (): Promise<Animal[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animals`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch animals');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching animals:', error);
    throw error;
  }
};

export const fetchAnimal = async (id: string): Promise<Animal> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animals/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch animal');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching animal ${id}:`, error);
    throw error;
  }
};

export const createAnimal = async (animalData: AnimalFormData): Promise<Animal> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(animalData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create animal');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating animal:', error);
    throw error;
  }
};

export const updateAnimal = async (id: string, animalData: Partial<AnimalFormData>): Promise<Animal> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(animalData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update animal');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error updating animal ${id}:`, error);
    throw error;
  }
};

export const deleteAnimal = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animals/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete animal');
    }
  } catch (error) {
    console.error(`Error deleting animal ${id}:`, error);
    throw error;
  }
};
