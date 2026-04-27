'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import PlanBadge from '@/components/PlanBadge';
import { eventsApi, DiningEvent } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<DiningEvent | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsApi.findOne(id)
      .then((res) => {
        setEvent(res.event);
        setParticipantCount(res.participantCount);
      })
      .catch(() => setError('イベント情報を取得できませんでした'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRsvp(status: 'attending' | 'not_attending') {
    setSubmitting(true);
    setError('');
    try {
      await eventsApi.rsvp(id, status);
      setRsvpStatus(status);
    } catch (err: any) {
      setError(err.message || 'RSVP登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
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

        {event && (
          <div className="space-y-6">
            {/* Image */}
            <div className="w-full h-56 bg-gradient-to-br from-crimson/20 to-gold/20 rounded-2xl overflow-hidden flex items-center justify-center">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">🍽️</span>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PlanBadge plan={event.requiredPlan} />
                <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {event.status === 'open' ? '受付中' : event.status === 'closed' ? '受付終了' : '終了'}
                </span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-ink mb-2">{event.title}</h1>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            {/* Details */}
            <div className="card p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <span className="text-crimson text-xl">📅</span>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">開催日時</p>
                  <p className="text-sm font-medium">{formatDateTime(event.eventDate)}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-crimson text-xl">📍</span>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">会場</p>
                  <p className="text-sm font-medium">{event.venue}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-crimson text-xl">👥</span>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">参加状況</p>
                  <p className="text-sm font-medium">{participantCount} / {event.maxParticipants} 名</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            {rsvpStatus === 'attending' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-medium text-green-700">参加を登録しました！</p>
              </div>
            )}

            {rsvpStatus === 'not_attending' && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="font-medium text-gray-600">不参加を登録しました</p>
              </div>
            )}

            {/* RSVP Buttons */}
            {!rsvpStatus && event.status === 'open' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRsvp('attending')}
                  disabled={submitting}
                  className="btn-primary rounded-xl py-3"
                >
                  {submitting ? '...' : '参加する'}
                </button>
                <button
                  onClick={() => handleRsvp('not_attending')}
                  disabled={submitting}
                  className="btn-secondary rounded-xl py-3"
                >
                  不参加
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
