'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.push(`/${locale}/dashboard`);
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('login')}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('loading') : t('login')}
        </Button>
      </form>
    </div>
  );
}