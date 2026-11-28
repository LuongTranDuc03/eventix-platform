import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';

export const paymentApi = {
  // Giả lập thanh toán đơn hàng (Kích hoạt luồng RabbitMQ xuất vé bất đồng bộ)
  simulatePayment: async (orderId: number): Promise<ApiResponse<void>> => {
    const res = (await axiosClient.post(`/payments/simulate/${orderId}`)) as unknown as ApiResponse<void>;
    return res;
  },
};

