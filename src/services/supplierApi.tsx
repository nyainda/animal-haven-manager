import { toast } from 'sonner';
import { apiConfig } from '@/config/api';

// Supplier and SupplierFormData interfaces
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
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  meta_data?: { [key: string]: string };
  contact_name?: string;
  contact_position?: string;
  contact_email?: string;
  contact_phone?: string;
}

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

const normalizeSupplierFormData = (data: SupplierFormData): SupplierFormData => {
  const normalized: SupplierFormData = {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    postal_code: data.postal_code.trim(),
    country: data.country.trim(),
    type: data.type.trim(),
    product_type: data.product_type.trim(),
    shop_name: data.shop_name.trim(),
    contract_start_date: normalizeDate(data.contract_start_date),
    contract_end_date: normalizeDate(data.contract_end_date),
    supplier_importance: data.supplier_importance.trim(),
    inventory_level: Math.max(0, Math.round(data.inventory_level)),
    reorder_point: Math.max(0, Math.round(data.reorder_point)),
    minimum_order_quantity: Math.max(0, Math.round(data.minimum_order_quantity)),
    lead_time_days: Math.max(0, Math.round(data.lead_time_days)),
    payment_terms: data.payment_terms.trim(),
    credit_limit: Math.max(0, Number(data.credit_limit.toFixed(2))),
    currency: data.currency.trim(),
    tax_rate: Math.max(0, Number(data.tax_rate.toFixed(2))),
    supplier_rating: Math.max(0, Math.min(5, Number(data.supplier_rating.toFixed(1)))),
    status: ['active', 'inactive', 'pending'].includes(data.status) ? data.status : 'pending',
  };

  if (data.tax_number) normalized.tax_number = data.tax_number.trim();
  if (data.latitude) normalized.latitude = Number(data.latitude.toFixed(6));
  if (data.longitude) normalized.longitude = Number(data.longitude.toFixed(6));
  if (data.business_registration_number) normalized.business_registration_number = data.business_registration_number.trim();
  if (data.account_holder) normalized.account_holder = data.account_holder.trim();
  if (data.account_number) normalized.account_number = data.account_number.trim();
  if (data.bank_name) normalized.bank_name = data.bank_name.trim();
  if (data.bank_branch) normalized.bank_branch = data.bank_branch.trim();
  if (data.swift_code) normalized.swift_code = data.swift_code.trim();
  if (data.iban) normalized.iban = data.iban.trim();
  if (data.notes) normalized.notes = data.notes.trim();
  if (data.meta_data) normalized.meta_data = Object.fromEntries(
    Object.entries(data.meta_data).map(([k, v]) => [k.trim(), v.trim()])
  );
  if (data.contact_name) normalized.contact_name = data.contact_name.trim();
  if (data.contact_position) normalized.contact_position = data.contact_position.trim();
  if (data.contact_email) normalized.contact_email = data.contact_email.trim();
  if (data.contact_phone) normalized.contact_phone = data.contact_phone.trim();

  return normalized;
};

const normalizeSupplierResponse = (data: any): Supplier => {
  if (!data || !data.id) throw new Error('Invalid supplier data received');

  return {
    id: String(data.id),
    name: String(data.name || ''),
    email: String(data.email || ''),
    phone: String(data.phone || ''),
    tax_number: data.tax_number ? String(data.tax_number) : undefined,
    address: String(data.address || ''),
    city: String(data.city || ''),
    state: String(data.state || ''),
    postal_code: String(data.postal_code || ''),
    country: String(data.country || ''),
    latitude: data.latitude ? Number(data.latitude) : undefined,
    longitude: data.longitude ? Number(data.longitude) : undefined,
    type: String(data.type || ''),
    product_type: String(data.product_type || ''),
    shop_name: String(data.shop_name || ''),
    business_registration_number: data.business_registration_number ? String(data.business_registration_number) : undefined,
    contract_start_date: normalizeDate(data.contract_start_date || new Date().toISOString()),
    contract_end_date: normalizeDate(data.contract_end_date || new Date().toISOString()),
    account_holder: data.account_holder ? String(data.account_holder) : undefined,
    account_number: data.account_number ? String(data.account_number) : undefined,
    bank_name: data.bank_name ? String(data.bank_name) : undefined,
    bank_branch: data.bank_branch ? String(data.bank_branch) : undefined,
    swift_code: data.swift_code ? String(data.swift_code) : undefined,
    iban: data.iban ? String(data.iban) : undefined,
    supplier_importance: String(data.supplier_importance || ''),
    inventory_level: Number(data.inventory_level || 0),
    reorder_point: Number(data.reorder_point || 0),
    minimum_order_quantity: Number(data.minimum_order_quantity || 0),
    lead_time_days: Number(data.lead_time_days || 0),
    payment_terms: String(data.payment_terms || ''),
    credit_limit: Number(data.credit_limit || 0),
    currency: String(data.currency || ''),
    tax_rate: Number(data.tax_rate || 0),
    supplier_rating: Number(data.supplier_rating || 0),
    status: ['active', 'inactive', 'pending'].includes(data.status) ? data.status : 'pending',
    notes: data.notes ? String(data.notes) : undefined,
    meta_data: data.meta_data ? Object.fromEntries(
      Object.entries(data.meta_data).map(([k, v]) => [String(k), String(v)])
    ) : undefined,
    contact_name: data.contact_name ? String(data.contact_name) : undefined,
    contact_position: data.contact_position ? String(data.contact_position) : undefined,
    contact_email: data.contact_email ? String(data.contact_email) : undefined,
    contact_phone: data.contact_phone ? String(data.contact_phone) : undefined,
    website: data.website ? String(data.website) : null,
    created_at: new Date(data.created_at || new Date()).toISOString(),
    updated_at: new Date(data.updated_at || new Date()).toISOString(),
    contact: {
      name: data.contact?.name ? String(data.contact.name) : null,
      position: data.contact?.position ? String(data.contact.position) : null,
      email: data.contact?.email ? String(data.contact.email) : null,
      phone: data.contact?.phone ? String(data.contact.phone) : null,
    },
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
        console.log('[SUPPLIER] CSRF token fetched successfully');
      } catch (error) {
        console.warn('[SUPPLIER] CSRF fetch failed, proceeding anyway:', error);
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

// Fetch all suppliers for an animal with pagination
export const fetchSuppliers = async (
  animalId: string,
  options: { page?: number; perPage?: number; fields?: string[] } = {}
): Promise<Supplier[]> => {
  await fetchCsrfToken();
  try {
    const { page = 1, perPage = 10, fields } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(fields ? { fields: fields.join(',') } : {}),
    });
    const url = `${API_URL}/${animalId}/suppliers?${params}`;
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

    const suppliers = Array.isArray(rawData.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];
    return suppliers.map(normalizeSupplierResponse);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch suppliers: ${message}`);
    throw error;
  }
};

// Fetch a single supplier
export const fetchSupplier = async (animalId: string, supplierId: string): Promise<Supplier> => {
  await fetchCsrfToken();
  try {
    if (!supplierId || supplierId === 'undefined') {
      throw new Error('Invalid supplier ID provided');
    }

    const url = `${API_URL}/${animalId}/suppliers/${supplierId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 404) {
      throw new Error(`Supplier with ID ${supplierId} not found`);
    }

    const rawData = await response.json();
    if (!response.ok) {
      if (rawData.errors && typeof rawData.errors === 'object') {
        throw new ApiValidationError(rawData.message || `API error: ${response.status}`, rawData.errors);
      }
      throw new Error(rawData.message || `API error: ${response.status}`);
    }

    return normalizeSupplierResponse(rawData.data || rawData);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch supplier: ${message}`);
    throw error;
  }
};

// Create a supplier
export const createSupplier = async (animalId: string, supplierData: SupplierFormData): Promise<Supplier> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeSupplierFormData(supplierData);
    const url = `${API_URL}/${animalId}/suppliers`;
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

    const newSupplier = normalizeSupplierResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Supplier created successfully');
    return newSupplier;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to create supplier: ${message}`);
    throw error;
  }
};

// Update a supplier
export const updateSupplier = async (
  animalId: string,
  supplierId: string,
  supplierData: Partial<SupplierFormData>
): Promise<Supplier> => {
  await fetchCsrfToken();
  try {
    const normalizedData = normalizeSupplierFormData(supplierData as SupplierFormData);
    const url = `${API_URL}/${animalId}/suppliers/${supplierId}`;
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

    const updatedSupplier = normalizeSupplierResponse(rawData.data || rawData);
    toast.success(rawData.message || 'Supplier updated successfully');
    return updatedSupplier;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to update supplier: ${message}`);
    throw error;
  }
};

// Delete a supplier
export const deleteSupplier = async (animalId: string, supplierId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    const url = `${API_URL}/${animalId}/suppliers/${supplierId}`;
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

    toast.success(rawData.message || 'Supplier deleted successfully');
  } catch (error) {
    if (error instanceof ApiValidationError) {
      toast.error(error.message);
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to delete supplier: ${message}`);
    throw error;
  }
};