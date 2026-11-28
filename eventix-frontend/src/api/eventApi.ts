import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type { EventItem, EventStatus, CreateEventPayload } from '../types/event';

export const eventApi = {
  // 1. Lấy danh sách sự kiện trực tiếp từ Database PostgreSQL (qua Redis Cache)
  getAllEvents: async (status?: EventStatus): Promise<ApiResponse<EventItem[]>> => {
    const url = status ? `/events?status=${status}` : '/events';
    const res = (await axiosClient.get(url)) as unknown as ApiResponse<EventItem[]>;
    return res;
  },

  // 2. Lấy thông tin chi tiết sự kiện
  getEventDetail: async (id: number): Promise<ApiResponse<EventItem>> => {
    const res = (await axiosClient.get(`/events/${id}`)) as unknown as ApiResponse<EventItem>;
    return res;
  },

  // 3. Tạo sự kiện mới (Dành cho Ban tổ chức / Admin)
  createEvent: async (payload: CreateEventPayload): Promise<ApiResponse<EventItem>> => {
    const res = (await axiosClient.post('/events', payload)) as unknown as ApiResponse<EventItem>;
    return res;
  },

  // 4. Duyệt sự kiện & Pre-warm kho vé lên Redis (Dành riêng cho ADMIN)
  publishEvent: async (id: number): Promise<ApiResponse<EventItem>> => {
    const res = (await axiosClient.patch(`/events/${id}/publish`)) as unknown as ApiResponse<EventItem>;
    return res;
  },
};
