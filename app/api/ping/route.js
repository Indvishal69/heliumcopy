import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 15; // Vercel serverless max execution

export async function POST(request) {
  const startTime = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const targetUrl = body.url || 'https://aternos24-7-hostingbot-rzpc.onrender.com/';
    const method = (body.method || 'GET').toUpperCase();
    const timeout = Number(body.timeout) || 10000;
    const customHeaders = body.headers || {};

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return NextResponse.json({
        success: false,
        url: targetUrl,
        status: 400,
        statusText: 'Invalid URL',
        latency: 0,
        timestamp: new Date().toISOString(),
        error: 'URL must start with http:// or https://'
      }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers = {
      'User-Agent': 'UptimeBot-24-7-KeepAlive/2.0 (Render Keep-Alive Monitor; +https://vercel.com)',
      'Accept': '*/*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      ...customHeaders
    };

    let fetchResponse;
    let errorDetail = null;

    try {
      fetchResponse = await fetch(targetUrl, {
        method: method === 'HEAD' ? 'HEAD' : (method === 'POST' ? 'POST' : 'GET'),
        headers,
        signal: controller.signal,
        cache: 'no-store',
        redirect: 'follow',
        ...(method === 'POST' && body.payload ? { body: JSON.stringify(body.payload) } : {})
      });
    } catch (err) {
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      let errorMessage = err.message || 'Fetch failed';
      let isTimeout = err.name === 'AbortError';

      if (isTimeout) {
        errorMessage = `Request timed out after ${timeout}ms (Server might be waking up or offline)`;
      }

      return NextResponse.json({
        success: false,
        url: targetUrl,
        status: isTimeout ? 408 : 0,
        statusText: isTimeout ? 'Request Timeout' : 'Connection Error',
        latency,
        timestamp: new Date().toISOString(),
        error: errorMessage,
        isSleepDetected: isTimeout || latency > 4000,
      });
    }

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    const status = fetchResponse.status;
    const statusText = fetchResponse.statusText || (status >= 200 && status < 300 ? 'OK' : 'Response Received');
    const isSuccess = status >= 200 && status < 400;

    // Extract useful headers
    const responseHeaders = {};
    fetchResponse.headers.forEach((val, key) => {
      if (['server', 'content-type', 'date', 'cf-ray', 'render-version', 'x-render-origin-server'].includes(key.toLowerCase())) {
        responseHeaders[key] = val;
      }
    });

    let preview = '';
    try {
      if (method !== 'HEAD') {
        const text = await fetchResponse.text();
        preview = text.slice(0, 300);
      }
    } catch (_) {}

    return NextResponse.json({
      success: isSuccess,
      url: targetUrl,
      status,
      statusText,
      latency,
      timestamp: new Date().toISOString(),
      headers: responseHeaders,
      preview: preview ? preview.replace(/<[^>]*>?/gm, '').trim().slice(0, 150) : '',
      isSleepDetected: latency > 3000 && status >= 200,
    });

  } catch (globalErr) {
    const latency = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      status: 500,
      statusText: 'Internal Monitor Error',
      latency,
      timestamp: new Date().toISOString(),
      error: globalErr.message || 'Unexpected server error'
    }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || 'https://aternos24-7-hostingbot-rzpc.onrender.com/';
  
  // Reuse POST logic for easy GET testing via browser / curl
  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, method: 'GET' })
  }));
}
