import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type LotrSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const res = new Response();
  const session = await getIronSession<LotrSession>(req as any, res as any, sessionOptions);
  const user = session.user ?? null;
  const response = NextResponse.json({ user });
  res.headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}