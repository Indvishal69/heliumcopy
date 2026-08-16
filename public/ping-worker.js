// Web Worker for high-precision background ping scheduling (no browser background throttling)
let intervalId = null;
let currentInterval = 1000;

self.onmessage = function (e) {
  const { action, interval } = e.data;

  if (action === 'start') {
    if (interval) {
      currentInterval = Math.max(500, interval);
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
      self.postMessage({ type: 'TICK', timestamp: Date.now() });
    }, currentInterval);
    self.postMessage({ type: 'STARTED', interval: currentInterval });
  } else if (action === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    self.postMessage({ type: 'STOPPED' });
  } else if (action === 'updateInterval') {
    currentInterval = Math.max(500, interval);
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        self.postMessage({ type: 'TICK', timestamp: Date.now() });
      }, currentInterval);
    }
  }
};
