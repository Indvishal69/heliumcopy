/**
 * Standalone 24/7 Uptime Keep-Alive Worker
 * Runs continuously every 1 second (or custom PING_INTERVAL_MS)
 * Perfect for Render Background Worker, Railway, VPS, Docker, or local machine
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration from environment or defaults
const TARGET_URLS = (process.env.TARGET_URLS || process.env.TARGET_URL || 'https://aternos24-7-hostingbot-rzpc.onrender.com/').split(',').map(s => s.trim());
const INTERVAL_MS = parseInt(process.env.PING_INTERVAL_MS || '1000', 10);
const TIMEOUT_MS = parseInt(process.env.PING_TIMEOUT_MS || '10000', 10);

// ANSI Colors for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Agent keep-alive sockets for performance
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

let totalPings = 0;
let successPings = 0;
let failPings = 0;

console.log(`${COLORS.bright}${COLORS.cyan}====================================================${COLORS.reset}`);
console.log(`${COLORS.bright}${COLORS.green}🚀 UPTIME SHIELD - 24/7 KEEP-ALIVE BOT WORKER STARTED${COLORS.reset}`);
console.log(`${COLORS.cyan}====================================================${COLORS.reset}`);
console.log(`${COLORS.bright}Targets:${COLORS.reset}  ${TARGET_URLS.join(', ')}`);
console.log(`${COLORS.bright}Interval:${COLORS.reset} ${INTERVAL_MS}ms (High-Frequency 1-sec Keep-Alive)`);
console.log(`${COLORS.bright}Timeout:${COLORS.reset}  ${TIMEOUT_MS}ms`);
console.log(`${COLORS.cyan}----------------------------------------------------${COLORS.reset}`);

function pingUrl(targetUrl) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let urlObj;
    try {
      urlObj = new URL(targetUrl);
    } catch (e) {
      console.error(`${COLORS.red}[ERROR] Invalid URL: ${targetUrl}${COLORS.reset}`);
      return resolve({ success: false, latency: 0, status: 0, error: 'Invalid URL' });
    }

    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    const agent = isHttps ? httpsAgent : httpAgent;

    const options = {
      method: 'GET',
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + (urlObj.search || ''),
      agent,
      headers: {
        'User-Agent': 'UptimeBot-Worker-24-7/2.0 (Render Sleep-Shield; +https://render.com)',
        'Accept': '*/*',
        'Cache-Control': 'no-cache'
      },
      timeout: TIMEOUT_MS
    };

    const req = client.request(options, (res) => {
      let bodyData = '';
      res.on('data', chunk => {
        // Read minimal data to drain socket
        if (bodyData.length < 256) bodyData += chunk;
      });

      res.on('end', () => {
        const latency = Date.now() - startTime;
        const isOk = res.statusCode >= 200 && res.statusCode < 400;
        resolve({
          success: isOk,
          status: res.statusCode,
          statusText: res.statusMessage || (isOk ? 'OK' : 'Response Received'),
          latency,
          targetUrl
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const latency = Date.now() - startTime;
      resolve({
        success: false,
        status: 408,
        statusText: 'Timeout (Server Waking/Cold)',
        latency,
        targetUrl
      });
    });

    req.on('error', (err) => {
      const latency = Date.now() - startTime;
      resolve({
        success: false,
        status: 0,
        statusText: err.message || 'Connection Error',
        latency,
        targetUrl
      });
    });

    req.end();
  });
}

async function runPingCycle() {
  for (const url of TARGET_URLS) {
    totalPings++;
    const result = await pingUrl(url);

    const timeStr = new Date().toLocaleTimeString();
    if (result.success) {
      successPings++;
      const speedColor = result.latency > 600 ? COLORS.yellow : COLORS.green;
      console.log(
        `${COLORS.dim}[${timeStr}]${COLORS.reset} ` +
        `${COLORS.green}✔ ${result.status} ${result.statusText}${COLORS.reset} ` +
        `-> ${COLORS.cyan}${url}${COLORS.reset} ` +
        `(${speedColor}+${result.latency}ms${COLORS.reset}) ` +
        `${COLORS.dim}[Pings: ${totalPings} | Success: ${successPings}]${COLORS.reset}`
      );
    } else {
      failPings++;
      console.log(
        `${COLORS.dim}[${timeStr}]${COLORS.reset} ` +
        `${COLORS.red}✖ ${result.status || 'ERR'} ${result.statusText}${COLORS.reset} ` +
        `-> ${COLORS.yellow}${url}${COLORS.reset} ` +
        `(${COLORS.red}+${result.latency}ms${COLORS.reset}) ` +
        `${COLORS.dim}[Fail: ${failPings}]${COLORS.reset}`
      );
    }
  }
}

// Start continuous loop
setInterval(runPingCycle, INTERVAL_MS);
runPingCycle();

// Clean graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${COLORS.yellow}🛑 Keep-Alive Worker stopped gracefully.${COLORS.reset}`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`\n${COLORS.yellow}🛑 Keep-Alive Worker terminated.${COLORS.reset}`);
  process.exit(0);
});
