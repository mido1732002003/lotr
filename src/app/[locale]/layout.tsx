import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, getDirection } from '@/i18n';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: 'LOTR - Decentralized Lottery',
  description: 'Fair, transparent, and provably random blockchain lottery',
  keywords: 'lottery, blockchain, crypto, provably fair, decentralized',
  openGraph: {
    title: 'LOTR - Decentralized Lottery',
    description: 'Fair, transparent, and provably random blockchain lottery',
    type: 'website',
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ 
  children, 
  params: { locale } 
}: LocaleLayoutProps) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for the locale
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to load messages for ${locale}:`, error);
    notFound();
  }

  const direction = getDirection(locale);

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className={`min-h-screen flex flex-col ${direction === 'rtl' ? 'font-arabic' : ''}`} dir={direction}>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}