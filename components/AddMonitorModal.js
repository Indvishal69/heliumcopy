'use client';

import React, { useState } from 'react';
import { Plus, X, Globe, Clock, ShieldCheck, Settings } from 'lucide-react';

export default function AddMonitorModal({
  isOpen,
  onClose,
  onAddMonitor
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [interval, setInterval] = useState(1000); // 1000ms default
  const [timeout, setTimeoutVal] = useState(10000);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter a target URL');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch (_) {
      setError('Please enter a valid URL (e.g. https://my-bot.onrender.com)');
      return;
    }

    const newMonitor = {
      id: `monitor-${Date.now()}`,
      name: name.trim() || cleanUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      url: cleanUrl,
      method,
      interval: Number(interval) || 1000,
      timeout: Number(timeoutVal) || 10000,
      isActive: true,
      headers: {
        'User-Agent': 'UptimeShield-24-7/2.0'
      },
      stats: {
        status: 'pending',
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
        history: []
      }
    };

    onAddMonitor(newMonitor);
    setName('');
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-emerald-500/30 p-6 shadow-2xl shadow-emerald-500/10 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-dark-bg/80 border border-dark-border"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add New Target Monitor</h3>
            <p className="text-xs text-gray-400">Add any Render app, Aternos bot, Discord webhook, or API</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Monitor Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Monitor Friendly Name
            </label>
            <input
              type="text"
              placeholder="e.g. My Render Discord Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 font-medium"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Website / API Target URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="https://aternos24-7-hostingbot-rzpc.onrender.com/"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 font-mono"
              />
            </div>
          </div>

          {/* Method & Frequency Row */}
          <div className="grid grid-cols-2 gap-3">
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-medium"
              >
                <option value="GET">GET (Standard)</option>
                <option value="HEAD">HEAD (Fast Ping)</option>
                <option value="POST">POST (API Trigger)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Ping Frequency
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60 font-medium"
              >
                <option value={1000}>1 sec (Render Anti-Sleep)</option>
                <option value={2000}>2 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>60 seconds</option>
              </select>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-dark-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-card border border-dark-border text-gray-300 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-dark-bg transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Monitor</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
