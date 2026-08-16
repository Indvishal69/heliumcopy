export const INITIAL_MONITORS = [
  {
    id: 'primary-aternos-bot',
    name: 'Aternos 24/7 Hosting Bot (Render)',
    url: 'https://aternos24-7-hostingbot-rzpc.onrender.com/',
    method: 'GET',
    interval: 1000, // 1 second
    timeout: 10000,
    isActive: true,
    expectedStatus: 200,
    headers: {
      'User-Agent': 'UptimeBot-24-7-KeepAlive/2.0 (Render Sleep-Preventer)'
    },
    // Stats tracking
    stats: {
      status: 'pending', // 'online' | 'offline' | 'pending' | 'waking'
      lastPing: null,
      lastStatusCode: null,
      lastStatusText: '',
      lastLatency: null,
      avgLatency: 0,
      minLatency: null,
      maxLatency: null,
      totalPings: 0,
      successPings: 0,
      failedPings: 0,
      uptimePercentage: 100,
      history: [] // Array of { timestamp, latency, status, success }
    }
  }
];

export const STORAGE_KEY_MONITORS = 'uptime_shield_monitors_v2';
export const STORAGE_KEY_SETTINGS = 'uptime_shield_settings_v2';
