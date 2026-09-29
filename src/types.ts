export interface CardItem {
  id: string;
  name: string;
  initials: string;
  category?: string;
  isActive?: boolean; // When false, hidden from dispatch tab so it can be reused later
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    pillBg: string;
  };
  createdAt: number;
}

export type OrderStage = 'queue' | 'oven' | 'delivered';

export interface OrderItemLine {
  cardId: string;
  cardName: string;
  initials: string;
  quantity: number;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    pillBg: string;
  };
}

export interface OrderItem {
  id: string;
  buzzerNumber: string;
  items: OrderItemLine[];
  cardId?: string;
  cardName?: string;
  initials?: string;
  colorScheme?: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    pillBg: string;
  };
  notes?: string;
  stage: OrderStage;
  createdAt: number;
  queuedAt: number;
  ovenAt?: number;
  deliveredAt?: number;
}

export interface OrderStats {
  inQueue: number;
  inOven: number;
  delivered: number;
}
