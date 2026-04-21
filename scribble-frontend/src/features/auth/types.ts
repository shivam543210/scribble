export interface User {
  id: string;
  username: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: AuthData;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username?: string;
  password?: string;
  email?: string; // Adding email just in case, though the user specified username
}
