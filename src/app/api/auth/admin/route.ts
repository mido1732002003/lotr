import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuditLog } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const password = formData.get('password') as string;
    
    if (!password || password !== process.env.ADMIN_PASS) {
      await createAuditLog({
        action: 'ADMIN_ACCESS',
        metadata: {
          success: false,
          reason: 'Invalid password',
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        },
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Set admin session cookie
    const cookieStore = cookies();
    cookieStore.set('admin-auth', process.env.SESSION_SECRET || 'admin-authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    await createAuditLog({
      action: 'ADMIN_ACCESS',
      metadata: {
        success: true,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });
    
    // Redirect to admin dashboard
    return NextResponse.redirect(new URL('/admin', req.url));
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}