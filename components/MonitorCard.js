'use client';

import React from 'react';
import { 
  Globe, 
  Play, 
  Pause, 
  Trash2, 
  ExternalLink, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  BarChart2, 
  Settings2
} from 'lucide-react';

export default function MonitorCard({
  monitor,
  isSelected,
  onSelect,
  onToggleActive,
  onDelete,
  onForcePing,
  onOpenWakeBurst,
  onOpenEdit,
  isPinging = false
}) {
  const stats = monitor.stats || {};
  const isOnline = stats.status === 'online' || (stats.lastStatusCode >= 200 && stats.lastStatusCode < 400);
  const isPending = stats.status === 'pending' || !stats.lastPing;
  const isError = !isPending && !isOnline;

  const uptime = stats.uptimePercentage !== undefined ? stats.uptimePercentage.toFixed(1) : '100.0';
  const lastPingTime = stats.lastPing ? new Date(stats.lastPing).toLocaleTimeString() : 'Never';
  const history = stats.history || [];
  const recentPings = history.slice(-16);

  return (
    <div 
      onClick={() => onSelect(monitor.id)}
      className={`glass-panel rounded-2xl p-5 border transition-all duration-200 cursor-pointer relative group ${
        isSelected 
          ? 'glass-panel-glow border-emerald-500/50 ring-1 ring-emerald-400/20' 
          : 'border-dark-border/80 hover:border-dark-border'
      }`}
    >
      
      {/* Top Bar: Name & Actions */}
      <div className="flex items-start justify-between gap-3">
        
        <div className="flex items-start space-x-3 min-w-0">
          <div className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
            !monitor.isActive 
              ? 'bg-gray-800/40 border-gray-700 text-gray-500'
              : isPending 
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                : isOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <Globe className={`w-5 h-5 ${monitor.isActive && isOnline ? 'animate-pulse' : ''}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                {monitor.name}
              </h3>
              {isSelected && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SELECTED
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <a 
                href={monitor.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-gray-400 hover:text-emerald-400 font-mono truncate flex items-center gap-1 max-w-[220px] sm:max-w-xs transition-colors"
                title={monitor.url}
              >
                <span>{monitor.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Status Pill & Toggle */}
        <div className="flex items-center space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          
          <button
            onClick={() => onToggleActive(monitor.id)}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
              monitor.isActive 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title={monitor.isActive ? "Pause monitor" : "Activate monitor"}
          >
            {monitor.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current text-emerald-400" />}
          </button>

          <button
            onClick={() => onForcePing(monitor.id)}
            disabled={isPinging}
            className="p-1.5 rounded-lg border bg-dark-card border-dark-border text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
            title="Ping Target Now"
          >
            <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={() => onOpenWakeBurst(monitor)}
            className="p-1.5 rounded-lg border bg-dark-card border-dark-border text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all"
            title="Wake Burst (Send 10 Rapid Pings)"
          >
            <Zap className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(monitor.id)}
            className="p-1.5 rounded-lg border bg-dark-card border-dark-border text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
            title="Delete Monitor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Middle Stats Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-dark-border/60 text-xs">
        
        {/* Status */}
        <div className="bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border/40">
          <span className="text-[10px] text-gray-400 block uppercase font-medium">Status</span>
          <span className="font-bold flex items-center gap-1.5 mt-0.5">
            {!monitor.isActive ? (
              <span className="text-gray-400">Paused</span>
            ) : isPending ? (
              <span className="text-cyan-400 animate-pulse">Checking...</span>
            ) : isOnline ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.lastStatusCode ? `${stats.lastStatusCode} OK` : 'Online'}
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {stats.lastStatusCode ? `Error ${stats.lastStatusCode}` : 'Offline'}
              </span>
            )}
          </span>
        </div>

        {/* Latency */}
        <div className="bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border/40">
          <span className="text-[10px] text-gray-400 block uppercase font-medium">Latency</span>
          <span className="font-mono font-bold text-gray-200 mt-0.5 block">
            {stats.lastLatency !== null && stats.lastLatency !== undefined ? `${stats.lastLatency}ms` : '--'}
          </span>
        </div>

        {/* Uptime % */}
        <div className="bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border/40">
          <span className="text-[10px] text-gray-400 block uppercase font-medium">Uptime</span>
          <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
            {uptime}%
          </span>
        </div>

        {/* Interval */}
        <div className="hidden sm:block bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border/40">
          <span className="text-[10px] text-gray-400 block uppercase font-medium">Interval</span>
          <span className="font-mono font-bold text-purple-400 mt-0.5 block">
            {monitor.interval ? `${monitor.interval / 1000}s` : '1s'}
          </span>
        </div>

      </div>

      {/* Mini Visual Ping History Bars */}
      <div className="mt-3.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-1 h-3.5 bg-dark-bg/80 p-0.5 rounded-md border border-dark-border/60 overflow-hidden">
          {recentPings.length === 0 ? (
            <span className="text-[10px] text-gray-500 font-mono px-1">Waiting for ping signals...</span>
          ) : (
            recentPings.map((p, i) => {
              const ok = p.success && (p.status >= 200 && p.status < 400);
              const isSlow = p.latency > 600;
              return (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-[2px] transition-all ${
                    !ok 
                      ? 'bg-rose-500' 
                      : isSlow 
                        ? 'bg-amber-400' 
                        : 'bg-emerald-400'
                  }`}
                  title={`[${new Date(p.timestamp).toLocaleTimeString()}] Status: ${p.status || 0} | ${p.latency}ms`}
                />
              );
            })
          )}
        </div>
        <span className="text-[10px] text-gray-500 font-mono shrink-0 pl-1">
          {stats.totalPings || 0} pings
        </span>
      </div>

    </div>
  );
}
