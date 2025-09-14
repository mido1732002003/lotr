'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from './language-switcher';
import { Button } from '@/components/ui/button';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleConnectWallet = () => {
    // Simple wallet connection simulation
    const mockAddress = '0x' + Math.random().toString(36).substring(2, 15).padEnd(40, '0');
    setWalletAddress(mockAddress);
    localStorage.setItem('walletAddress', mockAddress);
    alert(`Wallet connected: ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`);
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <span className="text-2xl font-bold gradient-text">LOTR</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href={`/${locale}`} className="text-sm font-medium hover:text-primary">
            {t('home')}
          </Link>
          <Link href={`/${locale}/draws`} className="text-sm font-medium hover:text-primary">
            {t('draws')}
          </Link>
          <Link href={`/${locale}/results`} className="text-sm font-medium hover:text-primary">
            {t('results')}
          </Link>
          <Link href={`/${locale}/how-it-works`} className="text-sm font-medium hover:text-primary">
            {t('howItWorks')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
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