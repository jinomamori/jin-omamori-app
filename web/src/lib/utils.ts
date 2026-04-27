export type PlanType = 'standard' | 'gold' | 'vip';

export const PLAN_INFO: Record<PlanType, {
  name: string;
  price: number;
  color: string;
  bgColor: string;
  textColor: string;
  features: string[];
}> = {
  standard: {
    name: 'スタンダード',
    price: 2980,
    color: '#8B0000',
    bgColor: 'bg-crimson-50',
    textColor: 'text-crimson',
    features: [
      '会員証発行',
      '提携店で料理1品サービス（月1回）',
    ],
  },
  gold: {
    name: 'ゴールド',
    price: 4980,
    color: '#DAA520',
    bgColor: 'bg-gold-50',
    textColor: 'text-gold-600',
    features: [
      '会員証発行',
      '提携店で料理1品サービス（月1回）',
      '居酒屋食事会（月1回）',
    ],
  },
  vip: {
    name: 'VIP',
    price: 9800,
    color: '#4B0082',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    features: [
      '会員証発行',
      '提携店で料理1品サービス（月1回）',
      '居酒屋食事会（月1回）',
      '焼肉食事会（月1回）',
    ],
  },
};

export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getPlanBadgeStyle(plan: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (plan) {
    case 'vip':
      return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' };
    case 'gold':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' };
    case 'standard':
    default:
      return { bg: 'bg-red-100', text: 'text-crimson', border: 'border-crimson/30' };
  }
}

export function getPlanDisplayName(plan: string): string {
  return PLAN_INFO[plan as PlanType]?.name ?? plan;
}

// Cart utilities
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem('cart', JSON.stringify(items));
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter((i) => i.productId !== productId);
  saveCart(cart);
}

export function clearCart(): void {
  localStorage.removeItem('cart');
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
