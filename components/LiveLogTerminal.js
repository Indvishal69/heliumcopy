'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  ArrowDown, 
  Filter, 
  Search, 
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wifi
} from 'lucide-react';

export default function LiveLogTerminal({
  logs = [],
  onClearLogs
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'success' | 'error'
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll when new logs arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filter === 'success' && !log.success) return false;
    if (filter === 'error' && log.success) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchUrl = log.url?.toLowerCase().includes(q);
      const matchStatus = String(log.status).includes(q);
      const matchText = log.statusText?.toLowerCase().includes(q);
      return matchUrl || matchStatus || matchText;
    }
    return true;
  });

  const copyLogs = () => {
    const text = filteredLogs.map(l => 
      `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.method || 'GET'} ${l.url} -> ${l.status || 'ERR'} ${l.statusText || ''} (${l.latency}ms)`
    ).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportLogsFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `uptime-shield-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel rounded-2xl border border-dark-border/80 overflow-hidden flex flex-col h-[480px]">
      
      {/* Terminal Title Bar */}
      <div className="bg-dark-surface/90 px-4 py-3 border-b border-dark-border/80 flex flex-wrap items-center justify-between gap-2">
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-gray-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>KEEP-ALIVE LIVE TERMINAL</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {filteredLogs.length} events
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-dark-bg/80 text-gray-200 pl-8 pr-2.5 py-1 rounded-lg border border-dark-border/80 text-xs focus:outline-none focus:border-emerald-500/50 w-28 sm:w-36 font-mono"
            />
          </div>

          {/* Filter Pill: All / Success / Errors */}
          <div className="hidden sm:flex items-center bg-dark-bg/80 p-0.5 rounded-lg border border-dark-border/80 text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${filter === 'all' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:text-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${filter === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:text-gray-200'}`}
            >
              2xx OK
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${filter === 'error' ? 'bg-rose-500/20 text-rose-300' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Errors
            </button>
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border transition-all ${
              autoScroll 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-dark-bg border-dark-border text-gray-500'
            }`}
            title={autoScroll ? "Auto-scroll ON (click to pause)" : "Auto-scroll OFF (click to enable)"}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Copy logs */}
          <button
            onClick={copyLogs}
            className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-gray-400 hover:text-gray-200 hover:border-dark-border transition-all"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Export JSON */}
          <button
            onClick={exportLogsFile}
            className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-gray-400 hover:text-gray-200 hover:border-dark-border transition-all"
            title="Download logs as JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>

      {/* Terminal Log Output Body */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 bg-[#07090f] p-4 overflow-y-auto font-mono text-xs space-y-1.5 terminal-scroll"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 py-12">
            <Wifi className="w-8 h-8 text-gray-600 animate-pulse" />
            <p className="font-medium">Keep-Alive log feed waiting for ping events...</p>
            <p className="text-[11px] text-gray-600">Pings are transmitted continuously every 1 second</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            const isOk = log.success && (log.status >= 200 && log.status < 400);
            const isTimeout = log.status === 408 || log.status === 0;

            return (
              <div 
                key={index} 
                className={`flex items-start space-x-2 py-0.5 px-2 rounded hover:bg-white/5 transition-colors leading-relaxed ${
                  !isOk ? 'bg-rose-500/5 text-rose-300' : 'text-gray-300'
                }`}
              >
                {/* Timestamp */}
                <span className="text-gray-500 select-none text-[11px] shrink-0">
                  [{timeStr}]
                </span>

                {/* HTTP Method */}
                <span className="text-cyan-400 font-bold shrink-0">
                  {log.method || 'GET'}
                </span>

                {/* Status Indicator Badge */}
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                  isOk 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {log.status || 'ERR'} {log.statusText || ''}
                </span>

                {/* URL */}
                <span className="text-gray-400 truncate max-w-xs sm:max-w-md shrink-1" title={log.url}>
                  {log.url}
                </span>

                {/* Response Time / Latency */}
                <span className={`ml-auto font-bold shrink-0 ${
                  log.latency > 800 
                    ? 'text-rose-400' 
                    : log.latency > 300 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                }`}>
                  +{log.latency}ms
                </span>

                {/* Cold start / Render sleep notification */}
                {log.isSleepDetected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    ⚡ Waking Dyno
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer */}
      <div className="bg-dark-surface/90 px-4 py-2 border-t border-dark-border/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Engine: High-Precision Web Worker Heartbeat</span>
        </div>
        <div>
          <span>Target: <span className="text-emerald-400">aternos24-7-hostingbot-rzpc.onrender.com</span></span>
        </div>
      </div>

    </div>
  );
}
