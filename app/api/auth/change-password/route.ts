import { NextResponse } from 'next/server';

/** Password change is handled by SuperYou BE. */
export async function POST() {
  return NextResponse.json(
    { message: 'Password change is handled by the backend.' },
    { status: 501 },
  );
}
