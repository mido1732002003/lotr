import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';
import { sessionOptions, type LotrSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const res = new Response();
  const session = await getIronSession<LotrSession>(req, res, sessionOptions);
  const user = session.user ?? null;
  const response = NextResponse.json({ user });
  // We don't need to attach headers here since no mutations were performed,
  // but keeping consistency is fine:
  res.headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}