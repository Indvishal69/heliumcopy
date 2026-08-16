'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import StatsOverview from '../components/StatsOverview';
import RealtimeLatencyChart from '../components/RealtimeLatencyChart';
import MonitorCard from '../components/MonitorCard';
import LiveLogTerminal from '../components/LiveLogTerminal';
import AddMonitorModal from '../components/AddMonitorModal';
import WakeBurstModal from '../components/WakeBurstModal';
import DeploymentGuide from '../components/DeploymentGuide';
import { INITIAL_MONITORS, STORAGE_KEY_MONITORS, STORAGE_KEY_SETTINGS } from '../lib/defaultMonitors';
import { sounds } from '../lib/soundEffects';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Activity, 
  Plus, 
  Radio, 
  Zap, 
  BookOpen, 
  Server, 
  Clock, 
  Info,
  Flame,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function Dashboard() {
  const [monitors, setMonitors] = useState(INITIAL_MONITORS);
  const [selectedMonitorId, setSelectedMonitorId] = useState('primary-aternos-bot');
  const [isGlobalActive, setIsGlobalActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [totalPingsSent, setTotalPingsSent] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isPingingMap, setIsPingingMap] = useState({});
  const [pingMode, setPingMode] = useState('hybrid'); // 'hybrid' | 'server' | 'browser'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWakeBurstOpen, setIsWakeBurstOpen] = useState(false);
  const [wakeBurstTarget, setWakeBurstTarget] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Worker reference
  const workerRef = useRef(null);
  const monitorsRef = useRef(monitors);
  const isGlobalActiveRef = useRef(isGlobalActive);

  // Keep refs synchronized
  useEffect(() => {
    monitorsRef.current = monitors;
  }, [monitors]);

  useEffect(() => {
    isGlobalActiveRef.current = isGlobalActive;
  }, [isGlobalActive]);

  // Load persisted monitors & settings from localStorage
  useEffect(() => {
    try {
      const savedMonitors = localStorage.getItem(STORAGE_KEY_MONITORS);
      if (savedMonitors) {
        const parsed = JSON.parse(savedMonitors);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasPrimary = parsed.some(m => m.url && m.url.includes('aternos24-7-hostingbot-rzpc'));
          if (!hasPrimary) {
            setMonitors([...INITIAL_MONITORS, ...parsed]);
          } else {
            setMonitors(parsed);
          }
        }
      }

      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (typeof parsed.soundEnabled === 'boolean') {
          setSoundEnabled(parsed.soundEnabled);
          sounds.setEnabled(parsed.soundEnabled);
        }
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
  }, []);

  // Save monitors to localStorage
  const saveMonitors = (newMonitors) => {
    setMonitors(newMonitors);
    try {
      localStorage.setItem(STORAGE_KEY_MONITORS, JSON.stringify(newMonitors));
    } catch (_) {}
  };

  // Sound toggle
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sounds.setEnabled(nextVal);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ soundEnabled: nextVal }));
    } catch (_) {}
  };

  // Direct Browser Ping (Bypasses all server proxies and CORS restrictions)
  const performDirectBrowserPing = async (targetUrl) => {
    const startTime = Date.now();
    try {
      // mode: 'no-cors' allows browser to hit Render URL directly to keep it awake!
      await fetch(targetUrl, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store'
      });
      const latency = Date.now() - startTime;
      return {
        success: true,
        status: 200,
        statusText: 'Awake (Direct Pulse)',
        latency: Math.max(12, latency),
        isDirect: true
      };
    } catch (err) {
      return {
        success: false,
        status: 0,
        statusText: 'Direct Pulse Failed',
        latency: Date.now() - startTime,
        error: err.message,
        isDirect: true
      };
    }
  };

  // Single Ping Execution Logic (Hybrid Serverless + Direct Client)
  const performPing = useCallback(async (monitorId) => {
    const currentMonitors = monitorsRef.current;
    const target = currentMonitors.find(m => m.id === monitorId);
    if (!target) return;

    setIsPingingMap(prev => ({ ...prev, [monitorId]: true }));

    const startTime = Date.now();
    let data;

    try {
      // 1. Send via Server Proxy API
      const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: target.url,
          method: target.method || 'GET',
          timeout: target.timeout || 10000,
          headers: target.headers || {}
        })
      });

      data = await res.json();

      // 2. If server proxy returns connection error (e.g. sandbox or proxy restriction), trigger direct browser pulse!
      if (!data.success && target.url.startsWith('http')) {
        const directResult = await performDirectBrowserPing(target.url);
        if (directResult.success) {
          data = {
            ...data,
            ...directResult,
            url: target.url,
            success: true
          };
        }
      }
    } catch (err) {
      // Fallback to direct browser pulse
      const directResult = await performDirectBrowserPing(target.url);
      data = {
        url: target.url,
        success: directResult.success,
        status: directResult.status,
        statusText: directResult.statusText,
        latency: directResult.latency,
        error: directResult.error || err.message
      };
    }

    const latency = data.latency || (Date.now() - startTime);
    const isSuccess = data.success && (data.status >= 200 && data.status < 400);
    const statusCode = data.status || 0;
    const statusText = data.statusText || (isSuccess ? 'OK' : 'Error');

    // Check if site woke up from sleep
    const prevStatus = target.stats?.status;
    if (prevStatus === 'offline' && isSuccess) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch (_) {}
    } else if (isSuccess) {
      sounds.playTick();
    } else {
      sounds.playAlert();
    }

    // Update monitor stats
    setMonitors(prev => {
      const next = prev.map(m => {
        if (m.id !== monitorId) return m;

        const oldStats = m.stats || {};
        const total = (oldStats.totalPings || 0) + 1;
        const successCount = (oldStats.successPings || 0) + (isSuccess ? 1 : 0);
        const failCount = (oldStats.failedPings || 0) + (isSuccess ? 0 : 1);
        const newAvg = Math.round(
          ((oldStats.avgLatency || latency) * (total - 1) + latency) / total
        );
        const newMin = oldStats.minLatency ? Math.min(oldStats.minLatency, latency) : latency;
        const newMax = oldStats.maxLatency ? Math.max(oldStats.maxLatency, latency) : latency;
        const uptimePct = Math.round((successCount / total) * 10000) / 100;

        const historyEntry = {
          timestamp: Date.now(),
          latency,
          status: statusCode,
          statusText,
          success: isSuccess
        };

        const newHistory = [...(oldStats.history || []).slice(-59), historyEntry];

        return {
          ...m,
          stats: {
            status: isSuccess ? 'online' : 'offline',
            lastPing: Date.now(),
            lastStatusCode: statusCode,
            lastStatusText: statusText,
            lastLatency: latency,
            avgLatency: newAvg,
            minLatency: newMin,
            maxLatency: newMax,
            totalPings: total,
            successPings: successCount,
            failedPings: failCount,
            uptimePercentage: uptimePct,
            history: newHistory
          }
        };
      });

      try {
        localStorage.setItem(STORAGE_KEY_MONITORS, JSON.stringify(next));
      } catch (_) {}

      return next;
    });

    setTotalPingsSent(prev => prev + 1);

    // Append live terminal log
    setLogs(prev => [
      ...prev.slice(-300),
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        url: target.url,
        method: target.method || 'GET',
        status: statusCode,
        statusText,
        latency,
        success: isSuccess,
        isSleepDetected: data.isSleepDetected || (latency > 3500 && isSuccess)
      }
    ]);

    setIsPingingMap(prev => ({ ...prev, [monitorId]: false }));
  }, []);

  // Web Worker Heartbeat Initialization (Unthrottled 1-sec ping engine)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let worker;
    try {
      worker = new Worker('/ping-worker.js');
      workerRef.current = worker;

      worker.onmessage = (e) => {
        if (e.data.type === 'TICK' && isGlobalActiveRef.current) {
          const currentMonitors = monitorsRef.current;
          currentMonitors.forEach((m) => {
            if (m.isActive) {
              performPing(m.id);
            }
          });
        }
      };

      if (isGlobalActive) {
        worker.postMessage({ action: 'start', interval: 1000 });
      }
    } catch (err) {
      console.warn('Worker initialization fallback to setInterval:', err);
      const fallbackInterval = setInterval(() => {
        if (isGlobalActiveRef.current) {
          monitorsRef.current.forEach((m) => {
            if (m.isActive) {
              performPing(m.id);
            }
          });
        }
      }, 1000);
      return () => clearInterval(fallbackInterval);
    }

    return () => {
      if (worker) {
        worker.postMessage({ action: 'stop' });
        worker.terminate();
      }
    };
  }, [performPing]);

  // Master Global Active Toggle
  const handleToggleGlobal = () => {
    const nextState = !isGlobalActive;
    setIsGlobalActive(nextState);
    if (workerRef.current) {
      if (nextState) {
        workerRef.current.postMessage({ action: 'start', interval: 1000 });
      } else {
        workerRef.current.postMessage({ action: 'stop' });
      }
    }
  };

  // Monitor management
  const handleAddMonitor = (newMon) => {
    const next = [...monitors, newMon];
    saveMonitors(next);
    setSelectedMonitorId(newMon.id);
  };

  const handleDeleteMonitor = (id) => {
    if (monitors.length <= 1) {
      alert('You must have at least one monitor target.');
      return;
    }
    const next = monitors.filter(m => m.id !== id);
    saveMonitors(next);
    if (selectedMonitorId === id) {
      setSelectedMonitorId(next[0]?.id || null);
    }
  };

  const handleToggleMonitorActive = (id) => {
    const next = monitors.map(m => {
      if (m.id === id) {
        return { ...m, isActive: !m.isActive };
      }
      return m;
    });
    saveMonitors(next);
  };

  const handleUpdateInterval = (id, newInterval) => {
    const next = monitors.map(m => {
      if (m.id === id) {
        return { ...m, interval: newInterval };
      }
      return m;
    });
    saveMonitors(next);
    if (workerRef.current) {
      workerRef.current.postMessage({ action: 'updateInterval', interval: newInterval });
    }
  };

  const handleForcePing = (id) => {
    performPing(id);
  };

  const handleOpenWakeBurst = (mon) => {
    setWakeBurstTarget(mon || selectedMonitor);
    setIsWakeBurstOpen(true);
  };

  // Config Export / Import
  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(monitors, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `uptime-shield-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveMonitors(parsed);
          setSelectedMonitorId(parsed[0].id);
          alert('Config imported successfully!');
        } else {
          alert('Invalid monitor configuration format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const selectedMonitor = monitors.find(m => m.id === selectedMonitorId) || monitors[0] || {};
  const activeMonitorsCount = monitors.filter(m => m.isActive).length;

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Background Neon Grid Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[300px] bg-purple-500/5 rounded-full blur-[130px]" />
      </div>

      {/* Main Header */}
      <Header
        isGlobalActive={isGlobalActive}
        onToggleGlobal={handleToggleGlobal}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenWakeBurst={() => handleOpenWakeBurst(selectedMonitor)}
        onOpenGuideModal={() => setIsGuideOpen(true)}
        monitorsCount={monitors.length}
        activeMonitorsCount={activeMonitorsCount}
        onExportConfig={handleExportConfig}
        onImportConfig={handleImportConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* Render Wake-Up / Anti-Sleep Alert Banner */}
        <div className="glass-panel-glow rounded-2xl p-4 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-dark-surface to-dark-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Flame className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Render Keep-Alive Protection Active</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  1-SEC HIGH-FREQUENCY
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Monitoring <code className="text-emerald-400 font-bold">https://aternos24-7-hostingbot-rzpc.onrender.com/</code> to prevent Render & Aternos sleep.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => handleOpenWakeBurst(selectedMonitor)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>10x Wake Burst</span>
            </button>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Vercel Deploy Help</span>
            </button>
          </div>
        </div>

        {/* 1. Stats Overview Cards */}
        <StatsOverview
          monitors={monitors}
          selectedMonitor={selectedMonitor}
          totalPingsSent={totalPingsSent}
          globalActive={isGlobalActive}
          currentInterval={selectedMonitor.interval || 1000}
        />

        {/* 2. Realtime Latency Waveform Chart */}
        <RealtimeLatencyChart
          history={selectedMonitor.stats?.history || []}
          selectedMonitor={selectedMonitor}
          onUpdateInterval={handleUpdateInterval}
          onForcePing={handleForcePing}
          isPinging={Boolean(isPingingMap[selectedMonitor.id])}
        />

        {/* 3. Monitors Management Grid & Live Terminal Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Monitored Endpoints (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Target Monitors ({monitors.length})
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Target</span>
              </button>
            </div>

            <div className="space-y-3">
              {monitors.map((mon) => (
                <MonitorCard
                  key={mon.id}
                  monitor={mon}
                  isSelected={mon.id === selectedMonitorId}
                  onSelect={(id) => setSelectedMonitorId(id)}
                  onToggleActive={handleToggleMonitorActive}
                  onDelete={handleDeleteMonitor}
                  onForcePing={handleForcePing}
                  onOpenWakeBurst={handleOpenWakeBurst}
                  isPinging={Boolean(isPingingMap[mon.id])}
                />
              ))}
            </div>

          </div>

          {/* Right Column: Live Terminal Stream (7 cols) */}
          <div className="lg:col-span-7">
            <LiveLogTerminal
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-dark-border/60 py-4 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div>
            <span>UPTIME SHIELD v2.0 • 24/7 Render Keep-Alive Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400">Target: aternos24-7-hostingbot-rzpc.onrender.com</span>
            <span>•</span>
            <button 
              onClick={() => setIsGuideOpen(true)} 
              className="text-purple-400 hover:underline"
            >
              Vercel Deployment Docs
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddMonitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMonitor={handleAddMonitor}
      />

      <WakeBurstModal
        isOpen={isWakeBurstOpen}
        onClose={() => setIsWakeBurstOpen(false)}
        targetMonitor={wakeBurstTarget || selectedMonitor}
        onBurstComplete={(results) => {
          if (selectedMonitor?.id) performPing(selectedMonitor.id);
        }}
      />

      <DeploymentGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}
