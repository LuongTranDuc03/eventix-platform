export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export interface HoldTicketDto {
  eventId: number;
  zoneId: number;
  quantity: number;
  passToken: string;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  eventId: number;
  zoneId: number;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  expiresAt: string;
}

