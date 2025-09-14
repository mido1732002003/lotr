'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, truncateAddress, formatRelativeTime } from '@/lib/utils/formatting';

interface Winner {
  id: string;
  ticketNumber: string;
  draw: {
    title: string;
    currency: string;
  };
  wallet: {
    address: string;
  };
  payout?: {
    amount: string;
  };
  createdAt: string;
}

export default function RecentWinners() {
  const locale = useLocale();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const response = await fetch('/api/lottery/winners');
      const data = await response.json();
      setWinners(data.winners || []);
    } catch (error) {
      console.error('Failed to fetch winners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">Loading winners...</p>
        </CardContent>
      </Card>
    );
  }

  if (winners.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">No winners yet. Be the first!</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {winners.map((ticket) => (
        <Card key={ticket.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{ticket.draw.title}</p>
                <p className="text-sm text-gray-600">
                  {truncateAddress(ticket.wallet.address)}
                </p>
                <p className="text-xs text-gray-600">
                  {formatRelativeTime(ticket.createdAt, locale)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(ticket.payout?.amount || 0), ticket.draw.currency)}
                </p>
                <p className="text-sm text-gray-600">Won</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}