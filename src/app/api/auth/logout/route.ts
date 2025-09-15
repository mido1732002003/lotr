import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';
import { sessionOptions, type LotrSession } from '@/lib/auth/session';

function attachSessionHeaders(from: Response, to: NextResponse) {
  from.headers.forEach((value, key) => to.headers.set(key, value));
}

export async function POST(req: NextRequest) {
  const res = new Response();
  const session = await getIronSession<LotrSession>(req, res, sessionOptions);
  session.destroy();

  const response = NextResponse.json({ success: true });
  attachSessionHeaders(res, response);
  return response;
}