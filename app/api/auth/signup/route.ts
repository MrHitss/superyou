import { NextResponse } from 'next/server';

/**
 * Legacy signup (Prisma) disabled. Registration uses the SuperYou BE flow:
 * /signup → email → username (superyou.bio/…) → OTP → POST BE /auth/register
 */
export async function POST() {
  return NextResponse.json(
    { message: 'Use the in-app signup flow (email → username → OTP).' },
    { status: 410 },
  );
}
