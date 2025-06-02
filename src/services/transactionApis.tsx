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
  animal_id?: string;
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

// Create a logger function that safely handles input parameters
const safeLog = (action: string, message: string, animalIdParam?: string, transactionIdParam?: string, data?: any) => {
  // Create a safe copy of IDs using only alphanumeric characters
  const safeAnimalId = animalIdParam ? 
    animalIdParam.toString().replace(/[^a-zA-Z0-9-]/g, '') : 'undefined';
  const safeTransactionId = transactionIdParam ? 
    transactionIdParam.toString().replace(/[^a-zA-Z0-9-]/g, '') : 'undefined';
  
  const logPrefix = '[TRANSACTION]';
  
  // Create a safe message
  const safeMessage = `${logPrefix} ${action}: ${message}` + 
    (animalIdParam ? ` (Animal ID: ${safeAnimalId}` : '') +
    (transactionIdParam ? `, Transaction ID: ${safeTransactionId})` : 
      animalIdParam ? ')' : '');
  
  // Log with appropriate method based on message type
  if (action.startsWith('Error')) {
    console.error(safeMessage, data);
  } else {
    console.log(safeMessage, data);
  }
};

// Fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    safeLog('Info', 'CSRF token fetched successfully');
  } catch (error) {
    safeLog('Warning', 'CSRF fetch failed', undefined, undefined, error);
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

// Validate IDs
const validateIds = (animalId?: string, transactionId?: string): void => {
  if (!animalId) throw new Error('Invalid animal ID');
  if (transactionId === 'undefined') throw new Error('Invalid transaction ID');
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
    validateIds(animalId);

    const url = `${API_URL}/${encodeURIComponent(animalId)}/transactions`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    safeLog('Info', `Fetch Transactions Status: ${response.status} ${response.statusText}`, animalId);

    const rawText = await response.text();
    safeLog('Info', 'Raw Fetch Transactions Response Text received', animalId);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      safeLog('Error', 'JSON parse error', animalId, undefined, jsonError);
      throw new Error('Failed to parse server response');
    }

    safeLog('Info', 'Raw Fetch Transactions Response received', animalId, undefined, rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const transactions = Array.isArray(rawData.data) ? rawData.data :
                        rawData.data && Array.isArray(rawData.data.data) ? rawData.data.data :
                        Array.isArray(rawData) ? rawData : [];

    safeLog('Info', 'Processed Transactions', animalId, undefined, transactions);
    return transactions;
  } catch (error) {
    safeLog('Error', 'Error fetching transactions', animalId, undefined, error);
    toast.error(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Create a new transaction
export const createTransaction = async (animalId: string, transactionData: TransactionFormData): Promise<Transaction> => {
  await fetchCsrfToken();
  try {
    validateIds(animalId);

    const normalizedData = normalizePayload(transactionData);
    safeLog('Info', 'Normalized transaction data', animalId, undefined, normalizedData);

    const url = `${API_URL}/${encodeURIComponent(animalId)}/transactions`;
    const headers = getAuthHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(normalizedData),
    });

    safeLog('Info', `Create Transaction Status: ${response.status} ${response.statusText}`, animalId);

    const rawText = await response.text();
    safeLog('Info', 'Raw Create Transaction Response Text received', animalId);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      safeLog('Error', 'JSON parse error', animalId, undefined, jsonError);
      throw new Error('Failed to parse server response');
    }

    safeLog('Info', 'Raw Create Transaction Response received', animalId, undefined, rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || rawData.errors || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const newTransaction = rawData.data || rawData;
    safeLog('Info', 'Created Transaction', animalId, undefined, newTransaction);
    return newTransaction;
  } catch (error) {
    safeLog('Error', 'Error creating transaction', animalId, undefined, error);
    throw error;
  }
};

// Fetch transaction summary for an animal
export const fetchTransactionSummary = async (animalId: string): Promise<TransactionSummary> => {
  await fetchCsrfToken();
  try {
    validateIds(animalId);

    const url = `${API_URL}/${encodeURIComponent(animalId)}/transactions/summary`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    safeLog('Info', `Fetch Transaction Summary Status: ${response.status} ${response.statusText}`, animalId);

    const rawText = await response.text();
    safeLog('Info', 'Raw Fetch Transaction Summary Response Text received', animalId);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      safeLog('Error', 'JSON parse error', animalId, undefined, jsonError);
      throw new Error('Failed to parse server response');
    }

    safeLog('Info', 'Raw Fetch Transaction Summary Response received', animalId, undefined, rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const summary = rawData.data || rawData;
    safeLog('Info', 'Processed Transaction Summary', animalId, undefined, summary);
    return summary;
  } catch (error) {
    safeLog('Error', 'Error fetching transaction summary', animalId, undefined, error);
    toast.error(`Failed to fetch transaction summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// Fetch a single transaction
export const fetchTransaction = async (animalId: string, transactionId: string): Promise<Transaction> => {
  await fetchCsrfToken();
  try {
    validateIds(animalId, transactionId);

    const url = `${API_URL}/${encodeURIComponent(animalId)}/transactions/${encodeURIComponent(transactionId)}`;
    safeLog('Info', `Fetching transaction with URL: ${url}`, animalId, transactionId);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    safeLog('Info', `Fetch Transaction Status: ${response.status} ${response.statusText}`, animalId, transactionId);

    if (response.status === 404) {
      throw new Error(`Transaction not found`);
    }

    const rawText = await response.text();
    safeLog('Info', 'Raw Fetch Transaction Response Text received', animalId, transactionId);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      safeLog('Error', 'JSON parse error', animalId, transactionId, jsonError);
      throw new Error('Failed to parse server response');
    }

    safeLog('Info', 'Raw Fetch Transaction Response received', animalId, transactionId, rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const transaction = rawData.data || rawData;
    if (!transaction || !transaction.id) {
      throw new Error('Invalid transaction data received from server');
    }

    safeLog('Info', 'Processed Transaction', animalId, transactionId, transaction);
    return transaction;
  } catch (error) {
    safeLog('Error', 'Error fetching transaction', animalId, transactionId, error);
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
    validateIds(animalId, transactionId);

    const normalizedData = normalizePayload(transactionData as TransactionFormData);
    safeLog('Info', 'Normalized transaction data for update', animalId, transactionId, normalizedData);

    const url = `${API_URL}/${encodeURIComponent(animalId)}/transactions/${encodeURIComponent(transactionId)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(normalizedData),
    });

    safeLog('Info', `Update Transaction Status: ${response.status} ${response.statusText}`, animalId, transactionId);

    const rawText = await response.text();
    safeLog('Info', 'Raw Update Transaction Response Text received', animalId, transactionId);

    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (jsonError) {
      safeLog('Error', 'JSON parse error', animalId, transactionId, jsonError);
      throw new Error('Failed to parse server response');
    }

    safeLog('Info', 'Raw Update Transaction Response received', animalId, transactionId, rawData);

    if (!response.ok) {
      const errorMessage = rawData.message || rawData.errors || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const updatedTransaction = rawData.data || rawData;
    safeLog('Info', 'Updated Transaction', animalId, transactionId, updatedTransaction);
    return updatedTransaction;
  } catch (error) {
    safeLog('Error', 'Error updating transaction', animalId, transactionId, error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (animalId: string, transactionId: string): Promise<void> => {
  await fetchCsrfToken();
  try {
    validateIds(animalId, transactionId);

    const url = `${API_URL}/${encodeURIComponent(animalId)}/transactions/${encodeURIComponent(transactionId)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    safeLog('Info', `Delete Transaction Status: ${response.status} ${response.statusText}`, animalId, transactionId);

    const rawText = await response.text();
    safeLog('Info', 'Raw Delete Transaction Response Text received', animalId, transactionId);

    let rawData = {};
    if (rawText) {
      try {
        rawData = JSON.parse(rawText);
      } catch (jsonError) {
        safeLog('Error', 'JSON parse error', animalId, transactionId, jsonError);
        throw new Error('Failed to parse server response');
      }
    }

    safeLog('Info', 'Raw Delete Transaction Response received', animalId, transactionId, rawData);

    if (!response.ok) {
      const errorMessage = (rawData as any).message || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    safeLog('Error', 'Error deleting transaction', animalId, transactionId, error);
    toast.error(`Failed to delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};