import './globals.css';

export const metadata = {
  title: 'Uptime Shield - 24/7 Keep-Alive & Anti-Sleep Bot',
  description: 'High-frequency 1-second uptime monitor and Render/Aternos anti-sleep keep-alive robot with real-time latency graphs, live terminal logs, and multi-cloud deployment.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: '#0a0d14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-[#0a0d14] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
