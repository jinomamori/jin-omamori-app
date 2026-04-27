'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isLoggedIn, logout } from '@/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-50 bg-crimson shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={loggedIn ? '/home' : '/'} className="flex items-center gap-2">
          <span className="text-gold text-2xl font-serif">仁</span>
          <div>
            <p className="text-gold font-serif text-lg leading-tight">仁お守り</p>
            <p className="text-gold/60 text-xs">JIN OMAMORI</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {loggedIn ? (
            <>
              <Link href="/home" className={`text-sm font-medium transition-colors ${pathname === '/home' ? 'text-gold' : 'text-white hover:text-gold'}`}>
                ホーム
              </Link>
              <Link href="/partner-stores" className={`text-sm font-medium transition-colors ${pathname.startsWith('/partner-stores') ? 'text-gold' : 'text-white hover:text-gold'}`}>
                提携店
              </Link>
              <Link href="/events" className={`text-sm font-medium transition-colors ${pathname.startsWith('/events') ? 'text-gold' : 'text-white hover:text-gold'}`}>
                食事会
              </Link>
              <Link href="/shop" className={`text-sm font-medium transition-colors ${pathname.startsWith('/shop') ? 'text-gold' : 'text-white hover:text-gold'}`}>
                ショップ
              </Link>
              <Link href="/member-card" className={`text-sm font-medium transition-colors ${pathname === '/member-card' ? 'text-gold' : 'text-white hover:text-gold'}`}>
                会員証
              </Link>
              <Link href="/mypage" className={`text-sm font-medium transition-colors ${pathname === '/mypage' ? 'text-gold' : 'text-white hover:text-gold'}`}>
                マイページ
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white hover:text-gold transition-colors">
                ログイン
              </Link>
              <Link href="/register" className="btn-gold text-sm px-4 py-2 rounded-lg">
                新規登録
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-current transition-all" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-crimson-700 border-t border-gold/20">
          {loggedIn ? (
            <nav className="flex flex-col py-2">
              {[
                { href: '/home', label: 'ホーム' },
                { href: '/partner-stores', label: '提携店' },
                { href: '/events', label: '食事会' },
                { href: '/shop', label: 'ショップ' },
                { href: '/member-card', label: '会員証' },
                { href: '/mypage', label: 'マイページ' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-3 text-white hover:bg-crimson/50 hover:text-gold transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={logout}
                className="px-4 py-3 text-left text-white/60 hover:bg-crimson/50 hover:text-white transition-colors"
              >
                ログアウト
              </button>
            </nav>
          ) : (
            <nav className="flex flex-col py-2">
              <Link href="/login" className="px-4 py-3 text-white hover:bg-crimson/50 transition-colors" onClick={() => setMenuOpen(false)}>
                ログイン
              </Link>
              <Link href="/register" className="px-4 py-3 text-gold hover:bg-crimson/50 transition-colors" onClick={() => setMenuOpen(false)}>
                新規登録
              </Link>
            </nav>
          )}
        </div>
      )}
    </header>
  );
}
