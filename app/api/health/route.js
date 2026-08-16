import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Uptime Robot & 24/7 Keep-Alive Bot',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    uptimeSeconds: process.uptime()
  });
}
