'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  const basePath =
    (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : process.env.NEXT_PUBLIC_BASE_PATH) || '';

  const mockSession: Session = session || {
    user: {
      id: 'bypass-id',
      name: 'Bypass User',
      email: 'bypass@example.com',
      avatar: '',
      status: 'active',
    },
    expires: '9999-12-31T23:59:59.999Z',
  };

  return (
    <SessionProvider session={mockSession} basePath={`${basePath}/api/auth`} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
