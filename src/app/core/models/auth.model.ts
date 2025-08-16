export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
} 