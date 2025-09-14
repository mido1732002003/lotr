'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDateTime, truncateAddress } from '@/lib/utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Ticket {
  id: string;
  ticketNumber: string;
  status: string;
  draw: {
    title: string;
  };
  user?: {
    email?: string;
  };
  wallet: {
    address: string;
  };
  payment?: {
    amount: number;
    currency: string;
    status: string;
  };
  createdAt: string;
}

export default function TicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTickets();
  }, []);
  
  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/tickets');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div>Loading tickets...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Ticket #</th>
                <th className="text-left p-2">Draw</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Wallet</th>
                <th className="text-left p-2">Payment</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs">{ticket.ticketNumber}</td>
                  <td className="p-2">{ticket.draw.title}</td>
                  <td className="p-2">
                    {ticket.user?.email || 'Anonymous'}
                  </td>
                  <td className="p-2 font-mono text-xs">
                    {truncateAddress(ticket.wallet.address)}
                  </td>
                  <td className="p-2">
                    {ticket.payment ? (
                      <span>
                        {formatCurrency(Number(ticket.payment.amount), ticket.payment.currency)}
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          ticket.payment.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          ticket.payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ticket.payment.status}
                        </span>
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ticket.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'WON' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'LOST' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-2 text-xs">
                    {formatDateTime(ticket.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}