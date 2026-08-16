'use client';

import React, { useState } from 'react';
import { Zap, X, CheckCircle2, AlertCircle, RefreshCw, Flame, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WakeBurstModal({
  isOpen,
  onClose,
  targetMonitor,
  onBurstComplete
}) {
  const [inProgress, setInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [wakeSuccess, setWakeSuccess] = useState(null);

  if (!isOpen) return null;

  const url = targetMonitor?.url || 'https://aternos24-7-hostingbot-rzpc.onrender.com/';
  const burstCount = 10;

  const runBurst = async () => {
    setInProgress(true);
    setProgress(0);
    setResults([]);
    setWakeSuccess(null);

    const burstResults = [];

    // Send requests with small staggered delays to trigger Render wake-up
    for (let i = 1; i <= burstCount; i++) {
      const p = (i / burstCount) * 100;
      setProgress(p);

      try {
        const res = await fetch('/api/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            method: 'GET',
            timeout: 15000
          })
        });
        const data = await res.json();
        burstResults.push(data);
        setResults([...burstResults]);

        if (data.success && !wakeSuccess) {
          setWakeSuccess(true);
        }
      } catch (err) {
        burstResults.push({
          success: false,
          status: 0,
          statusText: 'Failed',
          latency: 0,
          error: err.message
        });
        setResults([...burstResults]);
      }

      // Small pause between burst bursts
      await new Promise(r => setTimeout(r, 200));
    }

    setInProgress(false);
    const anySuccess = burstResults.some(r => r.success);
    setWakeSuccess(anySuccess);

    if (anySuccess) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}
    }

    if (onBurstComplete) {
      onBurstComplete(burstResults);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/10 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-dark-bg/80 border border-dark-border"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Super Wake-Up Burst</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                10x Pulse
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Immediately triggers sleeping Render container into active running state
            </p>
          </div>
        </div>

        {/* Target Info */}
        <div className="bg-dark-bg/80 p-3 rounded-xl border border-dark-border/80 mb-4 font-mono text-xs text-gray-300">
          <div className="text-gray-500 text-[10px] uppercase mb-1">Target URL</div>
          <div className="text-cyan-300 truncate font-semibold">{url}</div>
        </div>

        {/* Progress Bar */}
        {inProgress && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>Transmitting 10 High-Power Pings...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-dark-bg h-2.5 rounded-full overflow-hidden border border-dark-border">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Stream */}
        {results.length > 0 && (
          <div className="max-h-48 overflow-y-auto bg-dark-bg/90 p-3 rounded-xl border border-dark-border/80 font-mono text-[11px] space-y-1 mb-4">
            {results.map((res, i) => (
              <div key={i} className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5">
                  {res.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>Ping #{i + 1}: {res.status || 'ERR'} {res.statusText || ''}</span>
                </span>
                <span className="font-bold text-gray-400">+{res.latency || 0}ms</span>
              </div>
            ))}
          </div>
        )}

        {/* Status result summary */}
        {wakeSuccess !== null && !inProgress && (
          <div className={`p-3 rounded-xl border text-xs font-semibold mb-4 flex items-center gap-2 ${
            wakeSuccess 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {wakeSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Render Bot is AWAKE & Responding! Keep-Alive heartbeat resumed.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Service might still be spinning up from cold sleep. Please wait 15s and retry.</span>
              </>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-card border border-dark-border text-gray-300 hover:text-white transition-all"
          >
            Close
          </button>

          <button
            onClick={runBurst}
            disabled={inProgress}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${inProgress ? 'animate-spin' : ''}`} />
            <span>{inProgress ? 'Bursting (10x)...' : 'Fire 10x Wake Burst'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
