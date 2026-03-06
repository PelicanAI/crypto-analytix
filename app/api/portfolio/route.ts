import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function GET() {
  return NextResponse.json({ message: 'portfolio' })
}
