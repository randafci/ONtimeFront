export interface ApiResponse<T> {
  statusCode: number;
  code: {
    code: string;
    value: string;
  };
  message?: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
} 

export interface APIOperationResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data: T;
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
}

// Interface for the request body for pagination
export interface PagedListRequest {
  page: number;
  pageSize: number;
  filter: {
    sortField: string;
    sortDirection: number;
    logic?: string;
    filters?: any[];
  };

}

