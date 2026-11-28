import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type { TicketItem } from '../types/ticket';

export const ticketApi = {
  // 1. Khách hàng xem danh sách vé trong ví
  getMyTickets: async (): Promise<ApiResponse<TicketItem[]>> => {
    const res = (await axiosClient.get('/tickets/my-tickets')) as unknown as ApiResponse<TicketItem[]>;
    return res;
  },

  // 2. Nhân viên quét vé tại cổng (Check-in)
  scanTicket: async (ticketCode: string): Promise<ApiResponse<string>> => {
    const cleanCode = ticketCode.includes('#') ? ticketCode.split('#')[0] : ticketCode;
    const res = (await axiosClient.post(`/tickets/scan?ticketCode=${encodeURIComponent(cleanCode.trim())}`)) as unknown as ApiResponse<string>;
    return res;
  },
};

