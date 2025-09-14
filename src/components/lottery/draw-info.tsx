'use client';

import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatting';

interface DrawInfoProps {
  draw: any;
}

export default function DrawInfo({ draw }: DrawInfoProps) {
  const locale = useLocale();
  
  const ticketsSold = draw._count?.tickets || 0;
  const progress = (ticketsSold / draw.maxTickets) * 100;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Ticket Price</p>
            <p className="text-2xl font-bold">
              {formatCurrency(Number(draw.ticketPrice), draw.currency)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Prize Pool</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(Number(draw.totalPrizePool), draw.currency)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Draw Date</p>
            <p className="text-lg font-semibold">
              {formatDateTime(draw.scheduledAt, locale)}
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Tickets Sold</span>
            <span>{ticketsSold} / {draw.maxTickets}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {draw.serverSeedHash && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Server Seed Hash (Commitment):</p>
            <p className="text-xs font-mono break-all">{draw.serverSeedHash}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}