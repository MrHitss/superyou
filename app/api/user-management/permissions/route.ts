import { NextResponse } from 'next/server';

/** Permissions are handled by SuperYou BE. */
export async function GET() {
  return NextResponse.json(
    { message: 'Permissions are handled by the backend.' },
    { status: 501 },
  );
}
export async function POST() {
  return NextResponse.json(
    { message: 'Permissions are handled by the backend.' },
    { status: 501 },
  );
}
