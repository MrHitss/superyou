import { NextResponse } from 'next/server';

/** Email verification is handled by SuperYou BE. */
export async function POST() {
  return NextResponse.json(
    { message: 'Email verification is handled by the backend.' },
    { status: 501 },
  );
}
