import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validation/auth.schema';
import { getIronSession } from 'iron-session';
import { sessionOptions, type LotrSession } from '@/lib/auth/session';
import { withRateLimit, rateLimiters } from '@/lib/utils/rate-limit';

function attachSessionHeaders(from: Response, to: NextResponse) {
  from.headers.forEach((value, key) => to.headers.set(key, value));
}

export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req, rateLimiters.auth);
  if (limited instanceof Response) return limited as NextResponse;

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const res = new Response();
    const session = await getIronSession<LotrSession>(req as any, res as any, sessionOptions);
    session.user = { id: user.id, email: user.email };
    await session.save();

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
    attachSessionHeaders(res, response);
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}