'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import PlanBadge from '@/components/PlanBadge';
import { membershipApi } from '@/lib/api';
import { subscriptionsApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

interface BenefitStatus {
  dishService: { used: boolean; usedAt: string | null };
  diningEvent?: { used: boolean; usedAt: string | null };
  yakinikuEvent?: { used: boolean; usedAt: string | null };
}

export default function HomePage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [benefits, setBenefits] = useState<BenefitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, benefitsRes] = await Promise.all([
          subscriptionsApi.getStatus(),
          membershipApi.getBenefitsStatus(),
        ]);
        setPlan(statusRes.plan);
        setBenefits(benefitsRes);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();
  const monthStr = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Greeting */}
        <div className="wa-pattern-bg rounded-2xl p-6 text-white">
          <p className="text-gold/80 text-sm mb-1">おかえりなさい</p>
          <h1 className="text-2xl font-serif font-bold mb-2">
            {user?.displayName ?? 'ゲスト'} 様
          </h1>
          {plan && <PlanBadge plan={plan} />}
          {!plan && !loading && (
            <Link href="/subscribe" className="mt-2 inline-block text-gold text-sm underline">
              プランに登録して特典を受け取る →
            </Link>
          )}
        </div>

        {/* お知らせ */}
        <section>
          <h2 className="section-title pb-2 mb-4">お知らせ</h2>
          <div className="space-y-3">
            {[
              { date: '2024/12/01', title: '新提携店が追加されました', tag: '新着' },
              { date: '2024/11/25', title: '12月の食事会イベントを公開しました', tag: 'イベント' },
              { date: '2024/11/20', title: '年末限定グッズ販売開始', tag: 'ショップ' },
            ].map((notice, i) => (
              <div key={i} className="card p-4 flex items-start gap-3">
                <span className="bg-crimson/10 text-crimson text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap mt-0.5">
                  {notice.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{notice.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{notice.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 今月の特典状況 */}
        {plan && (
          <section>
            <h2 className="section-title pb-2 mb-4">{monthStr}の特典状況</h2>
            {loading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <BenefitCard
                  title="提携店 料理1品サービス"
                  used={benefits?.dishService?.used ?? false}
                  usedAt={benefits?.dishService?.usedAt ?? null}
                />
                {(plan === 'gold' || plan === 'vip') && (
                  <BenefitCard
                    title="居酒屋食事会"
                    used={benefits?.diningEvent?.used ?? false}
                    usedAt={benefits?.diningEvent?.usedAt ?? null}
                  />
                )}
                {plan === 'vip' && (
                  <BenefitCard
                    title="焼肉食事会"
                    used={benefits?.yakinikuEvent?.used ?? false}
                    usedAt={benefits?.yakinikuEvent?.usedAt ?? null}
                  />
                )}
              </div>
            )}
          </section>
        )}

        {/* クイックリンク */}
        <section>
          <h2 className="section-title pb-2 mb-4">メニュー</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/member-card', icon: '🪬', label: '会員証を見る' },
              { href: '/partner-stores', icon: '🏮', label: '提携店を探す' },
              { href: '/events', icon: '🍽️', label: '食事会に参加' },
              { href: '/shop', icon: '🎁', label: 'グッズを買う' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card-wa p-4 flex flex-col items-center gap-2 hover:border-gold/60 transition-colors active:scale-95"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-medium text-ink">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}

function BenefitCard({ title, used, usedAt }: { title: string; used: boolean; usedAt: string | null }) {
  return (
    <div className={`card p-4 flex items-center gap-3 border-l-4 ${used ? 'border-gray-300' : 'border-gold'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${used ? 'bg-gray-100' : 'bg-gold/10'}`}>
        {used ? '✓' : '○'}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${used ? 'text-gray-400 line-through' : 'text-ink'}`}>{title}</p>
        {used && usedAt && (
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(usedAt)} に利用済み</p>
        )}
        {!used && <p className="text-xs text-gold mt-0.5">今月まだ利用できます</p>}
      </div>
    </div>
  );
}
