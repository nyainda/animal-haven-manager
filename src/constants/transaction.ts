// Transaction form constants
export const transactionTypes = ['sale', 'purchase', 'lease', 'transfer', 'other'];

export const transactionStatusOptions = ['pending', 'completed', 'cancelled', 'in_progress'];

export const paymentMethods = ['credit_card', 'bank_transfer', 'cash', 'check', 'paypal', 'other'];

export const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];

// Type definitions for better type safety
export type TransactionType = typeof transactionTypes[number];
export type TransactionStatus = typeof transactionStatusOptions[number];
export type PaymentMethod = typeof paymentMethods[number];
export type Currency = typeof currencies[number];

// Display labels for better UX
export const transactionTypeLabels: Record<TransactionType, string> = {
  sale: 'Sale',
  purchase: 'Purchase',
  lease: 'Lease',
  transfer: 'Transfer',
  other: 'Other'
};

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
  in_progress: 'In Progress'
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  credit_card: 'Credit Card',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  check: 'Check',
  paypal: 'PayPal',
  other: 'Other'
};

export const currencyLabels: Record<Currency, string> = {
  USD: 'US Dollar (USD)',
  EUR: 'Euro (EUR)',
  GBP: 'British Pound (GBP)',
  CAD: 'Canadian Dollar (CAD)',
  AUD: 'Australian Dollar (AUD)',
  JPY: 'Japanese Yen (JPY)',
  CNY: 'Chinese Yuan (CNY)'
};

// Currency symbols for display
export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥'
};