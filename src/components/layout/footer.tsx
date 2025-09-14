'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="border-t bg-white">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t('about.title')}</h3>
            <p className="text-sm text-gray-600">{t('about.description')}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t('links.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/terms-of-service`} className="hover:text-blue-600">
                  {t('links.terms')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy-policy`} className="hover:text-blue-600">
                  {t('links.privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/provable-fairness`} className="hover:text-blue-600">
                  {t('links.fairness')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t('support.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/faq`} className="hover:text-blue-600">
                  {t('support.faq')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-blue-600">
                  {t('support.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t('security.title')}</h3>
            <p className="text-sm text-gray-600">{t('security.description')}</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          
          {/* Admin Access Link */}
          <div className="mt-4">
            <Link 
              href={`/${locale}/admin`} 
              className="inline-flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}