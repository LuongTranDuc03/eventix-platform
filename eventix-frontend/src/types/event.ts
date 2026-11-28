export type EventStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export type ZoneType = 'STANDING' | 'SEATED';

export interface Zone {
  id: number;
  name: string;
  zoneType: ZoneType;
  price: number;
  totalCapacity: number;
  availableCapacity: number;
}

export interface EventItem {
  id: number;
  organizerId: number;
  title: string;
  description: string;
  venue: string;
  bannerUrl?: string;
  status: EventStatus;
  salesStartTime: string;
  salesEndTime: string;
  maxTicketsPerUser: number;
  zones: Zone[];
}

export interface CreateZoneDto {
  name: string;
  zoneType: ZoneType;
  price: number;
  totalCapacity: number;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  venue: string;
  bannerUrl?: string;
  salesStartTime: string;
  salesEndTime: string;
  maxTicketsPerUser: number;
  zones: CreateZoneDto[];
}


