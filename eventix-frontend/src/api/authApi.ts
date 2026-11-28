import axiosClient from './axiosClient';
import type { ApiResponse, AuthResponse, LoginDto, RegisterDto, UserItem } from '../types/auth';

export const authApi = {
  login: async (data: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    return (await axiosClient.post('/auth/login', data)) as unknown as ApiResponse<AuthResponse>;
  },

  register: async (data: RegisterDto): Promise<ApiResponse<AuthResponse>> => {
    return (await axiosClient.post('/auth/register', data)) as unknown as ApiResponse<AuthResponse>;
  },

  getMe: async (): Promise<ApiResponse<string>> => {
    return (await axiosClient.get('/auth/me')) as unknown as ApiResponse<string>;
  },

  testAdminOnly: async (): Promise<ApiResponse<string>> => {
    return (await axiosClient.get('/auth/admin-only')) as unknown as ApiResponse<string>;
  },

  // Lấy toàn bộ danh sách người dùng cho Admin trực tiếp từ Database
  getAllUsers: async (): Promise<ApiResponse<UserItem[]>> => {
    return (await axiosClient.get('/auth/users')) as unknown as ApiResponse<UserItem[]>;
  },
};
