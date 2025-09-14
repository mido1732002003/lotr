'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TicketPurchase from '@/components/lottery/ticket-purchase';
import DrawInfo from '@/components/lottery/draw-info';
import RecentWinners from '@/components/lottery/recent-winners';

export default function HomePage() {
  const t = useTranslations('home');
  const router = useRouter();
  const [currentDraw, setCurrentDraw] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    fetchCurrentDraw();
  }, []);

  const fetchCurrentDraw = async () => {
    try {
      const response = await fetch('/api/lottery/current-draw');
      const data = await response.json();
      if (data.draw) {
        setCurrentDraw(data.draw);
      }
    } catch (error) {
      console.error('Failed to fetch current draw:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyTicket = () => {
    if (currentDraw) {
      setShowPurchase(true);
      // Scroll to purchase section
      setTimeout(() => {
        document.getElementById('purchase-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      alert('No active draw available at the moment');
    }
  };

  const handleHowItWorks = () => {
    router.push('/how-it-works');
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 space-y-6">
        <h1 className="text-5xl font-bold gradient-text">{t('title')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="text-lg px-8" onClick={handleBuyTicket}>
            {t('buyTicket')}
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8" onClick={handleHowItWorks}>
            {t('howItWorks')}
          </Button>
        </div>
      </section>

      {/* Current Draw */}
      {isLoading ? (
        <section className="text-center">
          <p className="text-gray-600">Loading current draw...</p>
        </section>
      ) : currentDraw ? (
        <section className="space-y-6" id="purchase-section">
          <h2 className="text-3xl font-bold text-center">{t('currentDraw')}</h2>
          <DrawInfo draw={currentDraw} />
          {showPurchase && (
            <Card className="p-6">
              <TicketPurchase draw={currentDraw} />
            </Card>
          )}
        </section>
      ) : (
        <section className="text-center">
          <Card className="p-12">
            <p className="text-gray-600">No active draws at the moment. Check back soon!</p>
          </Card>
        </section>
      )}

      {/* Features */}
      <section className="lottery-grid">
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">{t('features.provablyFair.title')}</h3>
          <p className="text-gray-600">{t('features.provablyFair.description')}</p>
        </Card>
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">{t('features.instantPayout.title')}</h3>
          <p className="text-gray-600">{t('features.instantPayout.description')}</p>
        </Card>
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">{t('features.cryptoPayments.title')}</h3>
          <p className="text-gray-600">{t('features.cryptoPayments.description')}</p>
        </Card>
      </section>

      {/* Recent Winners */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">{t('recentWinners')}</h2>
        <RecentWinners />
      </section>
    </div>
  );
}