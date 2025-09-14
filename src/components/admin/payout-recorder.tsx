'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, truncateAddress } from '@/lib/utils/formatting';

interface PayoutRecorderProps {
  payout: any;
}

export default function PayoutRecorder({ payout }: PayoutRecorderProps) {
  const [txHash, setTxHash] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const handleRecordPayout = async () => {
    if (!txHash) {
      alert('Please enter transaction hash');
      return;
    }
    
    setIsRecording(true);
    try {
      const response = await fetch('/api/payouts/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutId: payout.id,
          transactionHash: txHash,
        }),
      });
      
      if (response.ok) {
        alert('Payout recorded successfully');
        setTxHash('');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Payout record error:', error);
      alert('Failed to record payout');
    } finally {
      setIsRecording(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">
            {formatCurrency(Number(payout.amount), payout.currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            To: {truncateAddress(payout.ticket.wallet.address)}
          </p>
          <p className="text-xs text-muted-foreground">
            Draw: {payout.ticket.draw.title}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Transaction hash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={handleRecordPayout}
            disabled={isRecording || !txHash}
            size="sm"
          >
            {isRecording ? 'Recording...' : 'Record Payout'}
          </Button>
        </div>
      </div>
    </div>
  );
}