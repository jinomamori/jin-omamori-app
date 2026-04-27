'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { getCart, saveCart, removeFromCart, getCartTotal, CartItem, formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  function updateQuantity(productId: string, delta: number) {
    const updated = items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item,
    );
    setItems(updated);
    saveCart(updated);
  }

  function handleRemove(productId: string) {
    removeFromCart(productId);
    setItems(getCart());
  }

  const total = getCartTotal(items);

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif font-bold text-crimson mb-6">カート</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-500 mb-4">カートは空です</p>
            <Link href="/shop" className="btn-primary rounded-xl px-8 py-3">
              ショップへ
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="card p-4 flex gap-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-crimson/10 to-gold/10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🎁</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm line-clamp-2 mb-1">{item.name}</p>
                    <p className="text-crimson font-bold">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-gray-300 hover:text-red-400 transition-colors self-start"
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-sm">小計</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-sm">配送料</span>
                <span className="text-sm text-gray-500">次のステップで確認</span>
              </div>
              <div className="wa-divider" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink">合計（税込）</span>
                <span className="text-2xl font-bold text-crimson">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="btn-primary w-full rounded-xl py-4 text-base"
            >
              購入手続きへ
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
