import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HowItWorksPage() {
  const t = await getTranslations('pages.howItWorks');

  const steps = [
    {
      number: '1',
      title: t('step1.title'),
      description: t('step1.description'),
    },
    {
      number: '2',
      title: t('step2.title'),
      description: t('step2.description'),
    },
    {
      number: '3',
      title: t('step3.title'),
      description: t('step3.description'),
    },
    {
      number: '4',
      title: t('step4.title'),
      description: t('step4.description'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600 mt-2">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6">
        {steps.map((step) => (
          <Card key={step.number}>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  {step.number}
                </span>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>{t('security.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{t('security.description')}</p>
        </CardContent>
      </Card>
    </div>
  );
}