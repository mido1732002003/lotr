'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const faqs = isArabic ? [
    {
      question: 'كيف يعمل اليانصيب؟',
      answer: 'يشتري اللاعبون التذاكر باستخدام العملة المشفرة. عند حلول وقت السحب، يتم اختيار فائز باستخدام خوارزمية عادلة مثبتة تجمع بين بذور الخادم وبيانات البلوكشين. يتلقى الفائز مجموع الجوائز مطروحًا منه رسوم منصة صغيرة.',
    },
    {
      question: 'ما هي العملات المشفرة التي تقبلونها؟',
      answer: 'نقبل حاليًا البيتكوين (BTC) والإيثريوم (ETH) و USDC من خلال Coinbase Commerce. سيتم إضافة المزيد من خيارات الدفع قريبًا.',
    },
    {
      question: 'كيف يتم اختيار الفائزين؟',
      answer: 'يتم اختيار الفائزين باستخدام خوارزمية عادلة مثبتة تجمع بين بذرة خادم ملتزمة مسبقًا مع أحدث تجزئة كتلة بيتكوين. هذا يضمن أن النتيجة عشوائية ولا يمكن التلاعب بها.',
    },
    {
      question: 'كم من الوقت يستغرق استلام الجوائز؟',
      answer: 'تتم معالجة المدفوعات عادة خلال 24-48 ساعة بعد السحب. يعتمد الوقت الفعلي على ظروف شبكة البلوكشين ومتطلبات التأكيد.',
    },
    {
      question: 'هل هذا قانوني في بلدي؟',
      answer: 'تقع على عاتقك مسؤولية التأكد من أن المشاركة في اليانصيب عبر الإنترنت قانونية في منطقتك. نوصي بمراجعة القوانين المحلية قبل المشاركة.',
    },
  ] : [
    {
      question: 'How does the lottery work?',
      answer: 'Players purchase tickets using cryptocurrency. When the draw time arrives, a winner is selected using our provably fair algorithm that combines server seeds with blockchain data. The winner receives the prize pool minus a small platform fee.',
    },
    {
      question: 'What cryptocurrencies do you accept?',
      answer: 'We currently accept Bitcoin (BTC), Ethereum (ETH), and USDC through Coinbase Commerce. More payment options will be added soon.',
    },
    {
      question: 'How are winners selected?',
      answer: 'Winners are selected using a provably fair algorithm that combines a pre-committed server seed with the latest Bitcoin block hash. This ensures the result is random and cannot be manipulated.',
    },
    {
      question: 'How long does it take to receive winnings?',
      answer: 'Payouts are typically processed within 24-48 hours after the draw. The actual time depends on blockchain network conditions and confirmation requirements.',
    },
    {
      question: 'Is this legal in my country?',
      answer: 'It is your responsibility to ensure that participating in online lotteries is legal in your jurisdiction. We recommend checking your local laws before participating.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isArabic 
            ? 'اعثر على إجابات للأسئلة الشائعة حول يانصيب LOTR'
            : 'Find answers to common questions about LOTR lottery'}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="cursor-pointer" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{faq.question}</span>
                <span className="text-2xl">{openIndex === index ? '−' : '+'}</span>
              </CardTitle>
            </CardHeader>
            {openIndex === index && (
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>
            {isArabic ? 'لا زلت لديك أسئلة؟' : 'Still have questions?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isArabic
              ? 'إذا لم تتمكن من العثور على الإجابة التي تبحث عنها، يرجى الاتصال بفريق الدعم على support@lotr.example'
              : "If you couldn't find the answer you're looking for, please contact our support team at support@lotr.example"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}