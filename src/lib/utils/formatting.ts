import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, formatRelative } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Handle crypto currencies
  const cryptoCurrencies = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'MATIC'];
  
  if (cryptoCurrencies.includes(currency)) {
    const decimals = ['BTC', 'ETH'].includes(currency) ? 8 : 2;
    return `${amount.toFixed(decimals)} ${currency}`;
  }
  
  // Handle fiat currencies
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unknown currencies
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatCrypto(amount: number, symbol: string): string {
  return `${amount.toFixed(8)} ${symbol}`;
}

export function formatDate(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = locale === 'ar' ? ar : enUS;
  return format(dateObj, 'PPP', { locale: dateLocale });
}

export function formatDateTime(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = locale === 'ar' ? ar : enUS;
  return format(dateObj, 'PPpp', { locale: dateLocale });
}

export function formatRelativeTime(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = locale === 'ar' ? ar : enUS;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: dateLocale });
}

export function truncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function generateRandomId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}