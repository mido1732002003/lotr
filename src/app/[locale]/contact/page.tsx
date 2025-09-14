'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">
              {isArabic ? 'شكراً لك!' : 'Thank You!'}
            </h2>
            <p className="text-gray-600">
              {isArabic 
                ? 'تم استلام رسالتك. سنرد عليك خلال 24-48 ساعة.'
                : "Your message has been received. We'll get back to you within 24-48 hours."}
            </p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
              }}
            >
              {isArabic ? 'إرسال رسالة أخرى' : 'Send Another Message'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'اتصل بنا' : 'Contact Us'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isArabic 
            ? 'لديك أسئلة أو تحتاج إلى مساعدة؟ نحن هنا للمساعدة!'
            : "Have questions or need assistance? We're here to help!"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'أرسل لنا رسالة' : 'Send us a message'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">
                {isArabic ? 'الاسم' : 'Name'}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">
                {isArabic ? 'الموضوع' : 'Subject'}
              </Label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">
                  {isArabic ? 'اختر موضوعاً' : 'Select a subject'}
                </option>
                <option value="general">
                  {isArabic ? 'استفسار عام' : 'General Inquiry'}
                </option>
                <option value="technical">
                  {isArabic ? 'دعم تقني' : 'Technical Support'}
                </option>
                <option value="payment">
                  {isArabic ? 'مشكلة في الدفع' : 'Payment Issue'}
                </option>
                <option value="payout">
                  {isArabic ? 'سؤال عن الجوائز' : 'Payout Question'}
                </option>
                <option value="other">
                  {isArabic ? 'أخرى' : 'Other'}
                </option>
              </select>
            </div>

            <div>
              <Label htmlFor="message">
                {isArabic ? 'الرسالة' : 'Message'}
              </Label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting 
                ? (isArabic ? 'جاري الإرسال...' : 'Sending...') 
                : (isArabic ? 'إرسال الرسالة' : 'Send Message')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? 'الدعم عبر البريد الإلكتروني' : 'Email Support'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">support@lotr.example</p>
            <p className="text-sm text-gray-500 mt-2">
              {isArabic ? 'الرد خلال 24-48 ساعة' : 'Response within 24-48 hours'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? 'المجتمع' : 'Community'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {isArabic 
                ? 'انضم إلى Discord للحصول على مساعدة فورية'
                : 'Join our Discord for real-time help'}
            </p>
            <p className="text-sm text-gray-500 mt-2">discord.gg/lotr-lottery</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}