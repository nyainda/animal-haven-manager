import { toast } from 'sonner';

const API_URL = 'https://animal-management-master-wyohh0.laravel.cloud/api/animals';
const CSRF_URL = 'https://animal-management-master-wyohh0.laravel.cloud/sanctum/csrf-cookie';

export interface ProductCategory {
  name: string;
  description?: string;
  measurement_unit: string;
}

export interface ProductGrade {
  name: string;
  description?: string;
  price_modifier: number;
}

export interface ProductionMethod {
  method_name: string;
  description?: string;
  requires_certification: boolean;
  is_active: boolean;
}

export interface Collector {
  name: string;
  contact_info?: string;
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

export interface ProductionStatistics {
  total_productions: number;
  total_quantity: number;
  average_price_per_unit: number;
  quality_status_counts: {
    passed: number;
    failed: number;
    pending: number;
  };
  organic_percentage: number;
  average_production_interval_days: number;
  top_product_category: string;
  total_revenue: number;
}

const fetchCsrfToken = async (): Promise<void> => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('CSRF token fetch failed');
  } catch (error) {
    console.error('CSRF token fetch failed:', error);
    throw error;
  }
};

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

export const fetchProductions = async (animalId: string): Promise<Production[]> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(`${API_URL}/${animalId}/production`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch productions');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching productions for animal ${animalId}:`, error);
    throw error;
  }
};

export const fetchProduction = async (animalId: string, productionId: string): Promise<Production> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(`${API_URL}/${animalId}/production/${productionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch production');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error(`Error fetching production ${productionId}:`, error);
    throw error;
  }
};

export const createProduction = async (animalId: string, productionData: ProductionFormData): Promise<Production> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(`${API_URL}/${animalId}/production`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(productionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error creating production for animal ${animalId}:`, error);
    throw error;
  }
};

export const updateProduction = async (
  animalId: string,
  productionId: string,
  productionData: ProductionFormData
): Promise<Production> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(`${API_URL}/${animalId}/production/${productionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(productionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error updating production ${productionId}:`, error);
    throw error;
  }
};

export const deleteProduction = async (animalId: string, productionId: string): Promise<void> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(`${API_URL}/${animalId}/production/${productionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete production');
    }
  } catch (error) {
    console.error(`Error deleting production ${productionId}:`, error);
    throw error;
  }
};

export const fetchProductionStatistics = async (animalId: string): Promise<ProductionStatistics> => {
  try {
    await fetchCsrfToken();
    const response = await fetch(`${API_URL}/${animalId}/production-statistics`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch production statistics');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error(`Error fetching production statistics for animal ${animalId}:`, error);
    throw error;
  }
};