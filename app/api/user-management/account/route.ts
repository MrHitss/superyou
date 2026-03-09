import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

/** Current user from session (SuperYou BE auth; no Prisma). */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.avatar,
      status: session.user.status,
      roleId: session.user.roleId,
      role: session.user.roleName
        ? { id: session.user.roleId, name: session.user.roleName }
        : null,
      profile_link: session.user.profile_link ?? null,
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
