import { NextResponse } from 'next/server';

/** User management is handled by SuperYou BE. */
export async function GET() {
  return NextResponse.json(
    { message: 'User management is handled by the backend.' },
    { status: 501 },
  );
}
export async function POST() {
  return NextResponse.json(
    { message: 'User management is handled by the backend.' },
    { status: 501 },
  );
}
