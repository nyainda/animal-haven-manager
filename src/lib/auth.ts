
// Mock API functions for authentication

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

// Simulate API request with delay
const apiRequest = <T>(data: T, delay = 1000, shouldFail = false): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API request failed'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// Login API
export const loginApi = async (credentials: LoginCredentials) => {
  return apiRequest(
    {
      user: {
        name: 'John Doe',
        email: credentials.email,
        token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9),
      },
    },
    1000,
    false // Set to true to simulate login failure
  );
};

// Register API
export const registerApi = async (data: RegisterData) => {
  return apiRequest(
    {
      success: true,
      message: 'Registration successful. Please verify your email.',
    },
    1500,
    false // Set to true to simulate registration failure
  );
};

// Forgot password API
export const forgotPasswordApi = async (email: string) => {
  return apiRequest(
    {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    },
    1200,
    false // Set to true to simulate forgot password failure
  );
};

// Reset password API
export const resetPasswordApi = async (data: ResetPasswordData) => {
  return apiRequest(
    {
      success: true,
      message: 'Password reset successfully.',
    },
    1200,
    false // Set to true to simulate reset password failure
  );
};

// Verify email API
export const verifyEmailApi = async (token: string) => {
  return apiRequest(
    {
      success: true,
      message: 'Email verified successfully.',
    },
    1200,
    false // Set to true to simulate verify email failure
  );
};

// Mock animals data for dashboard
export const fetchAnimalsApi = async (page = 1, limit = 10) => {
  const animals = [
    { id: 1, name: 'Luna', species: 'Cat', age: 2, status: 'Healthy', health: 'Good' },
    { id: 2, name: 'Max', species: 'Dog', age: 4, status: 'Active', health: 'Excellent' },
    { id: 3, name: 'Charlie', species: 'Bird', age: 1, status: 'Needs Attention', health: 'Fair' },
    { id: 4, name: 'Bella', species: 'Dog', age: 3, status: 'Healthy', health: 'Good' },
    { id: 5, name: 'Oliver', species: 'Cat', age: 5, status: 'Needs Checkup', health: 'Fair' },
    { id: 6, name: 'Lucy', species: 'Rabbit', age: 2, status: 'Active', health: 'Good' },
    { id: 7, name: 'Cooper', species: 'Dog', age: 7, status: 'Senior', health: 'Fair' },
    { id: 8, name: 'Daisy', species: 'Hamster', age: 1, status: 'Healthy', health: 'Excellent' },
    { id: 9, name: 'Milo', species: 'Cat', age: 3, status: 'Healthy', health: 'Good' },
    { id: 10, name: 'Zoe', species: 'Bird', age: 2, status: 'Needs Attention', health: 'Fair' },
  ];
  
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return apiRequest(
    {
      data: animals.slice(start, end),
      total: animals.length,
      page,
      totalPages: Math.ceil(animals.length / limit),
    },
    800,
    false // Set to true to simulate fetch failure
  );
};

// Health reports API
export const fetchHealthReportsApi = async () => {
  return apiRequest(
    {
      healthStatuses: [
        { status: 'Excellent', count: 25 },
        { status: 'Good', count: 45 },
        { status: 'Fair', count: 20 },
        { status: 'Poor', count: 10 },
      ],
      speciesBreakdown: [
        { species: 'Dog', count: 35 },
        { species: 'Cat', count: 30 },
        { species: 'Bird', count: 15 },
        { species: 'Rabbit', count: 10 },
        { species: 'Other', count: 10 },
      ],
      ageGroups: [
        { group: '0-1 year', count: 20 },
        { group: '1-3 years', count: 30 },
        { group: '3-7 years', count: 35 },
        { group: '7+ years', count: 15 },
      ],
    },
    1000,
    false // Set to true to simulate fetch failure
  );
};
