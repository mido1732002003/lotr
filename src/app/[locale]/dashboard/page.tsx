import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatting';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('dashboard');
  const user = await requireUser(params.locale);

  // Fetch tickets and payments for the logged-in user
  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    include: {
      draw: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const recentPayments = tickets
    .map((tk) => tk.payment)
    .filter(Boolean)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600">{t('welcome', { email: user.email })}</p>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t('tickets')}</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-gray-600">{t('noTickets')}</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((tk) => (
                  <div key={tk.id} className="border rounded p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{tk.draw.title}</p>
                        <p className="text-sm text-gray-600">
                          {t('ticketNumber')}: {tk.ticketNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t('status')}: {tk.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDateTime(tk.createdAt)}</p>
                        <p className="text-sm">
                          {t('price')}: {formatCurrency(Number(tk.draw.ticketPrice), tk.draw.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t('payments')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentPayments || recentPayments.length === 0 ? (
              <p className="text-gray-600">{t('noPayments')}</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((pmt) => (
                  <div key={pmt!.id} className="border rounded p-3 flex justify-between">
                    <div>
                      <p className="font-semibold">{pmt!.provider}</p>
                      <p className="text-sm text-gray-600">
                        {t('status')}: {pmt!.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {formatCurrency(Number(pmt!.amount), pmt!.currency)}
                      </p>
                      {pmt!.confirmedAt && (
                        <p className="text-sm">{formatDateTime(pmt!.confirmedAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}