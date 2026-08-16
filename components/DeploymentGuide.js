'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Zap, 
  Server, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

export default function DeploymentGuide({
  isOpen,
  onClose
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('vercel'); // 'vercel' | 'github' | 'render' | 'worker'

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-2xl border border-purple-500/30 p-6 shadow-2xl shadow-purple-500/10 relative flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-dark-bg/80 border border-dark-border"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Header */}
        <div className="flex items-center space-x-3 mb-4 shrink-0">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Vercel & 24/7 Hosting Deployment Guide</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Guide (हिंदी / English)
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Complete setup guide to deploy this repo to Vercel and keep your Render bot awake 24/7
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-dark-bg/80 p-1.5 rounded-xl border border-dark-border/80 mb-4 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
              activeTab === 'vercel' 
                ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            1. Vercel Deploy (Web UI)
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
              activeTab === 'github' 
                ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            2. GitHub Actions (24/7 Free)
          </button>
          <button
            onClick={() => setActiveTab('worker')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
              activeTab === 'worker' 
                ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            3. 24/7 Node Worker
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs leading-relaxed text-gray-300">
          
          {/* TAB 1: VERCEL DEPLOYMENT */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="font-bold flex items-center gap-1.5 text-sm mb-1 text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Vercel pe upload kaise kare (Step-by-Step):</span>
                </div>
                <p className="text-xs text-emerald-300/90">
                  Ye repository 100% Vercel-ready banayi gayi hai (Next.js + Serverless API + Vercel Cron Jobs pre-configured).
                </p>
              </div>

              <div className="space-y-3">
                
                <div className="p-3 bg-dark-bg/80 rounded-xl border border-dark-border">
                  <div className="font-bold text-white mb-1">Step 1: GitHub me repository push karo</div>
                  <p className="text-gray-400 text-xs">
                    Iss repo ke saare code ko apne GitHub repository me push karein.
                  </p>
                </div>

                <div className="p-3 bg-dark-bg/80 rounded-xl border border-dark-border">
                  <div className="font-bold text-white mb-1">Step 2: Vercel.com me Import karo</div>
                  <p className="text-gray-400 text-xs mb-2">
                    1. <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-purple-400 underline">vercel.com/new</a> par jayein.<br/>
                    2. Apna GitHub repository select karke <strong>Deploy</strong> par click karein.<br/>
                    3. Framework automatically <strong>Next.js</strong> detect ho jayega. Koi setting change karne ki zaroorat nahi hai!
                  </p>
                </div>

                <div className="p-3 bg-dark-bg/80 rounded-xl border border-dark-border">
                  <div className="font-bold text-white mb-1">Step 3: Vercel Cron Automatic Keep-Alive</div>
                  <p className="text-gray-400 text-xs mb-2">
                    Isme <code>vercel.json</code> file already configured hai jo automatically <code>/api/cron</code> endpoint ko call karti hai aur website ko wake rakhti hai!
                  </p>
                  <div className="bg-dark-surface p-2.5 rounded-lg font-mono text-[11px] text-gray-300 flex justify-between items-center">
                    <span>Target: https://aternos24-7-hostingbot-rzpc.onrender.com/</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: GITHUB ACTIONS */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                <div className="font-bold flex items-center gap-1.5 text-sm mb-1 text-cyan-200">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>GitHub Actions 24/7 Free Backup Keep-Alive:</span>
                </div>
                <p className="text-xs text-cyan-300/90">
                  Humne iss repo ke andar <code>.github/workflows/uptime-pinger.yml</code> banaya hai jo GitHub ke servers par 24/7 background me run hota rahega!
                </p>
              </div>

              <div className="p-3 bg-dark-bg/80 rounded-xl border border-dark-border space-y-2">
                <div className="font-bold text-white">How it works:</div>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Agar aapka browser band bhi ho jaye, tab bhi GitHub Actions aapke Render bot ko 24/7 ping karta rahega.</li>
                  <li>GitHub Actions bilkul 100% Free hai aur GitHub account me automatic activate ho jata hai.</li>
                  <li>Aap GitHub Repo ke <strong>Actions</strong> tab me jakar live logs dekh sakte hain.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 3: 24/7 NODE WORKER */}
          {activeTab === 'worker' && (
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <div className="font-bold flex items-center gap-1.5 text-sm mb-1 text-purple-200">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Continuous 1-Second Dedicated Background Worker:</span>
                </div>
                <p className="text-xs text-purple-300/90">
                  Agar aapko bilkul 1 second bina ruke server par chalana hai, toh aap included <code>worker.js</code> ko terminal, VPS, Render Background Worker ya Railway me run kar sakte hain.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-dark-bg/80 rounded-xl border border-dark-border">
                  <div className="font-bold text-white mb-2">Terminal Command to Start Worker:</div>
                  <div className="bg-dark-surface p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 flex justify-between items-center">
                    <span>npm run worker</span>
                    <button
                      onClick={() => copyToClipboard('npm run worker', 'cmd')}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-dark-bg/80 rounded-xl border border-dark-border">
                  <div className="font-bold text-white mb-2">Target Render Bot Config:</div>
                  <div className="text-gray-400 text-xs">
                    Target URL: <code className="text-cyan-300">https://aternos24-7-hostingbot-rzpc.onrender.com/</code><br/>
                    Interval: <code className="text-purple-300">1000ms (1 second)</code>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-dark-border/80 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-gray-500">
            Aternos 24/7 Bot Keep-Alive Protection System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md shadow-purple-600/20"
          >
            Got it, Let's Monitor!
          </button>
        </div>

      </div>
    </div>
  );
}
