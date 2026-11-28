export type UserRole = 'ROLE_USER' | 'ROLE_ATTENDEE' | 'ROLE_ORGANIZER' | 'ROLE_ADMIN' | 'ROLE_STAFF';

export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  roles: UserRole[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  roles: UserRole[];
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface UserItem {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}


