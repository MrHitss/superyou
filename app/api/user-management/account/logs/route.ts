import { NextResponse } from 'next/server';

/** Logs are handled by SuperYou BE. */
export async function GET() {
  return NextResponse.json(
    { message: 'Logs are handled by the backend.' },
    { status: 501 },
  );
}
