import { NextResponse } from 'next/server';

/** Settings are handled by SuperYou BE. */
export async function GET() {
  return NextResponse.json(
    { message: 'Settings are handled by the backend.' },
    { status: 501 },
  );
}
