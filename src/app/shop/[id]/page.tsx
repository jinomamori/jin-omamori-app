'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { productsApi, Product } from '@/lib/api';
import { formatPrice, addToCart } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    productsApi.findOne(id)
      .then((res) => setProduct((res as any).product ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-crimson mb-4 hover:underline">
          ← 戻る
        </button>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {product && (
          <div className="space-y-6">
            {/* Image */}
            <div className="w-full aspect-square bg-gradient-to-br from-crimson/10 to-gold/10 rounded-2xl overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">🎁</span>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-xs text-gray-400 mb-1">{product.category}</p>
              <h1 className="text-2xl font-serif font-bold text-ink mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-crimson mb-4">{formatPrice(product.price)}</p>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock */}
            {product.stock !== undefined && (
              <div className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `在庫 ${product.stock} 点` : '在庫切れ'}
              </div>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">数量</span>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-lg"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-lg"
                  >
                    ＋
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {product.stock > 0 ? (
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 btn-primary rounded-xl py-4 text-base transition-all ${added ? 'bg-green-600' : ''}`}
                >
                  {added ? '✓ カートに追加しました' : 'カートに追加'}
                </button>
                {added && (
                  <button
                    onClick={() => router.push('/cart')}
                    className="btn-secondary rounded-xl px-4"
                  >
                    カートへ
                  </button>
                )}
              </div>
            ) : (
              <button disabled className="btn-primary w-full rounded-xl py-4 opacity-50 cursor-not-allowed">
                在庫切れ
              </button>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
