import { getIronSession } from 'iron-session/edge';
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
  // Do not throw at import time in production deploy; but log a clear message
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
  return getIronSession<LotrSession>(req, res, sessionOptions);
}

// For Server Components/pages: read session (no mutation)
// Create a synthetic Request from incoming headers to read the cookie
export async function getUserFromSession(): Promise<SessionUser | null> {
  const h = headers();
  const hObj = new Headers();
  // Copy incoming headers to the synthetic request
  h.forEach((value, key) => hObj.set(key, value));
  const req = new Request('https://lotr.local/session-read', { headers: hObj });
  const res = new Response();
  const session = await getIronSession<LotrSession>(req, res, sessionOptions);
  return session.user ?? null;
}

// Require user in a Server Component/page; redirect to login when unauthenticated
export async function requireUser(locale: string): Promise<SessionUser> {
  const user = await getUserFromSession();
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }
  return user;
}