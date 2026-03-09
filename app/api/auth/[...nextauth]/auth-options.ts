import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const BE_BASE = process.env.NEXT_PUBLIC_SUPERYOU_API_BASE?.replace(/\/$/, '');

async function loginWithGoogleIdToken(idToken: string) {
  if (!BE_BASE) return null;
  const res = await fetch(`${BE_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ id_token: idToken, provider: 'google' }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  const data = json?.data ?? json;
  return data as { user?: { uuid?: string; id?: number; email?: string; name?: string; avatar?: string }; token?: string } | undefined;
}

// JWT_SESSION_ERROR / "decryption operation failed" occurs when NEXTAUTH_SECRET changes or is
// missing — the browser cookie was encrypted with a different secret. Fix: set NEXTAUTH_SECRET
// in .env.local and sign out then sign in again to issue a new cookie.
const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        token: { label: 'Token', type: 'text' },
        email: { label: 'Email', type: 'text' },
        name: { label: 'Name', type: 'text' },
        id: { label: 'User UUID', type: 'text' },
        profile_link: { label: 'Profile link', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const token = credentials.token as string | undefined;
        const email = credentials.email as string | undefined;
        const name = (credentials.name as string | undefined) ?? 'User';
        const id = credentials.id as string | undefined;
        const profile_link = (credentials.profile_link as string | undefined)?.trim() || null;
        if (token && email) {
          return {
            id: id ?? token,
            email,
            name,
            status: 'ACTIVE',
            roleId: null,
            roleName: null,
            avatar: null,
            profile_link,
            beeToken: token,
          };
        }
        return null;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt(params) {
      const { token, user, account, session, trigger } = params;
      if (trigger === 'update' && session?.user) {
        token.id = session.user.id ?? token.id;
        token.email = session.user.email ?? token.email;
        token.name = session.user.name ?? token.name;
        token.avatar = session.user.avatar ?? token.avatar;
        token.status = session.user.status ?? token.status;
        token.roleId = session.user.roleId ?? token.roleId;
        token.roleName = session.user.roleName ?? token.roleName;
        token.profile_link = session.user.profile_link ?? token.profile_link;
        return token;
      }
      if (user) {
        token.id = (user.id ?? token.sub) as string;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.avatar = user.avatar ?? undefined;
        token.status = user.status ?? undefined;
        token.roleId = user.roleId ?? undefined;
        token.roleName = (user as User & { roleName?: string | null }).roleName ?? undefined;
        token.profile_link = (user as User & { profile_link?: string | null }).profile_link ?? undefined;
        const u = user as User & { beeToken?: string };
        if (u.beeToken) token.beeToken = u.beeToken;
      }
      const acc = account as { provider?: string; id_token?: string; access_token?: string } | null;
      const idToken = acc?.id_token ?? acc?.access_token;
      if (acc?.provider === 'google' && idToken) {
        const beData = await loginWithGoogleIdToken(idToken);
        if (beData?.user) {
          const u = beData.user as { profile_link?: string | null };
          token.id = beData.user.uuid ?? String(beData.user.id) ?? token.id;
          token.email = beData.user.email ?? token.email;
          token.name = beData.user.name ?? token.name;
          token.avatar = beData.user.avatar ?? token.avatar;
          if (u.profile_link != null) token.profile_link = u.profile_link;
          if (beData.token) token.beeToken = beData.token;
        }
      }
      if (!token.beeToken && token.id) {
        token.beeToken = token.id as string;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? '';
        session.user.email = (token.email as string) ?? '';
        session.user.name = (token.name as string) ?? '';
        session.user.avatar = token.avatar as string | null;
        session.user.status = token.status as string;
        session.user.roleId = token.roleId as string | null;
        session.user.roleName = token.roleName as string | null;
        session.user.profile_link = (token.profile_link as string | null) ?? null;
      }
      session.beeToken = (token.beeToken as string) ?? (token.id as string);
      return session;
    },
    redirect({ url, baseUrl }) {
      const path = url.startsWith('/') ? url : new URL(url).pathname;
      if (path === '/' || path === '') return `${baseUrl}/orbit`;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return url;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

export default authOptions;
