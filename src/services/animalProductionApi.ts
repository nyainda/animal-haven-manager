import { toast } from 'sonner';

const API_URL = 'https://animal-management-master-wyohh0.laravel.cloud/api/animals';
const CSRF_URL = 'https://animal-management-master-wyohh0.laravel.cloud/sanctum/csrf-cookie';

// Exported interfaces for nested objects
export interface ProductCategory {
  name: string;
  description?: string;
  measurement_unit: string;
}

export interface ProductGrade {
  name: string;
  description?: string;
  price_modifier: number; // Matches your JSON
}

export interface ProductionMethod {
  method_name: string;
  description?: string;
  requires_certification: boolean;
  is_active: boolean;
}

export interface Collector {
  name: string;
  contact_info?: string; // Matches your JSON ("contact_info" instead of "contact_number")
}

export interface StorageLocation {
  name: string;
  location_code: string;
  description?: string;
  storage_conditions: string[];
  is_active: boolean;
}

export interface ProductionFormData {
  product_category: ProductCategory;
  product_grade: ProductGrade;
  production_method: ProductionMethod;
  collector: Collector;
  storage_location: StorageLocation;
  quantity: string;
  price_per_unit: string;
  total_price: string;
  production_date: string;
  production_time: string;
  quality_status: string;
  quality_notes?: string;
  trace_number: string;
  weather_conditions?: { temperature: number; humidity: number };
  storage_conditions?: { temperature: number; humidity: number };
  is_organic: boolean;
  certification_number?: string;
  additional_attributes?: { [key: string]: string };
  notes?: string;
}

export interface Production extends ProductionFormData {
  id: string;
  animal_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const fetchCsrfToken = async (): Promise<void> => {
  const response = await fetch(CSRF_URL, { method: 'GET', credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch CSRF token');
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const xsrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
  };
};

export const fetchProductions = async (animalId: string): Promise<Production[]> => {
  await fetchCsrfToken();
  const response = await fetch(`${API_URL}/${animalId}/production`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch productions');
  return data.data || [];
};

export const fetchProduction = async (animalId: string, productionId: string): Promise<Production> => {
  await fetchCsrfToken();
  const response = await fetch(`${API_URL}/${animalId}/production/${productionId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch production');
  return data.data || data;
};

export const createProduction = async (animalId: string, productionData: ProductionFormData): Promise<Production> => {
  await fetchCsrfToken();
  const payload = {
    ...productionData,
    quantity: productionData.quantity.toString(),
    price_per_unit: productionData.price_per_unit.toString(),
    total_price: productionData.total_price.toString(),
  };
  const response = await fetch(`${API_URL}/${animalId}/production`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.data;
};

export const updateProduction = async (
  animalId: string,
  productionId: string,
  productionData: Partial<ProductionFormData>
): Promise<Production> => {
  await fetchCsrfToken();
  const payload = {
    ...productionData,
    quantity: productionData.quantity?.toString(),
    price_per_unit: productionData.price_per_unit?.toString(),
    total_price: productionData.total_price?.toString(),
  };
  const response = await fetch(`${API_URL}/${animalId}/production/${productionId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.data;
};

export const deleteProduction = async (animalId: string, productionId: string): Promise<void> => {
  await fetchCsrfToken();
  const response = await fetch(`${API_URL}/${animalId}/production/${productionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete production');
};