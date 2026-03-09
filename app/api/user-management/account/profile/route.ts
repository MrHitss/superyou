import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const BE_BASE = process.env.NEXT_PUBLIC_SUPERYOU_API_BASE?.replace(/\/$/, '');

/** Update profile (e.g. profile_link). Persists to SuperYou BE when configured. */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const profile_link = typeof body.profile_link === 'string' ? body.profile_link.trim().toLowerCase() : undefined;
    if (profile_link === undefined) {
      return NextResponse.json({ message: 'profile_link is required' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(profile_link)) {
      return NextResponse.json(
        { message: 'Profile link can only contain letters, numbers, underscores and hyphens.' },
        { status: 400 },
      );
    }
    if (BE_BASE && session.beeToken) {
      const res = await fetch(`${BE_BASE}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${session.beeToken}`,
        },
        body: JSON.stringify({ profile_link }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { message: (err as { message?: string }).message ?? 'Failed to update profile' },
          { status: res.status },
        );
      }
    }
    return NextResponse.json({ profile_link });
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

/** Profile updates (legacy). */
export async function POST() {
  return NextResponse.json(
    { message: 'Profile updates are handled by the backend.' },
    { status: 501 },
  );
}
