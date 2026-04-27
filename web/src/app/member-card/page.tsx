'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import PlanBadge from '@/components/PlanBadge';
import { membershipApi } from '@/lib/api';

interface MembershipData {
  memberNumber: string;
  plan: string;
  displayName: string;
  qrData: string;
  validUntil: string;
}

export default function MemberCardPage() {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    membershipApi.getMembership()
      .then(setMembership)
      .catch(() => setError('会員証を取得できませんでした'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-sm mx-auto px-4 py-8">
        <h1 className="text-2xl font-serif font-bold text-center text-crimson mb-6">会員証</h1>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}

        {membership && !loading && (
          <div className="wa-pattern-bg rounded-3xl p-6 shadow-2xl">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gold/70 text-xs tracking-widest mb-1">JIN OMAMORI</p>
                <p className="text-gold text-2xl font-serif font-bold">仁お守り</p>
              </div>
              <PlanBadge plan={membership.plan} size="sm" />
            </div>

            {/* QR Code Area */}
            <div className="bg-white rounded-2xl p-4 mx-auto w-48 h-48 flex items-center justify-center shadow-inner mb-6">
              <QRCodeDisplay value={membership.qrData} />
            </div>

            {/* Member Info */}
            <div className="space-y-3">
              <div className="wa-divider" />
              <div className="flex justify-between items-center">
                <span className="text-gold/60 text-xs">お名前</span>
                <span className="text-white font-medium">{membership.displayName} 様</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gold/60 text-xs">会員番号</span>
                <span className="text-white font-mono text-sm tracking-wider">{membership.memberNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gold/60 text-xs">有効期限</span>
                <span className="text-white text-sm">
                  {membership.validUntil
                    ? new Date(membership.validUntil).toLocaleDateString('ja-JP')
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 使い方 */}
        <div className="mt-8">
          <h2 className="section-title pb-2 mb-4">使い方</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center shrink-0">1</span>
              <span>提携店のスタッフにこの会員証を見せてください</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center shrink-0">2</span>
              <span>QRコードをスキャンしてもらいます</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center shrink-0">3</span>
              <span>特典（料理1品サービス）を受け取ってください</span>
            </li>
          </ol>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}

function QRCodeDisplay({ value }: { value: string }) {
  const [QRCode, setQRCode] = useState<React.ComponentType<{ value: string; size: number; level: string }> | null>(null);

  useEffect(() => {
    import('qrcode.react').then((mod) => {
      setQRCode(() => mod.QRCodeSVG as any);
    });
  }, []);

  if (!QRCode) {
    return (
      <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
        QR生成中...
      </div>
    );
  }

  return <QRCode value={value} size={160} level="H" />;
}
