'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TicketsTable from '@/components/admin/tickets-table';
import AuditTrail from '@/components/admin/audit-trail';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatting';

export default function AdminPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [activeDraws, setActiveDraws] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalPrizePool: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [createDrawForm, setCreateDrawForm] = useState({
    title: '',
    description: '',
    ticketPrice: '10',
    maxTickets: '100',
    scheduledAt: '',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchAdminData();
  }, []);

  const checkAuth = async () => {
    const response = await fetch('/api/auth/check');
    if (!response.ok) {
      router.push('/');
    }
  };

  const fetchAdminData = async () => {
    try {
      const drawsResponse = await fetch('/api/admin/draws');
      const drawsData = await drawsResponse.json();
      setActiveDraws(drawsData.draws || []);

      const payoutsResponse = await fetch('/api/admin/payouts');
      const payoutsData = await payoutsResponse.json();
      setPendingPayouts(payoutsData.payouts || []);

      const totalTickets = drawsData.draws?.reduce((sum: number, d: any) => sum + (d._count?.tickets || 0), 0) || 0;
      const totalPrizePool = drawsData.draws?.reduce((sum: number, d: any) => sum + Number(d.totalPrizePool || 0), 0) || 0;
      setStats({ totalTickets, totalPrizePool });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDraw = async () => {
    try {
      const response = await fetch('/api/admin/draws/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createDrawForm,
          ticketPrice: parseFloat(createDrawForm.ticketPrice),
          maxTickets: parseInt(createDrawForm.maxTickets),
          scheduledAt: new Date(createDrawForm.scheduledAt).toISOString(),
        }),
      });

      if (response.ok) {
        alert(t('alerts.drawCreated'));
        setShowCreateForm(false);
        fetchAdminData();
      } else {
        alert(t('alerts.failed'));
      }
    } catch (error) {
      console.error('Error creating draw:', error);
      alert(t('alerts.failed'));
    }
  };

  const handleStartDraw = async (drawId: string) => {
    if (!confirm(t('alerts.confirmStart'))) return;

    try {
      const response = await fetch('/api/admin/draws/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawId }),
      });

      if (response.ok) {
        alert(t('alerts.drawStarted'));
        fetchAdminData();
      } else {
        alert(t('alerts.failed'));
      }
    } catch (error) {
      console.error('Error starting draw:', error);
      alert(t('alerts.failed'));
    }
  };

  const handleRunDraw = async (drawId: string) => {
    if (!confirm(t('alerts.confirmRun'))) return;

    try {
      const response = await fetch('/api/draws/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(t('alerts.drawCompleted', { winner: data.winner?.ticketNumber || 'No winner' }));
        fetchAdminData();
      } else {
        alert(`${t('alerts.failed')}: ${data.error}`);
      }
    } catch (error) {
      console.error('Error running draw:', error);
      alert(t('alerts.failed'));
    }
  };

  const handleRecordPayout = async (payoutId: string, transactionHash: string) => {
    try {
      const response = await fetch('/api/payouts/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, transactionHash }),
      });

      if (response.ok) {
        alert(t('alerts.payoutRecorded'));
        fetchAdminData();
      } else {
        alert(t('alerts.failed'));
      }
    } catch (error) {
      console.error('Error recording payout:', error);
      alert(t('alerts.failed'));
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? t('createDraw.cancel') : t('createDraw.button')}
        </Button>
      </div>

      {/* Create Draw Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('createDraw.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">{t('createDraw.form.title')}</Label>
                <Input
                  id="title"
                  value={createDrawForm.title}
                  onChange={(e) => setCreateDrawForm({ ...createDrawForm, title: e.target.value })}
                  placeholder={t('createDraw.form.titlePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="ticketPrice">{t('createDraw.form.ticketPrice')}</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={createDrawForm.ticketPrice}
                  onChange={(e) => setCreateDrawForm({ ...createDrawForm, ticketPrice: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <Label htmlFor="maxTickets">{t('createDraw.form.maxTickets')}</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  value={createDrawForm.maxTickets}
                  onChange={(e) => setCreateDrawForm({ ...createDrawForm, maxTickets: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <Label htmlFor="scheduledAt">{t('createDraw.form.scheduledAt')}</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={createDrawForm.scheduledAt}
                  onChange={(e) => setCreateDrawForm({ ...createDrawForm, scheduledAt: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">{t('createDraw.form.description')}</Label>
                <Input
                  id="description"
                  value={createDrawForm.description}
                  onChange={(e) => setCreateDrawForm({ ...createDrawForm, description: e.target.value })}
                  placeholder={t('createDraw.form.descriptionPlaceholder')}
                />
              </div>
            </div>
            <Button onClick={handleCreateDraw} className="mt-4">
              {t('createDraw.form.create')}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('stats.activeDraws')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeDraws.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('stats.pendingPayouts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingPayouts.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('stats.totalTickets')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalTickets}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('stats.totalPrizePool')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.totalPrizePool.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Draws */}
      <Card>
        <CardHeader>
          <CardTitle>{t('draws.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeDraws.length === 0 ? (
            <p className="text-gray-600">{t('draws.noDraws')}</p>
          ) : (
            <div className="space-y-4">
              {activeDraws.map((draw) => (
                <div key={draw.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{draw.title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">{t('draws.status')}:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                            draw.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            draw.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {draw.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('draws.tickets')}:</span>
                          <span className="ml-2 font-semibold">{draw._count?.tickets || 0} / {draw.maxTickets}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('draws.price')}:</span>
                          <span className="ml-2 font-semibold">${Number(draw.ticketPrice).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('draws.prizePool')}:</span>
                          <span className="ml-2 font-semibold text-green-600">${Number(draw.totalPrizePool || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {t('draws.scheduled')}: {formatDateTime(draw.scheduledAt, locale)}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {draw.status === 'UPCOMING' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartDraw(draw.id)}
                        >
                          {t('draws.startDraw')}
                        </Button>
                      )}
                      {draw.status === 'ACTIVE' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRunDraw(draw.id)}
                          disabled={draw._count?.tickets === 0}
                        >
                          {t('draws.runDraw')}
                        </Button>
                      )}
                      {draw.status === 'COMPLETED' && (
                        <Button size="sm" variant="outline" disabled>
                          {t('draws.completed')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pending Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payouts.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayouts.length === 0 ? (
            <p className="text-gray-600">{t('payouts.noPayouts')}</p>
          ) : (
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {t('payouts.amount')}: {formatCurrency(Number(payout.amount), payout.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('payouts.wallet')}: {payout.ticket?.wallet?.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('payouts.draw')}: {payout.ticket?.draw?.title}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder={t('payouts.txHashPlaceholder')}
                        className="w-64"
                        id={`tx-${payout.id}`}
                        dir="ltr"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`tx-${payout.id}`) as HTMLInputElement;
                          if (input?.value) {
                            handleRecordPayout(payout.id, input.value);
                          } else {
                            alert(t('payouts.enterTxHash'));
                          }
                        }}
                      >
                        {t('payouts.markAsPaid')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tickets.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketsTable />
        </CardContent>
      </Card>
      
      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>{t('auditLogs.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTrail />
        </CardContent>
      </Card>
    </div>
  );
}