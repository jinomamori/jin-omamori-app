'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { partnerStoresApi, membershipApi, PartnerStore } from '@/lib/api';

export default function PartnerStoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [store, setStore] = useState<PartnerStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState(false);
  const [used, setUsed] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    partnerStoresApi.findOne(id)
      .then((res) => setStore(res.store))
      .catch(() => setError('提携店情報を取得できませんでした'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUseBenefit() {
    if (!store) return;
    setUsing(true);
    setError('');
    try {
      await membershipApi.usePartnerBenefit(store.id);
      setUsed(true);
      setSuccessMsg('特典を利用しました！スタッフに画面を見せてください。');
    } catch (err: any) {
      setError(err.message || '特典利用に失敗しました');
    } finally {
      setUsing(false);
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-crimson mb-4 hover:underline"
        >
          ← 戻る
        </button>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {store && (
          <div className="space-y-6">
            {/* Store Image */}
            <div className="w-full h-48 bg-gradient-to-br from-crimson/10 to-gold/10 rounded-2xl overflow-hidden flex items-center justify-center">
              {store.imageUrl ? (
                <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🏮</span>
              )}
            </div>

            {/* Store Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-crimson/10 text-crimson px-2 py-0.5 rounded-full">{store.genre}</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-ink mb-2">{store.name}</h1>
              <p className="text-gray-600 leading-relaxed">{store.description}</p>
            </div>

            {/* Benefit Box */}
            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4">
              <h2 className="font-bold text-gold-700 mb-1">✨ 会員特典</h2>
              <p className="text-ink">{store.benefit}</p>
            </div>

            {/* Address & Phone */}
            <div className="card p-4 space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-crimson text-lg">📍</span>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">住所</p>
                  <p className="text-sm text-ink">{store.address}</p>
                </div>
              </div>
              {store.phoneNumber && (
                <div className="flex gap-3 items-start">
                  <span className="text-crimson text-lg">📞</span>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">電話番号</p>
                    <a href={`tel:${store.phoneNumber}`} className="text-sm text-crimson hover:underline">{store.phoneNumber}</a>
                  </div>
                </div>
              )}
            </div>

            {/* Map Link */}
            {store.mapUrl && (
              <a
                href={store.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-crimson text-crimson rounded-xl font-medium hover:bg-crimson hover:text-white transition-colors"
              >
                <span>🗺️</span> Google マップで見る
              </a>
            )}

            {/* Success */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-medium">{successMsg}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Use Benefit Button */}
            {!used && (
              <button
                onClick={handleUseBenefit}
                disabled={using}
                className="btn-primary w-full rounded-xl py-4 text-base"
              >
                {using ? '処理中...' : '特典を利用する'}
              </button>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
