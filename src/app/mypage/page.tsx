'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import PlanBadge from '@/components/PlanBadge';
import { subscriptionsApi, ordersApi, Order } from '@/lib/api';
import { getCurrentUser, logout } from '@/lib/auth';
import { formatDate, formatPrice } from '@/lib/utils';

export default function MyPage() {
  const user = getCurrentUser();
  const [plan, setPlan] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'plan' | 'orders' | 'settings'>('profile');

  useEffect(() => {
    Promise.all([
      subscriptionsApi.getStatus(),
      ordersApi.findAll(),
    ]).then(([status, ordersRes]) => {
      setPlan(status.plan);
      setExpiresAt(status.expiresAt);
      setOrders((ordersRes as any).orders ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'profile', label: 'プロフィール' },
    { key: 'plan', label: 'プラン管理' },
    { key: 'orders', label: '注文履歴' },
    { key: 'settings', label: '設定' },
  ] as const;

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif font-bold text-crimson mb-6">マイページ</h1>

        {/* User Header */}
        <div className="card-wa p-4 flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-crimson/10 flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <p className="font-bold text-ink text-lg">{user?.displayName ?? '—'} 様</p>
            <p className="text-gray-400 text-sm">{user?.email ?? '—'}</p>
            {plan && <PlanBadge plan={plan} size="sm" className="mt-1" />}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <InfoRow label="お名前" value={user?.displayName ?? '—'} />
              <InfoRow label="メールアドレス" value={user?.email ?? '—'} />
            </div>
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            {plan ? (
              <div className="card-wa p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-ink">現在のプラン</span>
                  <PlanBadge plan={plan} />
                </div>
                {expiresAt && (
                  <p className="text-sm text-gray-500">有効期限: {formatDate(expiresAt)}</p>
                )}
                <div className="mt-4">
                  <Link href="/subscribe" className="btn-secondary w-full block text-center rounded-xl py-3 text-sm">
                    プランを変更する
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-gray-500 mb-4">現在プランに加入していません</p>
                <Link href="/subscribe" className="btn-primary rounded-xl px-8 py-3">
                  プランに加入する
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center h-24">
                <div className="w-8 h-8 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && orders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>注文履歴はありません</p>
              </div>
            )}
            {orders.map((order) => (
              <div key={order.id} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    <p className="font-medium text-sm mt-0.5">{order.items?.length ?? 0}点の商品</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {order.status === 'paid' ? '支払い済み' : order.status}
                    </span>
                    <p className="font-bold text-crimson mt-1">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="card p-4">
              <h3 className="font-bold text-ink mb-3">通知設定</h3>
              <div className="space-y-3">
                {['イベントのお知らせ', '特典更新のお知らせ', 'ショップ新着情報'].map((label) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    <div className="w-11 h-6 bg-crimson/20 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-3 text-center text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
