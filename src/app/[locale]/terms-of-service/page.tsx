import { getLocale } from 'next-intl/server';

export default async function TermsOfServicePage() {
  const locale = await getLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'شروط الخدمة' : 'Terms of Service'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isArabic ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '1. قبول الشروط' : '1. Acceptance of Terms'}
          </h2>
          <p className="text-gray-600">
            {isArabic 
              ? 'بدخولك واستخدامك منصة يانصيب LOTR، فإنك توافق وتقبل الالتزام بشروط وأحكام هذه الاتفاقية.'
              : 'By accessing and using LOTR lottery platform, you accept and agree to be bound by the terms and provision of this agreement.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '2. الأهلية' : '2. Eligibility'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'يجب أن يكون عمرك 18 عامًا على الأقل ومسموحًا لك قانونيًا بالمشاركة في ألعاب اليانصيب في منطقتك. تقع على عاتقك مسؤولية التأكد من أن مشاركتك قانونية في موقعك.'
              : 'You must be at least 18 years old and legally allowed to participate in lottery games in your jurisdiction. It is your responsibility to ensure that your participation is legal in your location.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '3. تسجيل الحساب' : '3. Account Registration'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'للمشاركة في اليانصيب، يجب عليك تقديم عنوان محفظة عملة مشفرة صالح. أنت مسؤول عن الحفاظ على أمان محفظتك وأي أنشطة تحدث تحت حسابك.'
              : 'To participate in the lottery, you must provide a valid cryptocurrency wallet address. You are responsible for maintaining the security of your wallet and any activities that occur under your account.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '4. قواعد اليانصيب' : '4. Lottery Rules'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'جميع السحوبات تتم باستخدام خوارزميات عادلة مثبتة. يتم اختيار الفائزين عشوائيًا باستخدام تقنية البلوكشين. تأخذ المنصة رسومًا بنسبة 5٪ من مجموع الجوائز لتغطية التكاليف التشغيلية.'
              : 'All lottery draws are conducted using provably fair algorithms. Winners are selected randomly using blockchain technology. The platform takes a 5% fee from the prize pool for operational costs.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '5. المدفوعات والجوائز' : '5. Payments and Payouts'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'يجب إجراء جميع المدفوعات بالعملات المشفرة المدعومة. تتم معالجة المدفوعات إلى عنوان المحفظة المرتبط بالتذكرة الفائزة. قد تختلف أوقات المعالجة حسب ظروف شبكة البلوكشين.'
              : 'All payments must be made in supported cryptocurrencies. Payouts are processed to the wallet address associated with the winning ticket. Processing times may vary depending on blockchain network conditions.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '6. إخلاء المسؤولية' : '6. Disclaimer of Warranties'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'يتم تقديم الخدمة "كما هي" دون أي ضمانات، صريحة أو ضمنية. نحن لا نضمن الوصول المستمر وغير المنقطع إلى الخدمة.'
              : 'The service is provided "as is" without any warranties, express or implied. We do not guarantee continuous, uninterrupted access to the service.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '7. معلومات الاتصال' : '7. Contact Information'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'للأسئلة حول هذه الشروط، يرجى الاتصال بنا على legal@lotr.example'
              : 'For questions about these Terms, please contact us at legal@lotr.example'}
          </p>
        </section>
      </div>
    </div>
  );
}