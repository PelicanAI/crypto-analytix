import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'healthy',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
