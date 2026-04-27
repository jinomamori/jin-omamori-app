const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// Auth
export const authApi = {
  register: (data: { email: string; password: string; displayName: string }) =>
    apiFetch<{ access_token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false),
};

// Membership
export const membershipApi = {
  getMembership: () =>
    apiFetch<{
      memberNumber: string;
      plan: string;
      displayName: string;
      qrData: string;
      validUntil: string;
    }>('/api/membership'),

  getBenefitsStatus: () =>
    apiFetch<{
      dishService: { used: boolean; usedAt: string | null };
      diningEvent: { used: boolean; usedAt: string | null };
      yakinikuEvent: { used: boolean; usedAt: string | null };
    }>('/api/benefits/status'),

  useBenefit: (benefitType: string) =>
    apiFetch('/api/benefits/use', {
      method: 'POST',
      body: JSON.stringify({ benefitType }),
    }),

  usePartnerBenefit: (partnerStoreId: string) =>
    apiFetch('/api/benefits/use-partner', {
      method: 'POST',
      body: JSON.stringify({ partnerStoreId }),
    }),
};

// Partner Stores
export const partnerStoresApi = {
  findAll: () =>
    apiFetch<{ stores: PartnerStore[] }>('/api/partner-stores'),

  findOne: (id: string) =>
    apiFetch<{ store: PartnerStore }>(`/api/partner-stores/${id}`),
};

// Events
export const eventsApi = {
  findAll: () =>
    apiFetch<{ events: DiningEvent[] }>('/api/events'),

  findOne: (id: string) =>
    apiFetch<{ event: DiningEvent; participantCount: number }>(`/api/events/${id}`),

  rsvp: (id: string, status: 'attending' | 'not_attending') =>
    apiFetch(`/api/events/${id}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
};

// Products
export const productsApi = {
  findAll: () =>
    apiFetch<{ products: Product[] }>('/api/products'),

  findOne: (id: string) =>
    apiFetch<{ product: Product }>(`/api/products/${id}`),
};

// Orders
export const ordersApi = {
  create: (items: { productId: string; quantity: number }[]) =>
    apiFetch<{ orderId: string; checkoutUrl: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  pay: (orderId: string, data: { shippingAddress: ShippingAddress }) =>
    apiFetch<{ checkoutUrl: string }>(`/api/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  findAll: () =>
    apiFetch<{ orders: Order[] }>('/api/orders'),

  findOne: (id: string) =>
    apiFetch<{ order: Order }>(`/api/orders/${id}`),
};

// Subscriptions
export const subscriptionsApi = {
  getStatus: () =>
    apiFetch<{ status: string; plan: string | null; expiresAt: string | null }>(
      '/api/subscriptions/status',
    ),

  createCheckout: (plan: 'standard' | 'gold' | 'vip') =>
    apiFetch<{ checkoutUrl: string }>('/api/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),
};

// Types
export interface PartnerStore {
  id: string;
  name: string;
  genre: string;
  address: string;
  phoneNumber: string;
  description: string;
  imageUrl: string;
  benefit: string;
  mapUrl: string;
  isActive: boolean;
}

export interface DiningEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  venue: string;
  maxParticipants: number;
  requiredPlan: string;
  imageUrl: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  phone: string;
}

export { ApiError };
