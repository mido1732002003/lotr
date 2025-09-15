import { getIronSession } from 'iron-session';
import type { IronSessionOptions } from 'iron-session';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type SessionUser = {
  id: string;
  email: string;
};

export type LotrSession = {
  user?: SessionUser;
};

const SESSION_PASSWORD = process.env.SESSION_SECRET;

if (!SESSION_PASSWORD || SESSION_PASSWORD.length < 32) {
  console.warn(
    'SESSION_SECRET is missing or too short. Set SESSION_SECRET with at least 32 characters.'
  );
}

export const sessionOptions: IronSessionOptions = {
  cookieName: 'lotr_session',
  password: SESSION_PASSWORD || 'development_only_password_change_me_please__________',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
};

// For API routes (App Router: Route Handlers)
export async function getSession(req: Request, res: Response) {
  return getIronSession<LotrSession>(req as any, res as any, sessionOptions);
}

// For Server Components/pages: read session (no mutation)
export async function getUserFromSession(): Promise<SessionUser | null> {
  const h = headers();
  const hObj = new Headers();
  h.forEach((value, key) => hObj.set(key, value));
  const req = new Request('https://lotr.local/session-read', { headers: hObj });
  const res = new Response();
  const session = await getIronSession<LotrSession>(req as any, res as any, sessionOptions);
  return session.user ?? null;
}

export async function requireUser(locale: string): Promise<SessionUser> {
  const user = await getUserFromSession();
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }
  return user;
}