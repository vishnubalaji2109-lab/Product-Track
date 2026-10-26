export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'admin' | 'manager' | 'operator';
  avatarUrl?: string;
  createdAt: string;
}

export interface StoredUser extends User {
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
