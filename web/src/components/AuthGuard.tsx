'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-washi">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-crimson border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-crimson font-serif">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
