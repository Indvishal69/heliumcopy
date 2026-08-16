'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Clock, 
  TrendingUp, 
  Wifi, 
  Zap, 
  Server, 
  AlertTriangle 
} from 'lucide-react';

export default function StatsOverview({
  monitors = [],
  selectedMonitor,
  totalPingsSent = 0,
  globalActive = true,
  currentInterval = 1000
}) {
  const activeMonitors = monitors.filter(m => m.isActive);
  const target = selectedMonitor || monitors[0] || {};
  const stats = target.stats || {};

  const status = stats.status || 'pending';
  const lastLatency = stats.lastLatency !== null && stats.lastLatency !== undefined ? stats.lastLatency : '--';
  const avgLatency = stats.avgLatency ? Math.round(stats.avgLatency) : '--';
  const uptime = stats.uptimePercentage !== undefined ? stats.uptimePercentage.toFixed(1) : '100.0';
  const totalTargetPings = stats.totalPings || 0;
  const successPings = stats.successPings || 0;

  // Latency status color
  let latencyColor = 'text-emerald-400';
  let latencyBg = 'bg-emerald-500/10 border-emerald-500/20';
  let latencyLabel = 'Fast';
  if (typeof lastLatency === 'number') {
    if (lastLatency > 800) {
      latencyColor = 'text-rose-400';
      latencyBg = 'bg-rose-500/10 border-rose-500/20';
      latencyLabel = 'Slow / Cold Start';
    } else if (lastLatency > 300) {
      latencyColor = 'text-amber-400';
      latencyBg = 'bg-amber-500/10 border-amber-500/20';
      latencyLabel = 'Moderate';
    }
  }

  // Target status badge
  let statusBadge = (
    <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>ONLINE & AWAKE</span>
    </div>
  );

  if (!globalActive) {
    statusBadge = (
      <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span>PAUSED</span>
      </div>
    );
  } else if (status === 'offline' || (stats.lastStatusCode && stats.lastStatusCode >= 400)) {
    statusBadge = (
      <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
        <span>OFFLINE / SLEEPING</span>
      </div>
    );
  } else if (status === 'waking') {
    statusBadge = (
      <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-spin" />
        <span>WAKING UP SERVER...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Server Status & Target */}
      <div className="glass-panel rounded-2xl p-5 border border-dark-border/80 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Service State</span>
          </div>
          {statusBadge}
        </div>
        
        <div className="mt-2">
          <h3 className="text-lg font-bold text-white truncate" title={target.name || 'Primary Bot'}>
            {target.name || 'Aternos 24/7 Hosting Bot'}
          </h3>
          <p className="text-xs text-gray-400 truncate mt-0.5 font-mono" title={target.url}>
            {target.url || 'https://aternos24-7-hostingbot-rzpc.onrender.com/'}
          </p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-dark-border/50 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active Monitors: {activeMonitors.length} / {monitors.length}
          </span>
          <span className="text-emerald-400 font-medium">Render Sleep Shield</span>
        </div>
      </div>

      {/* Card 2: Realtime Response Time (Latency) */}
      <div className="glass-panel rounded-2xl p-5 border border-dark-border/80 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Response Time</span>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${latencyBg} ${latencyColor}`}>
            {latencyLabel}
          </span>
        </div>

        <div className="mt-2 flex items-baseline space-x-2">
          <span className={`text-3xl font-extrabold tracking-tight ${latencyColor}`}>
            {lastLatency}
          </span>
          <span className="text-sm font-semibold text-gray-400">ms</span>
        </div>

        <div className="mt-4 pt-3 border-t border-dark-border/50 flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Avg: <strong className="text-gray-200">{avgLatency} ms</strong></span>
          <span>Min: <strong className="text-emerald-400">{stats.minLatency || '--'}ms</strong></span>
          <span>Max: <strong className="text-amber-400">{stats.maxLatency || '--'}ms</strong></span>
        </div>
      </div>

      {/* Card 3: Uptime Percentage & Success Rate */}
      <div className="glass-panel rounded-2xl p-5 border border-dark-border/80 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Uptime Rate</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 24/7
          </span>
        </div>

        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {uptime}%
          </span>
          <span className="text-xs text-emerald-400/80 font-medium">Availability</span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-dark-bg/80 h-2 rounded-full mt-2 overflow-hidden border border-dark-border/60">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(0, Number(uptime)))}%` }}
          />
        </div>

        <div className="mt-3 pt-2 border-t border-dark-border/50 flex items-center justify-between text-xs text-gray-400">
          <span>Success: <strong className="text-emerald-400">{successPings}</strong></span>
          <span>Failed: <strong className="text-rose-400">{stats.failedPings || 0}</strong></span>
        </div>
      </div>

      {/* Card 4: Total Pings Sent & Frequency */}
      <div className="glass-panel rounded-2xl p-5 border border-dark-border/80 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Keep-Alive Engine</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
            {target.interval ? `${target.interval / 1000}s interval` : '1s interval'}
          </span>
        </div>

        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {totalPingsSent.toLocaleString()}
          </span>
          <span className="text-xs text-purple-400 font-semibold uppercase">Pings Sent</span>
        </div>

        <div className="mt-4 pt-3 border-t border-dark-border/50 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1 text-purple-300">
            <Wifi className="w-3.5 h-3.5 animate-pulse text-purple-400" />
            Zero-Sleep Active
          </span>
          <span className="text-gray-400 font-mono">
            HTTP {target.method || 'GET'}
          </span>
        </div>
      </div>

    </div>
  );
}
