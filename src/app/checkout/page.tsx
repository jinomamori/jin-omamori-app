'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { ordersApi } from '@/lib/api';
import { getCart, getCartTotal, clearCart, formatPrice, CartItem, ShippingAddress } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ShippingAddress>({
    name: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      router.replace('/cart');
      return;
    }
    setItems(cart);
  }, [router]);

  function handleChange(field: keyof ShippingAddress, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      const { orderId, checkoutUrl } = await ordersApi.create(orderItems) as any;
      const { checkoutUrl: payUrl } = await ordersApi.pay(orderId, { shippingAddress: form }) as any;
      clearCart();
      window.location.href = payUrl;
    } catch (err: any) {
      setError(err.message || '決済処理に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const total = getCartTotal(items);

  const prefectures = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif font-bold text-crimson mb-6">購入手続き</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="card p-4">
            <h2 className="font-bold text-ink mb-3">注文内容</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="wa-divider" />
              <div className="flex justify-between font-bold">
                <span>合計</span>
                <span className="text-crimson">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-4">
            <h2 className="font-bold text-ink mb-4">配送先情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">お名前 <span className="text-red-500">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input-field" placeholder="山田 太郎" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号 <span className="text-red-500">*</span></label>
                <input type="text" required value={form.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} className="input-field" placeholder="123-4567" pattern="[0-9]{3}-?[0-9]{4}" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">都道府県 <span className="text-red-500">*</span></label>
                <select required value={form.prefecture} onChange={(e) => handleChange('prefecture', e.target.value)} className="input-field">
                  <option value="">選択してください</option>
                  {prefectures.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">市区町村 <span className="text-red-500">*</span></label>
                <input type="text" required value={form.city} onChange={(e) => handleChange('city', e.target.value)} className="input-field" placeholder="渋谷区" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">番地・建物名 <span className="text-red-500">*</span></label>
                <input type="text" required value={form.address} onChange={(e) => handleChange('address', e.target.value)} className="input-field" placeholder="1-2-3 ○○マンション101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
                <input type="tel" required value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="input-field" placeholder="090-1234-5678" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <p className="text-xs text-gray-400 text-center">
            「Stripeで支払う」ボタンを押すと、Stripeの安全な決済ページへ移動します
          </p>

          <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-4 text-base">
            {loading ? '処理中...' : `Stripeで支払う（${formatPrice(total)}）`}
          </button>
        </form>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
