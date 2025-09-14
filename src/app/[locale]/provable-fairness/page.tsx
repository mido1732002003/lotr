import { getLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProvableFairnessPage() {
  const locale = await getLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'العدالة المثبتة' : 'Provable Fairness'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isArabic 
            ? 'كيف نضمن أن كل سحب عادل تمامًا وقابل للتحقق'
            : 'How we ensure every draw is completely fair and verifiable'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'ما هي العدالة المثبتة؟' : 'What is Provable Fairness?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isArabic
              ? 'العدالة المثبتة هي طريقة تشفيرية تسمح للاعبين بالتحقق من أن نتائج اليانصيب لم يتم التلاعب بها. نظامنا يجمع بين بذور الخادم مع بيانات البلوكشين لضمان الشفافية والعدالة الكاملة.'
              : 'Provable fairness is a cryptographic method that allows players to verify that lottery results were not manipulated. Our system combines server seeds with blockchain data to ensure complete transparency and fairness.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'كيف تعمل' : 'How It Works'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                {isArabic ? '1. مرحلة الالتزام' : '1. Commitment Phase'}
              </h3>
              <p className="text-gray-600">
                {isArabic
                  ? 'قبل كل سحب، نولد بذرة خادم وننشر تجزئة SHA256 الخاصة بها. هذا يلزمنا ببذرة محددة دون الكشف عنها.'
                  : 'Before each draw, we generate a server seed and publish its SHA256 hash. This commits us to a specific seed without revealing it.'}
              </p>
              <div className="bg-gray-100 p-3 rounded mt-2" dir="ltr">
                <code className="text-sm">serverSeedHash = SHA256(serverSeed)</code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                {isArabic ? '2. وقت السحب' : '2. Draw Time'}
              </h3>
              <p className="text-gray-600">
                {isArabic
                  ? 'عند حدوث السحب، نحضر أحدث تجزئة كتلة بيتكوين كمصدر للعشوائية العامة التي لا يمكن التنبؤ بها أو التلاعب بها.'
                  : 'When the draw occurs, we fetch the latest Bitcoin block hash as a source of public randomness that cannot be predicted or manipulated.'}
              </p>
              <div className="bg-gray-100 p-3 rounded mt-2" dir="ltr">
                <code className="text-sm">blockHash = getLatestBitcoinBlockHash()</code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                {isArabic ? '3. اختيار الفائز' : '3. Winner Selection'}
              </h3>
              <p className="text-gray-600">
                {isArabic
                  ? 'نجمع بذرة الخادم مع تجزئة الكتلة ونستخدم النتيجة لتحديد الفائز.'
                  : 'We combine the server seed with the block hash and use the result to determine the winner.'}
              </p>
              <div className="bg-gray-100 p-3 rounded mt-2" dir="ltr">
                <code className="text-sm">
                  combinedHash = SHA256(serverSeed + blockHash)<br/>
                  winnerIndex = combinedHash % totalTickets
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                {isArabic ? '4. التحقق' : '4. Verification'}
              </h3>
              <p className="text-gray-600">
                {isArabic ? 'بعد السحب، نكشف عن بذرة الخادم. يمكن لأي شخص التحقق من:' : 'After the draw, we reveal the server seed. Anyone can verify:'}
              </p>
              <ul className="list-disc pl-6 text-gray-600 mt-2">
                <li>{isArabic ? 'تطابق تجزئة بذرة الخادم مع ما تم نشره قبل السحب' : 'The server seed hash matches what was published before the draw'}</li>
                <li>{isArabic ? 'أصالة تجزئة كتلة البيتكوين' : 'The Bitcoin block hash is authentic'}</li>
                <li>{isArabic ? 'صحة حساب الفائز' : 'The winner calculation is correct'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'لماذا هذا آمن' : 'Why This is Secure'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-600">
            <li>✓ {isArabic ? 'التزام بذرة الخادم يمنعنا من تغييرها بعد رؤية المشاركات' : 'The server seed commitment prevents us from changing it after seeing entries'}</li>
            <li>✓ {isArabic ? 'البلوكشين بيتكوين يوفر عشوائية غير قابلة للتنبؤ ومقاومة للتلاعب' : 'The Bitcoin blockchain provides unpredictable, tamper-proof randomness'}</li>
            <li>✓ {isArabic ? 'يمكن التحقق من جميع الحسابات بشكل مستقل من قبل أي شخص' : 'All calculations can be independently verified by anyone'}</li>
            <li>✓ {isArabic ? 'العملية بأكملها شفافة وقابلة للتدقيق' : 'The entire process is transparent and auditable'}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>
            {isArabic ? 'التحسين المستقبلي: Chainlink VRF' : 'Future Enhancement: Chainlink VRF'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isArabic
              ? 'نخطط لدمج Chainlink VRF (وظيفة عشوائية قابلة للتحقق) للحصول على ضمانات عشوائية أقوى، مما يوفر دليلاً تشفيريًا على أن العشوائية غير قابلة للتنبؤ وغير متحيزة حقًا.'
              : 'We plan to integrate Chainlink VRF (Verifiable Random Function) for even stronger randomness guarantees, providing cryptographic proof that the randomness is truly unpredictable and unbiased.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}