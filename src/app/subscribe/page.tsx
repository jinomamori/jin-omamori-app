'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { subscriptionsApi } from '@/lib/api';
import { PLAN_INFO, formatPrice } from '@/lib/utils';

const plans = [
  {
    key: 'standard' as const,
    popular: false,
    color: 'border-crimson/30',
    headerColor: 'bg-crimson/5',
    btnClass: 'btn-primary',
  },
  {
    key: 'gold' as const,
    popular: true,
    color: 'border-gold',
    headerColor: 'bg-gold/10',
    btnClass: 'btn-gold',
  },
  {
    key: 'vip' as const,
    popular: false,
    color: 'border-purple-300',
    headerColor: 'bg-purple-50',
    btnClass: 'bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors w-full block text-center',
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleSubscribe(plan: 'standard' | 'gold' | 'vip') {
    setLoading(plan);
    setError('');
    try {
      const { checkoutUrl } = await subscriptionsApi.createCheckout(plan);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || '決済ページへの移動に失敗しました');
      setLoading(null);
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-crimson mb-3">会員プラン</h1>
          <p className="text-gray-600">あなたのライフスタイルに合わせてお選びください</p>
          <p className="text-sm text-gray-400 mt-2">全プラン Stripe による安全な決済対応</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ key, popular, color, headerColor, btnClass }) => {
            const info = PLAN_INFO[key];
            return (
              <div
                key={key}
                className={`card-wa border-2 ${color} relative overflow-hidden ${popular ? 'shadow-xl' : ''}`}
              >
                {popular && (
                  <div className="bg-gold text-white text-xs font-bold text-center py-1.5">
                    ★ 人気No.1
                  </div>
                )}

                <div className={`${headerColor} p-6`}>
                  <h2 className="text-xl font-serif font-bold text-ink mb-1">{info.name}</h2>
                  <div className="text-3xl font-bold text-crimson">
                    {formatPrice(info.price)}
                    <span className="text-sm text-gray-400 font-normal">/月</span>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-8">
                    {info.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm">
                        <span className="text-gold mt-0.5 shrink-0">✓</span>
                        <span className="text-gray-700">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={loading !== null}
                    className={`${btnClass} w-full text-center rounded-xl py-3 font-medium`}
                  >
                    {loading === key ? '処理中...' : 'このプランに加入する'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-xl font-serif font-bold text-crimson mb-6 text-center">よくある質問</h2>
          <div className="space-y-4">
            {[
              {
                q: '支払い方法は？',
                a: 'クレジットカード（VISA、Mastercard、JCB、American Express）に対応しています。Stripeの安全な決済システムを利用しています。',
              },
              {
                q: 'いつでも解約できますか？',
                a: 'はい、いつでも解約できます。解約後は現在の期間終了まで特典をご利用いただけます。',
              },
              {
                q: '特典は毎月リセットされますか？',
                a: 'はい、毎月1日に特典がリセットされます。',
              },
              {
                q: 'プランの変更はできますか？',
                a: 'はい、マイページからプランのアップグレード・ダウングレードができます。',
              },
            ].map((faq, i) => (
              <div key={i} className="card p-4">
                <p className="font-medium text-crimson mb-2">Q. {faq.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
