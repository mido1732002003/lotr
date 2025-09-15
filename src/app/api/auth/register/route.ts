import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validation/auth.schema';
import { getIronSession } from 'iron-session/edge';
import { sessionOptions, type LotrSession } from '@/lib/auth/session';
import { withRateLimit, rateLimiters } from '@/lib/utils/rate-limit';

function attachSessionHeaders(from: Response, to: NextResponse) {
  from.headers.forEach((value, key) => to.headers.set(key, value));
}

export async function POST(req: NextRequest) {
  // Rate limit
  const limited = await withRateLimit(req, rateLimiters.auth);
  if (limited instanceof Response) return limited as NextResponse;

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, emailVerified: false, passwordHash },
      select: { id: true, email: true },
    });

    // Create session
    const res = new Response();
    const session = await getIronSession<LotrSession>(req, res, sessionOptions);
    session.user = { id: user.id, email: user.email };
    await session.save();

    const response = NextResponse.json({ success: true, user });
    attachSessionHeaders(res, response);
    return response;
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}