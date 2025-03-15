import { toast } from 'sonner';

const API_URL = 'https://animal-management-master-wyohh0.laravel.cloud/api/animals';
const CSRF_URL = 'https://animal-management-master-wyohh0.laravel.cloud/sanctum/csrf-cookie';

export interface ProductCategory {
  id?: string;
  name: string;
  description: string;
  measurement_unit: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductGrade {
  id?: string;
  name: string;
  description: string;
  price_modifier: number;
  product_category_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductionMethod {
  id?: string;
  method_name: string;
  description: string;
  requires_certification: boolean;
  is_active: boolean;
  product_category_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Collector {
  id?: string;
  name: string;
  employee_id?: string | null;
  contact_number?: string | null;
  certification_number?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StorageLocation {
  id?: string;
  name: string;
  location_code: string;
  description: string;
  storage_conditions: { temperature: string; humidity: string };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  weather_conditions?: { temperature: string; humidity: string };
  storage_conditions?: { temperature: string; humidity: string };
  is_organic: boolean;
  certification_number?: string;
  additional_attributes?: { [key: string]: string };
  notes?: string;
}

export interface Production extends ProductionFormData {
  id: string;
  animal_id: string;
  user_id: string;
  product_category_id?: string;
  product_grade_id?: string;
  production_method_id?: string;
  collector_id?: string;
  storage_location_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductionStatistics {
  total_production: number;
  average_production: number;
  quality_distribution: { [key: string]: number };
  production_trends: { [key: string]: number };
  top_production_methods: { [key: string]: number };
  top_product_grades: { [key: string]: number };
  organic_vs_non_organic: { [key: string]: number };
}

let csrfTokenFetched = false;

const fetchCsrfToken = async (): Promise<void> => {
  if (csrfTokenFetched) return;
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`CSRF token fetch failed with status ${response.status}`);
    }
    console.log('CSRF token fetched successfully');
    csrfTokenFetched = true;
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

  console.log('Auth token:', token, 'XSRF token:', xsrfToken); // Debug tokens
  if (!token) console.warn('No auth token found in localStorage');

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
    const url = `${API_URL}/${animalId}/production`;
    console.log('Fetching productions from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch productions: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Productions response:', responseData);
    const productionList = Array.isArray(responseData) ? responseData : responseData.data || [];
    if (!productionList.length) console.log('No productions returned for animal:', animalId);
    return productionList;
  } catch (error) {
    console.error(`Error fetching productions for animal ${animalId}:`, error);
    throw error;
  }
};

// ... (other functions remain unchanged unless you report issues with them)

export const fetchProduction = async (animalId: string, productionId: string): Promise<Production> => {
  try {
    await fetchCsrfToken();
    const url = `${API_URL}/${animalId}/production/${productionId}`;
    console.log('Fetching production from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch production: ${response.status}`);
    }

    const data = await response.json();
    console.log('Production response:', data);
    return data.data || data;
  } catch (error) {
    console.error(`Error fetching production ${productionId}:`, error);
    throw error;
  }
};


export const createProduction = async (animalId: string, productionData: ProductionFormData): Promise<Production> => {
  try {
    await fetchCsrfToken();

    // Send data as-is, no conversion to numbers
    const payload = {
      ...productionData,
    };

    const response = await fetch(`${API_URL}/${animalId}/production`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    toast.success('Production created successfully');
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

    // Send data as-is, no conversion to numbers
    const payload = {
      ...productionData,
    };

    const response = await fetch(`${API_URL}/${animalId}/production/${productionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    toast.success('Production updated successfully');
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
    toast.success('Production deleted successfully');
  } catch (error) {
    console.error(`Error deleting production ${productionId}:`, error);
    throw error;
  }
};

export const fetchProductionStatistics = async (animalId: string): Promise<ProductionStatistics> => {
  try {
    await fetchCsrfToken();
    const url = `${API_URL}/${animalId}/production-statistics`; // Updated endpoint
    console.log('Fetching production statistics from:', url); // Debug log
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch production statistics');
    }

    const data = await response.json();
    console.log('Production statistics response:', data); // Debug log
    return data.data || data;
  } catch (error) {
    console.error(`Error fetching production statistics for animal ${animalId}:`, error);
    throw error;
  }
};