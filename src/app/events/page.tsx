'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { eventsApi, DiningEvent } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PlanBadge from '@/components/PlanBadge';

export default function EventsPage() {
  const [events, setEvents] = useState<DiningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsApi.findAll()
      .then((res) => setEvents(res.events))
      .catch(() => setError('イベント情報を取得できませんでした'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif font-bold text-crimson mb-6">食事会イベント</h1>

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
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="card-wa overflow-hidden hover:border-gold/60 transition-colors active:scale-[0.99]">
                <div className="h-40 bg-gradient-to-br from-crimson/20 to-gold/20 flex items-center justify-center">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">🍽️</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-ink">{event.title}</h3>
                    <PlanBadge plan={event.requiredPlan} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{event.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>📅 {formatDateTime(event.eventDate)}</span>
                    <span>📍 {event.venue}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && events.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="mb-2">現在参加可能なイベントはありません</p>
            <p className="text-sm">ゴールド・VIPプランに加入するとイベントに参加できます</p>
            <Link href="/subscribe" className="mt-4 inline-block text-crimson underline text-sm">
              プランを確認する
            </Link>
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
