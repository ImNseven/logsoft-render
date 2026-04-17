export type UserRole = 'shipper' | 'carrier' | 'dispatcher';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  full_name: string | null;
  company_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OriginPoint {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface TransportType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RegisterData {
  phone: string;
  password: string;
  role: UserRole;
  full_name?: string;
  company_name?: string;
}

export interface UpdateProfileDto {
  full_name?: string;
  company_name?: string;
}

export interface UpdateUserDto {
  is_active?: boolean;
  role?: UserRole;
  is_admin?: boolean;
}

export interface QueryUsersParams {
  role?: UserRole;
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
