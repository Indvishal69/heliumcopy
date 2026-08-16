# 🛡️ Uptime Shield — 24/7 Anti-Sleep & Keep-Alive Bot

> **High-Frequency 1-Second Keep-Alive Robot & Uptime Monitor** designed specifically to prevent Render, Aternos, Heroku, and Cloud Web Services from entering sleep mode / cold spin-down.

🎯 **Primary Pre-configured Target:** `https://aternos24-7-hostingbot-rzpc.onrender.com/`

---

## ⚡ Features (मुख्य विशेषताएं)

- ⏱️ **1-Second High-Frequency Pinger:** Web Worker-powered engine that runs continuous 1000ms pings with zero browser background throttling.
- 🚀 **Super Wake-Up Burst:** Sends 10x parallel requests to immediately shock sleeping Render dynos back to life.
- 📊 **Real-time Latency Oscilloscope:** Live canvas waveform showing millisecond response times, cold start detections, and HTTP status codes.
- 💻 **Live Hacker Log Terminal:** Real-time event feed with HTTP status badges, search/filters, JSON export, and auto-scroll.
- 🔊 **Web Audio Synthesizer:** Built-in sci-fi audio beeps and alerts on site status change without external audio files.
- 🔒 **Screen Wake Lock Support:** Prevents browser device/screen sleep when left open on desktop or mobile.
- 🌐 **Multi-Monitor Management:** Add, pause, resume, and customize intervals for multiple websites, Discord bots, and APIs.
- ☁️ **Vercel & Multi-Cloud Ready:** Pre-configured with `vercel.json` Cron Jobs, GitHub Actions 24/7 workflow, and standalone Node.js worker.

---

## 🚀 Vercel Deployment Guide (Vercel pe upload karne ka tarika)

### Step 1: Push Repository to GitHub
Ye repository already ready hai. Isko apne GitHub account me push karein:
```bash
git push origin main
```

### Step 2: Import into Vercel
1. [vercel.com/new](https://vercel.com/new) par jayein.
2. Apna GitHub repository (`heliumcopy` ya custom name) select karein.
3. Framework **Next.js** automatic select hoga.
4. **Deploy** button par click karein!

### Step 3: 24/7 Automatic Keep-Alive
- **Vercel Cron Jobs:** Repository me `vercel.json` included hai jo automatically har minute `/api/cron` ko trigger karke aapke Render bot ko ping karta rahega.
- **Web Dashboard:** Browser tab open rakhne par Web Worker engine **har 1 second** me live ping karega.
- **GitHub Actions:** Repo ke `.github/workflows/uptime-pinger.yml` me automatic 24/7 free background pinger included hai.

---

## 🖥️ Local & Background Worker Usage (Terminal / VPS / Render)

Agar aapko terminal me ya kisi dedicated server par 24/7 chalana hai:

```bash
# 1. Dependencies install karein
npm install

# 2. Web Dashboard start karein (Local Dev Server)
npm run dev

# 3. Ya Dedicated 24/7 1-Second Background Worker chalayein
npm run worker
```

### Custom Environment Variables (Optional)
```bash
TARGET_URL="https://aternos24-7-hostingbot-rzpc.onrender.com/"
PING_INTERVAL_MS=1000 # 1 second
PING_TIMEOUT_MS=10000
```

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       └── uptime-pinger.yml     # 24/7 Free GitHub Actions Keep-Alive
├── app/
│   ├── api/
│   │   ├── ping/route.js         # Realtime Proxy & Diagnostic Ping API
│   │   ├── cron/route.js         # Vercel Cron Job Keep-Alive
│   │   └── health/route.js       # Health check endpoint
│   ├── globals.css               # Cyberpunk styling & glassmorphism
│   ├── layout.js                 # Root layout & dark theme
│   └── page.js                   # Main Dashboard App
├── components/
│   ├── Header.js                 # Brand, Master controls & Audio toggle
│   ├── StatsOverview.js          # Live metrics, latency & uptime %
│   ├── RealtimeLatencyChart.js   # Canvas real-time response waveform
│   ├── MonitorCard.js            # Individual target monitor card
│   ├── LiveLogTerminal.js        # Terminal log stream with search & filters
│   ├── WakeBurstModal.js         # 10x Super Wake Burst executor
│   ├── AddMonitorModal.js        # Add custom URLs & APIs modal
│   └── DeploymentGuide.js        # Built-in Hindi/English deployment docs
├── lib/
│   ├── defaultMonitors.js        # Default config with Render URL
│   └── soundEffects.js           # Web Audio API sound synthesizer
├── public/
│   ├── favicon.svg               # App icon
│   └── ping-worker.js            # Unthrottled background Web Worker
├── Dockerfile                    # Docker container build
├── render.yaml                   # 1-Click Render Deploy blueprint
├── vercel.json                   # Vercel Serverless & Cron Config
├── worker.js                     # Standalone 24/7 Continuous Node Worker
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) & React 18
- **Styling:** Tailwind CSS with Custom Cyber Dark Theme
- **Icons:** Lucide React
- **Audio:** Native Web Audio API Synthesizer
- **Background Sync:** Web Workers API + Vercel Cron + GitHub Actions
- **Effects:** Canvas Confetti

---

## 📄 License
MIT © Indvishal69
