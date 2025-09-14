import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale
  const locale = await requestLocale;
  
  // Validate that the incoming locale is valid
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    
    return {
      locale,
      messages,
      timeZone: 'UTC',
      now: new Date(),
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }
});

export function getDirection(locale: string) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}