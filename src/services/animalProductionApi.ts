import { toast } from 'sonner';
import { apiConfig } from '@/config/api';

const API_URL = apiConfig.API_URL;
const CSRF_URL = apiConfig.CSRF_URL;

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
  yield_id?: string; // Added yield_id to the interface
  animal_id: string;
  unit?: string;
  weight?: string;
  quality?: string;
  user_id: string;
  product_category_id?: string;
  product_grade_id?: string;
  production_method_id?: string;
  collector_id?: string;
  storage_location_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  animal_type?: string; // Add this
  breed?: string; //
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

interface ApiResponse {
  code: number;
  data: Production[];
  message: string;
  success: boolean;
}

// Animal production types mapping
export const productionTypesByAnimal = {
  // Dairy animals
  cattle: ["Milk", "Meat"],
  goat: ["Milk", "Meat"],
  sheep: ["Milk", "Meat", "Wool"],
  buffalo: ["Milk", "Meat"],
  camel: ["Milk", "Meat"],
  donkey: ["Milk"],
  
  // Poultry/birds
  chicken: ["Eggs", "Meat"],
  duck: ["Eggs", "Meat"],
  turkey: ["Eggs", "Meat"],
  quail: ["Eggs", "Meat"],
  pheasant: ["Eggs", "Meat"],
  geese: ["Eggs", "Meat"],
  ostrich: ["Eggs", "Meat"],
  emu: ["Eggs", "Meat"],
  "guinea fowl": ["Eggs", "Meat"],
  
  // Meat animals
  pig: ["Meat"],
  rabbit: ["Meat", "Fur"],
  deer: ["Meat", "Antlers"],
  bison: ["Meat"],
  
  // Fiber animals
  alpaca: ["Fiber", "Meat"],
  llama: ["Fiber", "Meat"],
  
  // Working animals
  horse: ["Service"],
  mule: ["Service"],
  
  // Aquaculture
  fish: ["Meat"],
  
  // For custom animals
  other: ["Custom Production"]
};

// Production measurement units mapping
export const measurementUnitsByProductionType = {
  Milk: ["Liters", "Gallons", "kg"],
  Eggs: ["Count", "Dozen"],
  Meat: ["kg", "lbs"],
  Wool: ["kg", "lbs"],
  Fiber: ["kg", "lbs"],
  Fur: ["Count", "kg"],
  Antlers: ["Count", "kg"],
  Service: ["Hours", "Days"],
  "Custom Production": ["Custom Unit"]
};

// Production quality grades mapping
export const qualityGradesByProductionIQType = {
  Milk: ["Grade A", "Grade B", "Premium", "Organic", "Raw"],
  Eggs: ["Grade A", "Grade B", "Premium", "Organic", "Free Range"],
  Meat: ["Premium", "Standard", "Organic", "Grass-fed", "Grain-fed"],
  Wool: ["Fine", "Medium", "Coarse", "Premium"],
  Fiber: ["Fine", "Medium w", "Coarse", "Premium"],
  Fur: ["Premium", "Standard"],
  Antlers: ["Premium", "Standard"],
  Service: ["Certified", "Trained", "In Training"],
  "Custom Production": ["Custom Grade"]
};

// Production methods mapping
export const productionMethodsByProductionType = {
  Milk: ["Traditional Milking", "Machine Milking", "Robotic Milking", "Organic"],
  Eggs: ["Free Range", "Cage-Free", "Conventional", "Organic", "Pastured"],
  Meat: ["Grass-Fed", "Grain-Fed", "Organic", "Free Range", "Conventional"],
  Wool: ["Hand Shearing", "Machine Shearing"],
  Fiber: ["Hand Shearing", "Machine Shearing"],
  Fur: ["Traditional", "Humane"],
  Antlers: ["Natural Shed", "Harvested"],
  Service: ["Training", "Working", "Recreational"],
  "Custom Production": ["Custom Method"]
};

const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    console.log('[PRODUCTION] CSRF token fetched successfully');
  } catch (error) {
    console.error('[PRODUCTION] CSRF fetch failed:', error);
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

    const responseData: ApiResponse = await response.json();
    console.log('Productions response:', responseData);

    // Extract the 'data' property, default to empty array if missing
    const productionList = responseData.data || [];
    if (!productionList.length) console.log('No productions returned for animal:', animalId);
    return productionList;
  } catch (error) {
    console.error(`Error fetching productions for animal ${animalId}:`, error);
    throw error;
  }
};

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
    console.error(`Error fetching production ${productionId} for animal ${animalId}:`, error);
    throw new Error(`Unable to fetch production: ${error.message}`);
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

    // Determine which ID to use for the API endpoint
    // Check if the production object itself has a yield_id
    const production = productionData as Production;
    const idToUse = production.yield_id || productionId;
    
    console.log(`[PRODUCTION] Updating production using ID: ${idToUse} (yield_id: ${production.yield_id}, productionId: ${productionId})`);
    
    const response = await fetch(`${API_URL}/${animalId}/production/${idToUse}`, {
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

// Modified to support yield_id for deletion
export const deleteProduction = async (animalId: string, productionIdOrYieldId: string): Promise<void> => {
  await fetchCsrfToken(); // Fetch CSRF token first
  try {
    // Use the provided ID (which could be either production ID or yield_id)
    const url = `${API_URL}/${animalId}/production/${productionIdOrYieldId}`;
    console.log('[PRODUCTION] Deleting production at:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[PRODUCTION] Delete Production Status:', response.status);
    const rawData = await response.json();
    console.log('[PRODUCTION] Raw Delete Production Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success(rawData.message || 'Production deleted successfully');
  } catch (error) {
    console.error(`[PRODUCTION] Error deleting production ${productionIdOrYieldId} for animal ${animalId}:`, error);
    toast.error(`Failed to delete production: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const fetchProductionStatistics = async (animalId: string): Promise<ProductionStatistics> => {
  try {
    await fetchCsrfToken();
    const url = `${API_URL}/${animalId}/production-statistics`;
    console.log('Fetching production statistics from:', url);
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
    console.log('Production statistics response:', data);
    return data.data || data;
  } catch (error) {
    console.error(`Error fetching production statistics for animal ${animalId}:`, error);
    throw error;
  }
};