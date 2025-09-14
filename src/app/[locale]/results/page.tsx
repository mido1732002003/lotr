import { getLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db/prisma';
import { formatCurrency, formatDateTime, truncateAddress } from '@/lib/utils/formatting';

export default async function ResultsPage() {
  const locale = await getLocale();
  const isArabic = locale === 'ar';
  
  let completedDraws = [];
  try {
    completedDraws = await prisma.draw.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        tickets: {
          where: { isWinner: true },
          include: { wallet: true },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch results:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'نتائج السحب' : 'Draw Results'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isArabic ? 'عرض نتائج السحوبات السابقة والفائزين' : 'View past draw results and winners'}
        </p>
      </div>

      <div className="grid gap-4">
        {completedDraws.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                {isArabic ? 'لا توجد سحوبات مكتملة بعد' : 'No completed draws yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          completedDraws.map((draw) => {
            const winner = draw.tickets[0];
            return (
              <Card key={draw.id}>
                <CardHeader>
                  <CardTitle>{draw.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {isArabic ? 'اكتمل في' : 'Completed'}
                      </span>
                      <span className="font-semibold">
                        {formatDateTime(draw.completedAt!, locale)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {isArabic ? 'مجموع الجوائز' : 'Prize Pool'}
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(Number(draw.totalPrizePool), draw.currency)}
                      </span>
                    </div>
                    {winner && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {isArabic ? 'الفائز' : 'Winner'}
                        </span>
                        <span className="font-mono text-sm">
                          {truncateAddress(winner.wallet.address)}
                        </span>
                      </div>
                    )}
                    {draw.blockchainAnchor && (
                      <div>
                        <p className="text-gray-600 text-sm">
                          {isArabic ? 'مرساة البلوكشين' : 'Blockchain Anchor'}
                        </p>
                        <p className="font-mono text-xs break-all">
                          {draw.blockchainAnchor}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}