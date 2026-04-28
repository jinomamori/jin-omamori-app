import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="wa-pattern-bg text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl font-serif text-gold/30">仁</div>
          <div className="absolute bottom-10 right-10 text-9xl font-serif text-gold/20">守</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="text-gold text-6xl font-serif block mb-2">仁</span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">
              仁お守り
            </h1>
            <p className="text-gold/80 text-lg tracking-widest">JIN OMAMORI</p>
          </div>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            あなたの日常を豊かにする、<br />
            <span className="text-gold font-semibold">特別な会員特典</span>をご用意しました。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/subscribe" className="btn-gold text-lg px-8 py-4 rounded-xl font-bold shadow-lg">
              プランを選んで始める
            </Link>
            <Link href="#plans" className="btn-secondary text-lg px-8 py-4 rounded-xl font-bold border-gold text-gold hover:bg-gold hover:text-white">
              プランを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-crimson mb-12">
            仁お守りでできること
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏮',
                title: '提携店特典',
                desc: '厳選された提携飲食店で、毎月料理1品サービスを受けられます。',
              },
              {
                icon: '🍽️',
                title: '食事会イベント',
                desc: 'ゴールド・VIP会員は毎月の食事会イベントに参加できます。',
              },
              {
                icon: '🎁',
                title: 'グッズショップ',
                desc: 'オリジナルお守りグッズや限定商品をお得に購入できます。',
              },
            ].map((feat) => (
              <div key={feat.title} className="text-center p-6 rounded-2xl bg-washi border border-gold/20">
                <div className="text-5xl mb-4">{feat.icon}</div>
                <h3 className="font-serif font-bold text-xl text-crimson mb-3">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-16 px-4 bg-washi">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-crimson mb-4">
            会員プラン
          </h2>
          <p className="text-center text-gray-500 mb-12">あなたのライフスタイルに合わせてお選びください</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard */}
            <div className="card-wa p-6">
              <div className="text-center mb-6">
                <span className="inline-block bg-crimson-50 text-crimson text-sm font-bold px-3 py-1 rounded-full border border-crimson/20 mb-3">
                  スタンダード
                </span>
                <div className="text-4xl font-bold text-ink">
                  ¥2,980<span className="text-sm text-gray-400 font-normal">/月</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['会員証発行', '提携店で料理1品サービス（月1回）'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-crimson">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/subscribe" className="btn-primary w-full text-center block rounded-xl py-3">
                登録する
              </Link>
            </div>

            {/* Gold */}
            <div className="card-wa p-6 border-2 border-gold relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gold text-white text-xs font-bold px-4 py-1 rounded-full">人気No.1</span>
              </div>
              <div className="text-center mb-6">
                <span className="inline-block bg-yellow-50 text-yellow-700 text-sm font-bold px-3 py-1 rounded-full border border-yellow-300 mb-3">
                  ゴールド ★
                </span>
                <div className="text-4xl font-bold text-ink">
                  ¥4,980<span className="text-sm text-gray-400 font-normal">/月</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['会員証発行', '居酒屋食事会（月1回）'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-gold-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/subscribe" className="btn-gold w-full text-center block rounded-xl py-3">
                登録する
              </Link>
            </div>

            {/* VIP */}
            <div className="card-wa p-6 border-2 border-purple-300">
              <div className="text-center mb-6">
                <span className="inline-block bg-purple-50 text-purple-700 text-sm font-bold px-3 py-1 rounded-full border border-purple-300 mb-3">
                  VIP ♦
                </span>
                <div className="text-4xl font-bold text-ink">
                  ¥9,800<span className="text-sm text-gray-400 font-normal">/月</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['会員証発行', '焼肉食事会（月1回）'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-purple-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/subscribe" className="w-full text-center block rounded-xl py-3 bg-purple-700 text-white font-medium hover:bg-purple-800 transition-colors">
                登録する
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 wa-pattern-bg text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
          今すぐ始めませんか？
        </h2>
        <p className="text-white/80 mb-8">あなたに合ったプランを選んで、特別な特典を楽しもう</p>
        <Link href="/subscribe" className="btn-gold text-lg px-10 py-4 rounded-xl font-bold shadow-lg">
          プランを選ぶ
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white/60 py-8 px-4 text-center text-sm">
        <p className="font-serif text-white mb-2">仁お守り</p>
        <p>© 2024 JIN OMAMORI. All rights reserved.</p>
      </footer>
    </div>
  );
}
