export type TicketStatus = 'ISSUED' | 'CHECKED_IN' | 'REVOKED';

export interface TicketItem {
  id: number;
  ticketCode: string;
  orderId: number;
  userId: number;
  zoneId: number;
  zoneName?: string;
  zoneType?: 'STANDING' | 'SEATED';
  eventId?: number;
  eventTitle?: string;
  eventVenue?: string;
  eventStartDate?: string;
  seatNumber?: string | null;
  status: TicketStatus;
  checkedInAt?: string | null;
  createdAt: string;
}

