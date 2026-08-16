'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Plus, 
  Zap, 
  BookOpen, 
  Download, 
  Upload, 
  ShieldCheck, 
  Radio,
  Lock,
  Unlock
} from 'lucide-react';

export default function Header({
  isGlobalActive,
  onToggleGlobal,
  soundEnabled,
  onToggleSound,
  onOpenAddModal,
  onOpenWakeBurst,
  onOpenGuideModal,
  monitorsCount,
  activeMonitorsCount,
  onExportConfig,
  onImportConfig
}) {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  let wakeLockSentinel = null;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

  const toggleWakeLock = async () => {
    if (!('wakeLock' in navigator)) {
      alert('Screen Wake Lock is not supported on this browser.');
      return;
    }
    try {
      if (!wakeLockActive) {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockSentinel.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } else {
        if (wakeLockSentinel) {
          await wakeLockSentinel.release();
          wakeLockSentinel = null;
        }
        setWakeLockActive(false);
      }
    } catch (err) {
      console.warn('WakeLock error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-dark-border/80 backdrop-blur-xl bg-dark-bg/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
                <Radio className="w-6 h-6 animate-pulse" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    UPTIME<span className="text-emerald-400">SHIELD</span>
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 tracking-wide uppercase">
                    24/7 Anti-Sleep
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span>Render & Web Keep-Alive Engine</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-emerald-400/90 font-medium">1s High-Freq Pinger</span>
                </p>
              </div>
            </div>

            {/* Mobile Master Play/Pause */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={onToggleGlobal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                  isGlobalActive 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-dark-bg shadow-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isGlobalActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isGlobalActive ? 'RUNNING' : 'PAUSED'}
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 sm:gap-3">
            
            {/* Master Start/Stop Toggle Button */}
            <button
              onClick={onToggleGlobal}
              className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md ${
                isGlobalActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-dark-bg shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                  : 'bg-dark-card hover:bg-dark-border text-amber-400 border border-amber-500/30 shadow-black/40'
              }`}
              title={isGlobalActive ? "Pause all active monitors" : "Resume all active monitors"}
            >
              {isGlobalActive ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dark-bg opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-dark-bg"></span>
                  </span>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>MONITORING ACTIVE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>RESUME PINGING</span>
                </>
              )}
            </button>

            {/* Super Wake Burst Button */}
            <button
              onClick={onOpenWakeBurst}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm hover:shadow-cyan-500/10"
              title="Send rapid 10x HTTP requests to immediately wake up sleeping servers"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span className="hidden sm:inline">Wake Burst</span>
              <span className="sm:hidden">Wake</span>
            </button>

            {/* Add Target Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm hover:shadow-emerald-500/10"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add URL</span>
            </button>

            {/* Vercel Deployment Guide */}
            <button
              onClick={onOpenGuideModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all shadow-sm"
              title="Vercel & 24/7 Hosting Setup Guide (Hindi & English)"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">Vercel Guide</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl text-xs border transition-all ${
                soundEnabled 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-dark-card border-dark-border text-gray-400 hover:text-gray-200'
              }`}
              title={soundEnabled ? "Audio alerts enabled (Click to mute)" : "Audio alerts muted (Click to enable)"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Screen Wake Lock Toggle */}
            {wakeLockSupported && (
              <button
                onClick={toggleWakeLock}
                className={`p-2 rounded-xl text-xs border transition-all ${
                  wakeLockActive
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-dark-card border-dark-border text-gray-400 hover:text-gray-200'
                }`}
                title={wakeLockActive ? "Screen Keep-Awake is ON (Screen won't sleep)" : "Enable Screen Keep-Awake"}
              >
                {wakeLockActive ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-gray-400" />}
              </button>
            )}

            {/* Backup / Export Config */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onExportConfig}
                className="p-2 rounded-xl text-xs bg-dark-card border border-dark-border text-gray-400 hover:text-gray-200 hover:bg-dark-border/50 transition-all"
                title="Export Monitors JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <label 
                className="p-2 rounded-xl text-xs bg-dark-card border border-dark-border text-gray-400 hover:text-gray-200 hover:bg-dark-border/50 cursor-pointer transition-all"
                title="Import Monitors JSON"
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={onImportConfig} 
                  className="hidden" 
                />
              </label>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
