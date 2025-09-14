import { getLocale } from 'next-intl/server';

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isArabic ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '1. المعلومات التي نجمعها' : '1. Information We Collect'}
          </h2>
          <p className="text-gray-600">
            {isArabic 
              ? 'نجمع الحد الأدنى من المعلومات الشخصية اللازمة لتشغيل منصة اليانصيب:'
              : 'We collect minimal personal information necessary to operate the lottery platform:'}
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>{isArabic ? 'عناوين محافظ العملات المشفرة' : 'Cryptocurrency wallet addresses'}</li>
            <li>{isArabic ? 'عناوين البريد الإلكتروني (اختياري)' : 'Email addresses (optional)'}</li>
            <li>{isArabic ? 'سجل المعاملات المتعلقة بالمشاركة في اليانصيب' : 'Transaction history related to lottery participation'}</li>
            <li>{isArabic ? 'عناوين IP للأمان ومنع الاحتيال' : 'IP addresses for security and fraud prevention'}</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '2. كيف نستخدم معلوماتك' : '2. How We Use Your Information'}
          </h2>
          <p className="text-gray-600">
            {isArabic ? 'نستخدم المعلومات المجمعة من أجل:' : 'We use the collected information to:'}
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>{isArabic ? 'معالجة شراء تذاكر اليانصيب' : 'Process lottery ticket purchases'}</li>
            <li>{isArabic ? 'توزيع الجوائز' : 'Distribute winnings'}</li>
            <li>{isArabic ? 'إرسال تأكيدات المعاملات' : 'Send transaction confirmations'}</li>
            <li>{isArabic ? 'منع الاحتيال وضمان أمان المنصة' : 'Prevent fraud and ensure platform security'}</li>
            <li>{isArabic ? 'الامتثال للالتزامات القانونية' : 'Comply with legal obligations'}</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '3. تخزين البيانات والأمان' : '3. Data Storage and Security'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'نطبق التدابير التقنية والتنظيمية المناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. جميع البيانات مشفرة أثناء النقل وفي حالة السكون.'
              : 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '4. مشاركة البيانات' : '4. Data Sharing'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف ثالثة. قد نشارك المعلومات فقط عندما يكون ذلك مطلوبًا بموجب القانون أو لحماية حقوقنا.'
              : 'We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information only when required by law or to protect our rights.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '5. شفافية البلوكشين' : '5. Blockchain Transparency'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'يرجى ملاحظة أن معاملات البلوكشين عامة بطبيعتها. بينما لا ننشر المعلومات الشخصية، فإن عنوان محفظتك وتفاصيل المعاملة مرئية على البلوكشين.'
              : 'Please note that blockchain transactions are public by nature. While we don\'t publish personal information, your wallet address and transaction details are visible on the blockchain.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '6. حقوقك' : '6. Your Rights'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها. اتصل بنا على privacy@lotr.example لممارسة هذه الحقوق.'
              : 'You have the right to access, correct, or delete your personal information. Contact us at privacy@lotr.example to exercise these rights.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {isArabic ? '7. اتصل بنا' : '7. Contact Us'}
          </h2>
          <p className="text-gray-600">
            {isArabic
              ? 'للأسئلة المتعلقة بالخصوصية، اتصل بنا على privacy@lotr.example'
              : 'For privacy-related questions, contact us at privacy@lotr.example'}
          </p>
        </section>
      </div>
    </div>
  );
}