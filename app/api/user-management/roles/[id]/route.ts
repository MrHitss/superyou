import { NextResponse } from 'next/server';

/** Roles are handled by SuperYou BE. */
export async function GET() {
  return NextResponse.json(
    { message: 'Roles are handled by the backend.' },
    { status: 501 },
  );
}
export async function PUT() {
  return NextResponse.json(
    { message: 'Roles are handled by the backend.' },
    { status: 501 },
  );
}
export async function DELETE() {
  return NextResponse.json(
    { message: 'Roles are handled by the backend.' },
    { status: 501 },
  );
}
