import { NextResponse } from 'next/server';

/** Password reset is handled by SuperYou BE (OTP-based auth). */
export async function POST() {
  return NextResponse.json(
    { message: 'Password reset is handled by the backend.' },
    { status: 501 },
  );
}
