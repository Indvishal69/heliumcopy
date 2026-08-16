'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Activity, Radio, BarChart3, Clock, Zap, RefreshCw } from 'lucide-react';

export default function RealtimeLatencyChart({
  history = [],
  selectedMonitor,
  onUpdateInterval,
  onForcePing,
  isPinging = false
}) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const monitor = selectedMonitor || {};
  const currentInterval = monitor.interval || 1000;

  // Render responsive smooth canvas graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling with devicePixelRatio for crisp retina rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 30, bottom: 25, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // If no history yet, draw placeholder grid
    const points = history.slice(-40); // last 40 pings

    // Determine Y-axis max (at least 200ms, or max point + 20%)
    let maxLatency = 200;
    points.forEach(p => {
      if (p.latency && p.latency > maxLatency) maxLatency = p.latency;
    });
    maxLatency = Math.ceil((maxLatency * 1.25) / 50) * 50;

    // Draw horizontal grid lines & Y labels
    const gridLines = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const yVal = (maxLatency / gridLines) * i;
      const yPos = padding.top + chartHeight - (i / gridLines) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillText(`${Math.round(yVal)}ms`, padding.left - 8, yPos + 3);
    }

    if (points.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.font = '13px sans-serif';
      ctx.fillText('Waiting for first keep-alive ping response...', width / 2, height / 2);
      return;
    }

    // Coordinates calculation
    const coords = points.map((p, idx) => {
      const x = padding.left + (idx / Math.max(points.length - 1, 1)) * chartWidth;
      const lat = p.latency || 0;
      const clampedLat = Math.min(lat, maxLatency);
      const y = padding.top + chartHeight - (clampedLat / maxLatency) * chartHeight;
      return { x, y, ...p };
    });

    // Draw Gradient Area under the curve
    if (coords.length > 1) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      ctx.moveTo(coords[0].x, height - padding.bottom);
      coords.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(coords[coords.length - 1].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Main Line Path
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        // Smooth bezier curve or line
        const xc = (coords[i].x + coords[i - 1].x) / 2;
        const yc = (coords[i].y + coords[i - 1].y) / 2;
        ctx.quadraticCurveTo(coords[i - 1].x, coords[i - 1].y, xc, yc);
      }
      ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Draw individual nodes / dots
    coords.forEach((pt, i) => {
      const isLast = i === coords.length - 1;
      const isError = !pt.success || (pt.status >= 400 || pt.status === 0);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isLast ? 5 : 3, 0, Math.PI * 2);
      
      if (isError) {
        ctx.fillStyle = '#f43f5e';
      } else if (pt.latency > 600) {
        ctx.fillStyle = '#f59e0b';
      } else {
        ctx.fillStyle = '#10b981';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#0a0d14';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing outer ring for the latest active ping
      if (isLast) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

  }, [history]);

  const intervals = [
    { label: '1s (Hyper)', value: 1000, desc: 'Best for Aternos & Render 24/7' },
    { label: '2s', value: 2000, desc: 'Ultra Fast' },
    { label: '5s', value: 5000, desc: 'Fast' },
    { label: '10s', value: 10000, desc: 'Standard Keep-Alive' },
    { label: '30s', value: 30000, desc: 'Balanced' },
    { label: '60s', value: 60000, desc: 'Low Overhead' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-dark-border/80 relative">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-dark-border/60">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Live Latency Pulse & Oscilloscope</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                REAL-TIME (Last 40 Pings)
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Visual response waveform monitoring Render cold starts, latency spikes, and uptime health
            </p>
          </div>
        </div>

        {/* Force Ping & Interval Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onForcePing(monitor.id)}
            disabled={isPinging}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all disabled:opacity-50"
            title="Send an immediate single ping request right now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Ping Now</span>
          </button>
        </div>
      </div>

      {/* Interval Selector Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-dark-bg/60 p-1.5 rounded-xl border border-dark-border/60">
        <span className="text-[11px] font-semibold text-gray-400 px-2 flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-400" /> Ping Speed:
        </span>
        {intervals.map((item) => {
          const isSelected = currentInterval === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onUpdateInterval(monitor.id, item.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-dark-bg font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-card'
              }`}
              title={item.desc}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Canvas Waveform Container */}
      <div className="relative w-full h-56 rounded-xl bg-dark-bg/90 border border-dark-border/60 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Live indicator overlay */}
        <div className="absolute top-2.5 right-3 flex items-center space-x-2 bg-dark-card/90 px-2.5 py-1 rounded-md border border-dark-border/80 text-[11px] font-mono text-gray-300 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Target: {monitor.stats?.lastLatency !== null && monitor.stats?.lastLatency !== undefined ? `${monitor.stats.lastLatency}ms` : 'Waiting'}</span>
        </div>
      </div>

      {/* Latency Legend / Guide */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>&lt; 300ms (Excellent)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>300ms - 800ms (Normal)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>&gt; 800ms (Waking/Cold Start)</span>
          </span>
        </div>

        <div className="text-[11px] text-gray-500 font-mono">
          Anti-Sleep Heartbeat Active • Web Worker Engine
        </div>
      </div>

    </div>
  );
}
