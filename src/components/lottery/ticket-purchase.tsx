'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/formatting';

interface TicketPurchaseProps {
  draw: any;
}

export default function TicketPurchase({ draw }: TicketPurchaseProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      ticketCount: 1,
      walletAddress: '',
      email: '',
      paymentMethod: 'COINBASE_COMMERCE',
    },
  });
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawId: draw.id,
          ticketCount: data.ticketCount,
          walletAddress: data.walletAddress,
          walletNetwork: 'ETHEREUM',
          email: data.email,
          paymentMethod: data.paymentMethod,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.href = result.checkoutUrl;
      } else {
        console.error('Checkout failed:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to create checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalPrice = Number(draw.ticketPrice) * ticketCount;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="ticketCount">Number of Tickets</Label>
        <Input
          id="ticketCount"
          type="number"
          min="1"
          max="100"
          {...register('ticketCount', { 
            required: true, 
            min: 1, 
            max: 100,
            valueAsNumber: true,
          })}
          onChange={(e) => setTicketCount(Number(e.target.value) || 1)}
        />
        {errors.ticketCount && (
          <p className="text-sm text-red-500 mt-1">Please enter a valid number of tickets</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="walletAddress">Wallet Address</Label>
        <Input
          id="walletAddress"
          placeholder="0x..."
          {...register('walletAddress', { 
            required: 'Wallet address is required',
            pattern: {
              value: /^0x[a-fA-F0-9]{40}$/,
              message: 'Invalid Ethereum address',
            },
          })}
        />
        {errors.walletAddress && (
          <p className="text-sm text-red-500 mt-1">{errors.walletAddress.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="optional@example.com"
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <select
          id="paymentMethod"
          className="w-full px-3 py-2 border rounded-md"
          {...register('paymentMethod')}
        >
          <option value="COINBASE_COMMERCE">Coinbase Commerce</option>
          <option value="NOWPAYMENTS" disabled>NOWPayments (Coming Soon)</option>
        </select>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalPrice, draw.currency)}
          </span>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </Button>
    </form>
  );
}