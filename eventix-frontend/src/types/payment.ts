export type PaymentMethod = 'VIETQR' | 'CREDIT_CARD' | 'MOMO' | 'ZALOPAY';

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  iconName: string;
  badge?: string;
}

