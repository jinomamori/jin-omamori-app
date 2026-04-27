'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { productsApi, Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('すべて');

  useEffect(() => {
    productsApi.findAll()
      .then((res) => setProducts((res as any).products ?? res))
      .catch(() => setError('商品情報を取得できませんでした'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['すべて', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === 'すべて' ? products : products.filter((p) => p.category === category);

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif font-bold text-crimson mb-6">グッズショップ</h1>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-crimson text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-crimson hover:text-crimson'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {filtered.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`}>
              <div className="card-wa overflow-hidden hover:border-gold/60 transition-colors active:scale-[0.99]">
                <div className="w-full aspect-square bg-gradient-to-br from-crimson/10 to-gold/10 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">🎁</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                  <h3 className="text-sm font-bold text-ink line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-crimson font-bold">{formatPrice(product.price)}</span>
                    {product.stock === 0 && (
                      <span className="text-xs text-gray-400">在庫切れ</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎁</p>
            <p>商品がありません</p>
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
