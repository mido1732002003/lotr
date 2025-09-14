import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuditLogs } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  // Check admin auth
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('admin-auth');
  
  if (!adminAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const logs = await getAuditLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}