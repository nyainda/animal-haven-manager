import { toast } from 'sonner';

// Base API URL and CSRF endpoint
const API_URL = 'https://animal-management-master-wyohh0.laravel.cloud/api/animals';
const CSRF_URL = 'https://animal-management-master-wyohh0.laravel.cloud/sanctum/csrf-cookie';

// Interface for form data (what we send to the API)
export interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  tax_number?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  type: string;
  product_type: string;
  shop_name: string;
  business_registration_number?: string;
  contract_start_date: string;
  contract_end_date: string;
  account_holder?: string;
  account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  swift_code?: string;
  iban?: string;
  supplier_importance: string;
  inventory_level: number;
  reorder_point: number;
  minimum_order_quantity: number;
  lead_time_days: number;
  payment_terms: string;
  credit_limit: number;
  currency: string;
  tax_rate: number;
  supplier_rating: number;
  status: string;
  notes?: string;
  meta_data?: { [key: string]: string };
  contact_name?: string;
  contact_position?: string;
  contact_email?: string;
  contact_phone?: string;
}

// Interface for API response data (includes additional fields)
export interface Supplier extends SupplierFormData {
  id: string;
  website?: string | null;
  created_at: string;
  updated_at: string;
  contact: {
    name: string | null;
    position: string | null;
    email: string | null;
    phone: string | null;
  };
}

// Fetch CSRF token for authenticated requests
const fetchCsrfToken = async (): Promise<void> => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
    }
    console.log('[SUPPLIER] CSRF token fetched successfully');
  } catch (error) {
    console.warn('[SUPPLIER] CSRF fetch failed:', error);
    throw error; // Re-throw to handle in calling functions if needed
  }
};

// Get authentication headers (Bearer token and XSRF token)
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token'); // Adjust based on your auth system
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
  };
};

// Fetch all suppliers for an animal )
export const fetchSuppliers = async (animalId: string): Promise<Supplier[]> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/suppliers`;
    console.log('[SUPPLIER] Fetching suppliers:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const rawData = await response.json();
    console.log('[SUPPLIER] Raw response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return rawData.data || [];
  } catch (error) {
    console.error(`[SUPPLIER] Error fetching suppliers for animal ${animalId}:`, error);
    toast.error(`Failed to fetch suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch a single supplier (GET /api/animals/{animal}/suppliers/{supplier})
export const fetchSupplier = async (animalId: string, supplierId: string): Promise<Supplier> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/suppliers/${supplierId}`;
    console.log('[SUPPLIER] Fetching supplier:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const rawData = await response.json();
    console.log('[SUPPLIER] Raw response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return rawData.data || rawData;
  } catch (error) {
    console.error(`[SUPPLIER] Error fetching supplier ${supplierId} for animal ${animalId}:`, error);
    toast.error(`Failed to fetch supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Create a supplier (POST /api/animals/{animal}/suppliers)
export const createSupplier = async (animalId: string, supplierData: SupplierFormData): Promise<Supplier> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/suppliers`;
    console.log('[SUPPLIER] Creating supplier:', url, supplierData);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(supplierData),
    });

    const rawData = await response.json();
    console.log('[SUPPLIER] Raw response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success(rawData.message || 'Supplier created successfully');
    return rawData.data;
  } catch (error) {
    console.error(`[SUPPLIER] Error creating supplier for animal ${animalId}:`, error);
    toast.error(`Failed to create supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Update a supplier (PUT /api/animals/{animal}/suppliers/{supplier})
export const updateSupplier = async (
  animalId: string,
  supplierId: string,
  supplierData: Partial<SupplierFormData>
): Promise<Supplier> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/suppliers/${supplierId}`;
    console.log('[SUPPLIER] Updating supplier:', url, supplierData);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(supplierData),
    });

    const rawData = await response.json();
    console.log('[SUPPLIER] Raw response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success(rawData.message || 'Supplier updated successfully');
    return rawData.data;
  } catch (error) {
    console.error(`[SUPPLIER] Error updating supplier ${supplierId} for animal ${animalId}:`, error);
    toast.error(`Failed to update supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Delete a supplier (DELETE /api/animals/{animal}/suppliers/{supplier})
export const deleteSupplier = async (animalId: string, supplierId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/suppliers/${supplierId}`;
    console.log('[SUPPLIER] Deleting supplier:', url);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const rawData = await response.json();
    console.log('[SUPPLIER] Raw response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    toast.success(rawData.message || 'Supplier deleted successfully');
  } catch (error) {
    console.error(`[SUPPLIER] Error deleting supplier ${supplierId} for animal ${animalId}:`, error);
    toast.error(`Failed to delete supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};