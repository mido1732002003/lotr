import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPassword, generateSecureToken } from '@/lib/utils/crypto';
import { createAuditLog } from '@/lib/db/queries';

const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'change-this-password';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('admin-auth');
  
  if (!sessionCookie) {
    return false;
  }
  
  // In production, verify session token against database
  // For MVP, simple token check
  return sessionCookie.value === process.env.SESSION_SECRET;
}

export async function createAdminSession(password: string, ipAddress?: string): Promise<string | null> {
  // Verify password
  const isValid = await verifyPassword(password, await hashPassword(ADMIN_PASSWORD));
  
  if (!isValid) {
    await createAuditLog({
      action: 'ADMIN_ACCESS',
      metadata: {
        success: false,
        reason: 'Invalid password',
        ipAddress,
      },
    });
    return null;
  }
  
  // Create session token
  const sessionToken = generateSecureToken();
  
  await createAuditLog({
    action: 'ADMIN_ACCESS',
    metadata: {
      success: true,
      ipAddress,
    },
  });
  
  return sessionToken;
}

async function hashPassword(password: string): Promise<string> {
  // In production, this would be stored hashed in DB
  // For MVP, using bcrypt hash of env variable
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}