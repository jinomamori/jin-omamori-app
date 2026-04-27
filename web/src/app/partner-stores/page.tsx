'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { partnerStoresApi, PartnerStore } from '@/lib/api';

const GENRES = ['すべて', '居酒屋', '和食', '洋食', '焼肉', 'カフェ', 'その他'];

export default function PartnerStoresPage() {
  const [stores, setStores] = useState<PartnerStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('すべて');
  const [error, setError] = useState('');

  useEffect(() => {
    partnerStoresApi.findAll()
      .then((res) => setStores(res.stores))
      .catch(() => setError('提携店情報を取得できませんでした'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedGenre === 'すべて'
    ? stores
    : stores.filter((s) => s.genre === selectedGenre);

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif font-bold text-crimson mb-6">提携店一覧</h1>

        {/* Genre Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedGenre === genre
                  ? 'bg-crimson text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-crimson hover:text-crimson'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((store) => (
            <Link key={store.id} href={`/partner-stores/${store.id}`}>
              <div className="card-wa overflow-hidden hover:border-gold/60 transition-colors active:scale-[0.99]">
                <div className="flex">
                  {/* Image */}
                  <div className="w-28 h-28 bg-gradient-to-br from-crimson/10 to-gold/10 flex items-center justify-center shrink-0">
                    {store.imageUrl ? (
                      <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🏮</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-bold text-ink truncate flex-1">{store.name}</h3>
                      <span className="text-xs bg-crimson/10 text-crimson px-2 py-0.5 rounded-full shrink-0">{store.genre}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{store.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gold-600">
                      <span>✨</span>
                      <span className="text-gold font-medium">{store.benefit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏮</p>
            <p>このジャンルの提携店はまだありません</p>
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
