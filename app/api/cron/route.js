import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Max serverless function duration

const DEFAULT_TARGETS = [
  'https://aternos24-7-hostingbot-rzpc.onrender.com/'
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Optional security check if CRON_SECRET is set
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If not matching, we still allow keep-alive unless explicitly restricted
  }

  const customUrl = searchParams.get('url');
  const urlsToPing = customUrl ? [customUrl] : DEFAULT_TARGETS;

  const results = await Promise.all(
    urlsToPing.map(async (targetUrl) => {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Vercel-Cron-KeepAlive/2.0 (+https://vercel.com)',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
          cache: 'no-store'
        });

        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        return {
          url: targetUrl,
          status: res.status,
          statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
          latency,
          success: res.ok,
          timestamp: new Date().toISOString()
        };
      } catch (err) {
        return {
          url: targetUrl,
          status: 0,
          statusText: err.name === 'AbortError' ? 'Timeout' : 'Connection Error',
          latency: Date.now() - startTime,
          success: false,
          error: err.message,
          timestamp: new Date().toISOString()
        };
      }
    })
  );

  const allSuccess = results.every(r => r.success);

  return NextResponse.json({
    message: 'Cron Keep-Alive Pings Completed',
    triggeredAt: new Date().toISOString(),
    totalTargets: results.length,
    successfulPings: results.filter(r => r.success).length,
    results,
    status: allSuccess ? 'healthy' : 'degraded'
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
