import { getLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db/prisma';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatting';

export default async function DrawsPage() {
  const locale = await getLocale();
  const isArabic = locale === 'ar';
  
  let draws: any[] = [];

  try {
    draws = await prisma.draw.findMany({
      orderBy: { scheduledAt: 'desc' },
      take: 20,
      include: {
        _count: { select: { tickets: true } },
      },
    });
  } catch (error) {
    console.error('Failed to fetch draws:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'جميع السحوبات' : 'All Draws'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isArabic ? 'عرض السحوبات القادمة والنشطة والمكتملة' : 'View upcoming, active, and completed lottery draws'}
        </p>
      </div>

      <div className="grid gap-4">
        {draws.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                {isArabic ? 'لا توجد سحوبات متاحة في الوقت الحالي' : 'No draws available at the moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          draws.map((draw) => (
            <Card key={draw.id}>
              <CardHeader>
                <CardTitle>{draw.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isArabic ? 'الحالة' : 'Status'}
                    </p>
                    <p className="font-semibold">{draw.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {isArabic ? 'مجموع الجوائز' : 'Prize Pool'}
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(Number(draw.totalPrizePool), draw.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {isArabic ? 'التذاكر المباعة' : 'Tickets Sold'}
                    </p>
                    <p className="font-semibold">
                      {draw._count.tickets} / {draw.maxTickets}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {isArabic ? 'تاريخ السحب' : 'Draw Date'}
                    </p>
                    <p className="font-semibold">
                      {formatDateTime(draw.scheduledAt, locale)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}