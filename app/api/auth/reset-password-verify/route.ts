import { NextResponse } from 'next/server';

/** Reset token verification is handled by SuperYou BE. */
export async function POST() {
  return NextResponse.json(
    { message: 'Token verification is handled by the backend.' },
    { status: 501 },
  );
}
