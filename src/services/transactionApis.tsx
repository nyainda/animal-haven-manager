import { toast } from 'sonner';
import { apiConfig } from '@/config/api';

// Define the Transaction interface
export interface Transaction {
  id: string;
  transaction_type: string;
  price: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  transaction_date: string;
  delivery_date: string;
  details?: string | null;
  payment_method: string;
  payment_reference?: string | null;
  deposit_amount?: number | null;
  balance_due?: number | null;
  payment_due_date?: string | null;
  transaction_status?: string | null;
  seller_id?: number;
  buyer_id?: number;
  seller_name?: string;
  buyer_name?: string;
  
  // Additional seller fields
  seller_company?: string | null;
  seller_tax_id?: string | null;
  seller_contact?: string | null;
  seller_email?: string | null;
  seller_phone?: string | null;
  seller_address?: string | null;
  seller_city?: string | null;
  seller_state?: string | null;
  seller_country?: string | null;
  seller_postal_code?: string | null;
  seller_identification?: string | null;
  seller_license_number?: string | null;
  
  // Additional buyer fields
  buyer_company?: string | null;
  buyer_tax_id?: string | null;
  buyer_contact?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  buyer_address?: string | null;
  buyer_city?: string | null;
  buyer_state?: string | null;
  buyer_country?: string | null;
  buyer_postal_code?: string | null;
  buyer_identification?: string | null;
  buyer_license_number?: string | null;
  
  // Additional transaction metadata
  invoice_number?: string | null;
  contract_number?: string | null;
  terms_accepted?: boolean | null;
  terms_accepted_at?: string | null;
  
  // Animal-specific information
  animal_id: string;
  health_certificate_number?: string | null;
  transport_license_number?: string | null;
  
  // Documentation and legal fields
  attached_documents?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploaded_at: string;
  }> | null;
  
  // Location information
  location_of_sale?: string | null;
  
  // Terms and conditions
  terms_and_conditions?: string | null;
  special_conditions?: string | null;
  delivery_instructions?: string | null;
  
  // Insurance information
  insurance_policy_number?: string | null;
  insurance_amount?: number | null;
  
  // Financial tracking
  payment_history?: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    payment_reference?: string | null;
    notes?: string | null;
  }> | null;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

// Enhanced TransactionFormData with the new fields
export interface TransactionFormData {
  transaction_type: string;
  price: number;
  tax_amount: number;
  currency: string;
  transaction_date: string;
  delivery_date: string;
  details?: string | null;
  payment_method: string;
  payment_reference?: string | null;
  deposit_amount?: number | null;
  payment_due_date?: string | null;
  seller_id?: number;
  buyer_id?: number;
  seller_name?: string;
  buyer_name?: string;
  
  // Additional seller fields
  seller_company?: string | null;
  seller_tax_id?: string | null;
  seller_contact?: string | null;
  seller_email?: string | null;
  seller_phone?: string | null;
  seller_address?: string | null;
  seller_city?: string | null;
  seller_state?: string | null;
  seller_country?: string | null;
  seller_postal_code?: string | null;
  seller_identification?: string | null;
  seller_license_number?: string | null;
  
  // Additional buyer fields
  buyer_company?: string | null;
  buyer_tax_id?: string | null;
  buyer_contact?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  buyer_address?: string | null;
  buyer_city?: string | null;
  buyer_state?: string | null;
  buyer_country?: string | null;
  buyer_postal_code?: string | null;
  buyer_identification?: string | null;
  buyer_license_number?: string | null;
  
  // Additional transaction metadata
  invoice_number?: string | null;
  contract_number?: string | null;
  terms_accepted?: boolean | null;
  
  // Animal-specific information
  health_certificate_number?: string | null;
  transport_license_number?: string | null;
  
  // Documentation and legal fields
  attached_documents?: Array<{
    id?: string;
    name: string;
    file?: File; // For file uploads
    url?: string;
    type?: string;
  }> | null;
  
  // Location information
  location_of_sale?: string | null;
  
  // Terms and conditions
  terms_and_conditions?: string | null;
  special_conditions?: string | null;
  delivery_instructions?: string | null;
  
  // Insurance information
  insurance_policy_number?: string | null;
  insurance_amount?: number | null;
}

// Define the transaction summary interface
export interface TransactionSummary {
  overview: {
    total_transactions: number;
    total_value: string;
    pending_amount: string;
    completed_transactions: number;
    average_transaction_value: string;
    highest_transaction: string;
    lowest_transaction: string;
  };
  status_distribution: {
    [key: string]: number;
  };
  recent_transactions: Array<{
    id: string;
    transaction_type: string;
    total_amount: string;
    balance_due: string;
    transaction_date: string;
    transaction_status: string;
    seller_name: string;
    buyer_name: string;
    payment_progress: number;
  }>;
  monthly_trends: Array<{
    month: string;
    transaction_count: number;
    total_amount: string;
  }>;
  currency: string;
  last_updated: string;
}

// Use environment variables from config
const API_URL = apiConfig.API_URL;
const CSRF_URL = apiConfig.CSRF_URL;

// Fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    console.log('[TRANSACTION] CSRF token fetched successfully');
  } catch (error) {
    console.warn('[TRANSACTION] CSRF fetch failed:', error);
    throw error;
  }
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

// Normalize payload data
const normalizePayload = (data: TransactionFormData): TransactionFormData => {
  const normalized = { ...data };

  Object.keys(normalized).forEach((key) => {
    const typedKey = key as keyof TransactionFormData;
    if (normalized[typedKey] === '') {
      (normalized[typedKey] as any) = null;
    }
  });

  if (normalized.price !== undefined) normalized.price = Number(normalized.price);
  if (normalized.tax_amount !== undefined) normalized.tax_amount = Number(normalized.tax_amount);
  if (normalized.deposit_amount !== undefined && normalized.deposit_amount !== null) {
    normalized.deposit_amount = Number(normalized.deposit_amount);
  }
  if (normalized.seller_id !== undefined) normalized.seller_id = Number(normalized.seller_id);
  if (normalized.buyer_id !== undefined) normalized.buyer_id = Number(normalized.buyer_id);

  return normalized;
};

// Fetch all transactions for an animal
export const fetchTransactions = async (animalId: string): Promise<Transaction[]> => {
  await fetchCsrfToken();
  try {
    if (!animalId) throw new Error('Invalid animal ID');

    const url = `${API_URL}/${animalId}/transactions`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[TRANSACTION] Fetch Transactions Status:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('[TRANSACTION] Raw Fetch Transactions Response Text:', rawText);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      console.error('[TRANSACTION] JSON parse error:', jsonError);
      throw new Error('Failed to parse server response');
    }

    console.log('[TRANSACTION] Raw Fetch Transactions Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const transactions = Array.isArray(rawData.data) ? rawData.data :
                        rawData.data && Array.isArray(rawData.data.data) ? rawData.data.data :
                        Array.isArray(rawData) ? rawData : [];

    console.log('[TRANSACTION] Processed Transactions:', transactions);
    return transactions;
  } catch (error) {
    console.error(`[TRANSACTION] Error fetching transactions for animal ${animalId}:`, error);
    toast.error(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Create a new transaction
export const createTransaction = async (animalId: string, transactionData: TransactionFormData): Promise<Transaction> => {
  await fetchCsrfToken();
  try {
    if (!animalId) throw new Error('Invalid animal ID');

    const normalizedData = normalizePayload(transactionData);
    console.log('[TRANSACTION] Normalized transaction data:', normalizedData);

    const url = `${API_URL}/${animalId}/transactions`;
    const headers = getAuthHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(normalizedData),
    });

    console.log('[TRANSACTION] Create Transaction Status:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('[TRANSACTION] Raw Create Transaction Response Text:', rawText);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      console.error('[TRANSACTION] JSON parse error:', jsonError);
      throw new Error('Failed to parse server response');
    }

    console.log('[TRANSACTION] Raw Create Transaction Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || rawData.errors || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const newTransaction = rawData.data || rawData;
    console.log('[TRANSACTION] Created Transaction:', newTransaction);
    return newTransaction;
  } catch (error) {
    console.error('[TRANSACTION] Error creating transaction:', error);
    throw error;
  }
};

// Fetch transaction summary for an animal
export const fetchTransactionSummary = async (animalId: string): Promise<TransactionSummary> => {
  await fetchCsrfToken();
  try {
    if (!animalId) throw new Error('Invalid animal ID');

    const url = `${API_URL}/${animalId}/transactions/summary`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[TRANSACTION] Fetch Transaction Summary Status:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('[TRANSACTION] Raw Fetch Transaction Summary Response Text:', rawText);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      console.error('[TRANSACTION] JSON parse error:', jsonError);
      throw new Error('Failed to parse server response');
    }

    console.log('[TRANSACTION] Raw Fetch Transaction Summary Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const summary = rawData.data || rawData;
    console.log('[TRANSACTION] Processed Transaction Summary:', summary);
    return summary;
  } catch (error) {
    console.error(`[TRANSACTION] Error fetching transaction summary for animal ${animalId}:`, error);
    toast.error(`Failed to fetch transaction summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch a single transaction
export const fetchTransaction = async (animalId: string, transactionId: string): Promise<Transaction> => {
  await fetchCsrfToken();
  try {
    if (!animalId) throw new Error('Invalid animal ID');
    if (!transactionId || transactionId === 'undefined') throw new Error('Invalid transaction ID');

    const url = `${API_URL}/${animalId}/transactions/${transactionId}`;
    console.log(`[TRANSACTION] Fetching transaction with URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[TRANSACTION] Fetch Transaction Status:', response.status, response.statusText);

    if (response.status === 404) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    const rawText = await response.text();
    console.log('[TRANSACTION] Raw Fetch Transaction Response Text:', rawText);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      console.error('[TRANSACTION] JSON parse error:', jsonError);
      throw new Error('Failed to parse server response');
    }

    console.log('[TRANSACTION] Raw Fetch Transaction Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const transaction = rawData.data || rawData;
    if (!transaction || !transaction.id) {
      throw new Error('Invalid transaction data received from server');
    }

    console.log('[TRANSACTION] Processed Transaction:', transaction);
    return transaction;
  } catch (error) {
    console.error(`[TRANSACTION] Error fetching transaction ${transactionId} for animal ${animalId}:`, error);
    throw error;
  }
};

// Update a transaction
export const updateTransaction = async (
  animalId: string,
  transactionId: string,
  transactionData: Partial<TransactionFormData>
): Promise<Transaction> => {
  await fetchCsrfToken();
  try {
    if (!animalId) throw new Error('Invalid animal ID');
    if (!transactionId || transactionId === 'undefined') throw new Error('Invalid transaction ID');

    const normalizedData = normalizePayload(transactionData as TransactionFormData);
    console.log('[TRANSACTION] Normalized transaction data for update:', normalizedData);

    const url = `${API_URL}/${animalId}/transactions/${transactionId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(normalizedData),
    });

    console.log('[TRANSACTION] Update Transaction Status:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('[TRANSACTION] Raw Update Transaction Response Text:', rawText);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      console.error('[TRANSACTION] JSON parse error:', jsonError);
      throw new Error('Failed to parse server response');
    }

    console.log('[TRANSACTION] Raw Update Transaction Response:', rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || rawData.errors || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const updatedTransaction = rawData.data || rawData;
    console.log('[TRANSACTION] Updated Transaction:', updatedTransaction);
    return updatedTransaction;
  } catch (error) {
    console.error(`[TRANSACTION] Error updating transaction ${transactionId} for animal ${animalId}:`, error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (animalId: string, transactionId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    if (!animalId) throw new Error('Invalid animal ID');
    if (!transactionId || transactionId === 'undefined') throw new Error('Invalid transaction ID');

    const url = `${API_URL}/${animalId}/transactions/${transactionId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('[TRANSACTION] Delete Transaction Status:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('[TRANSACTION] Raw Delete Transaction Response Text:', rawText);

    let rawData = {};
    if (rawText) {
      try {
        rawData = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('[TRANSACTION] JSON parse error:', jsonError);
        throw new Error('Failed to parse server response');
      }
    }

    console.log('[TRANSACTION] Raw Delete Transaction Response:', rawData);

    if (!response.ok) {
      const errorMessage = (rawData as any).message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`[TRANSACTION] Error deleting transaction ${transactionId} for animal ${animalId}:`, error);
    toast.error(`Failed to delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};