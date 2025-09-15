'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from './language-switcher';
import { Button } from '@/components/ui/button';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isLoggedIn = !!userEmail;

  useEffect(() => {
    // Simulated wallet from previous implementation
    const w = typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null;
    if (w) setWalletAddress(w);
  }, []);

  useEffect(() => {
    // Fetch session user for conditional navigation
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        setUserEmail(data.user?.email ?? null);
      } catch {
        setUserEmail(null);
      }
    }
    fetchMe();
  }, []);

  function handleConnectWallet() {
    const mock = '0x' + Math.random().toString(16).slice(2).padEnd(40, '0');
    setWalletAddress(mock);
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', mock);
    }
    alert(`${t('walletConnected')}: ${mock.slice(0, 6)}...${mock.slice(-4)}`);
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserEmail(null);
      // simple reload to refresh UI
      window.location.href = `/${locale}`;
    } catch {
      // ignore
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            LOTR
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href={`/${locale}`} className="text-sm font-medium hover:text-blue-600">
            {t('home')}
          </Link>
          <Link href={`/${locale}/draws`} className="text-sm font-medium hover:text-blue-600">
            {t('draws')}
          </Link>
          <Link href={`/${locale}/results`} className="text-sm font-medium hover:text-blue-600">
            {t('results')}
          </Link>
          <Link href={`/${locale}/how-it-works`} className="text-sm font-medium hover:text-blue-600">
            {t('howItWorks')}
          </Link>
          {isLoggedIn ? (
            <>
              <Link href={`/${locale}/dashboard`} className="text-sm font-medium hover:text-blue-600">
                {t('dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`} className="text-sm font-medium hover:text-blue-600">
                {t('login')}
              </Link>
              <Link href={`/${locale}/auth/register`} className="text-sm font-medium hover:text-blue-600">
                {t('register')}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {walletAddress ? (
            <span className="text-xs font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          ) : (
            <Button variant="outline" size="sm" onClick={handleConnectWallet}>
              {t('connectWallet')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}