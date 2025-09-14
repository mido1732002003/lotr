'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DrawTriggerProps {
  draw: any;
}

export default function DrawTrigger({ draw }: DrawTriggerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [manualAnchor, setManualAnchor] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const handleRunDraw = async () => {
    if (!confirm(`Are you sure you want to run draw "${draw.title}"?`)) {
      return;
    }
    
    setIsRunning(true);
    try {
      const response = await fetch('/api/draws/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawId: draw.id,
          blockchainAnchor: manualAnchor || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        alert(`Draw completed! Winner: ${data.winner.ticketNumber}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Draw run error:', error);
      alert('Failed to run draw');
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="space-y-2">
      {draw.status === 'ACTIVE' && (
        <>
          <Input
            placeholder="Manual anchor (optional)"
            value={manualAnchor}
            onChange={(e) => setManualAnchor(e.target.value)}
            className="text-xs"
          />
          <Button
            onClick={handleRunDraw}
            disabled={isRunning || draw._count.tickets === 0}
            size="sm"
          >
            {isRunning ? 'Running...' : 'Run Draw'}
          </Button>
        </>
      )}
      
      {draw.status === 'UPCOMING' && (
        <Button size="sm" variant="outline" disabled>
          Scheduled
        </Button>
      )}
      
      {draw.status === 'COMPLETED' && (
        <Button size="sm" variant="outline" disabled>
          Completed
        </Button>
      )}
      
      {result && (
        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
          <p>Winner: {result.winner.ticketNumber}</p>
          <p>User: {result.winner.userId || 'Anonymous'}</p>
        </div>
      )}
    </div>
  );
}