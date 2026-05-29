const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Heartbeat
app.get('/api/ping', (req, res) => {
  res.json({ status: 'online', timestamp: new Date(), message: 'GisunBridge is active' });
});

// System Information Bridge (with fallback for Vercel/Cloud environments)
app.get('/api/system/stats', async (req, res) => {
  try {
    // Si can fail or return empty on some cloud providers due to restricted access
    const [cpu, mem, os] = await Promise.all([
      si.currentLoad().catch(() => ({ currentLoad: 5.0 })),
      si.mem().catch(() => ({ total: 8 * 1024 * 1024 * 1024, active: 2 * 1024 * 1024 * 1024 })),
      si.osInfo().catch(() => ({ distro: 'GisunOS Cloud' }))
    ]);

    res.json({
      cpu: (cpu.currentLoad || 0).toFixed(1),
      memory: {
        total: ((mem.total || 0) / 1024 / 1024 / 1024).toFixed(1),
        used: ((mem.active || 0) / 1024 / 1024 / 1024).toFixed(1),
        percent: mem.total ? ((mem.active / mem.total) * 100).toFixed(1) : '0'
      },
      os: os.distro || 'Cloud Node'
    });
  } catch (error) {
    console.error('[Stats Error]', error);
    res.json({
      cpu: "0.0",
      memory: { total: "8.0", used: "0.0", percent: "0.0" },
      os: "GisunOS Safe Mode"
    });
  }
});

// GisunBridge Ultra Compatibility Script Injection
const BRIDGE_SHIM = `
<script>
    console.log('[GisunBridge] Networking Ultra-Patch Active');
    const PROXY_URL = '${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bridge?url=';
    const TARGET_ORIGIN = new URL(new URLSearchParams(window.location.search).get('url')).origin;

    // Helper to catch everything that should be proxied
    const resolve = (url) => {
        if (!url) return url;
        try {
            const absolute = new URL(url, window.location.href);
            // If it's not our local server, it must be proxied
            if (absolute.origin !== window.location.origin && !absolute.href.includes('localhost:5000')) {
                return PROXY_URL + encodeURIComponent(absolute.href);
            }
            // If it's a relative URL (same origin), it should be proxied relative to the TARGET_ORIGIN
            if (absolute.origin === window.location.origin && !url.includes('api/bridge')) {
                const targetUrl = TARGET_ORIGIN + (url.startsWith('/') ? '' : '/') + url;
                return PROXY_URL + encodeURIComponent(targetUrl);
            }
        } catch(e) {}
        return url;
    };

    const originalFetch = window.fetch;
    window.fetch = async function(resource, init) {
        let url = (typeof resource === 'string') ? resource : resource.url;
        const proxiedUrl = resolve(url);
        if (proxiedUrl !== url) {
            console.log('[GisunBridge] Proxying Fetch:', url);
            return originalFetch(proxiedUrl, init);
        }
        return originalFetch(resource, init);
    };

    const originalXHR = window.XMLHttpRequest;
    function ProxiedXHR() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        xhr.open = function(method, url) {
            const proxiedUrl = resolve(url);
            if (proxiedUrl !== url) {
                console.log('[GisunBridge] Proxying XHR:', url);
                return originalOpen.apply(this, [method, proxiedUrl, ...Array.from(arguments).slice(2)]);
            }
            return originalOpen.apply(this, arguments);
        };
        return xhr;
    }
    window.XMLHttpRequest = ProxiedXHR;

    const originalSendBeacon = window.navigator.sendBeacon;
    window.navigator.sendBeacon = function(url, data) {
        return originalSendBeacon.apply(this, [resolve(url), data]);
    };

    // Deep History Shield: Neutralize History API on prototype level to prevent Cross-Origin SecurityErrors
    const noop = () => {};
    try {
        Object.defineProperty(History.prototype, 'pushState', { value: noop, writable: false });
        Object.defineProperty(History.prototype, 'replaceState', { value: noop, writable: false });
    } catch(e) { console.warn('[GisunBridge] History Prototype Shield Active'); }

    // Frame-Stealth: Spoof top/parent to bypass iframe detection
    try {
        Object.defineProperty(window, 'top', { get: () => window.self });
        Object.defineProperty(window, 'parent', { get: () => window.self });
    } catch(e) { console.warn('[GisunBridge] Stealth defined'); }

    // GisunBridge 2.0: Global Link/Navigation Hijacking
    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
            e.preventDefault();
            const targetUrl = link.href;
            console.log('[GisunBridge] Hijacking Link Navigation to:', targetUrl);
            window.location.href = PROXY_URL + encodeURIComponent(targetUrl);
        }
    }, true);
</script>
`;

// Absolute Web Proxy Bridge (Supports POST/GET/OPTIONS)
app.all('/api/bridge', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Target URL required');

  try {
    const method = req.method;
    const body = (method !== 'GET' && method !== 'HEAD') ? JSON.stringify(req.body) : undefined;

    console.log(`[Proxy] ${method}: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': new URL(targetUrl).origin + '/',
        'Origin': new URL(targetUrl).origin,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      },
      body: body,
      redirect: 'follow'
    });

    const finalUrl = response.url;
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('text/html') && !finalUrl.includes('/youtubei/')) {
        let htmlNode = await response.text();
        const finalOrigin = new URL(finalUrl).origin;
        const baseTag = `<base href="${finalOrigin}/">`;

        // Update the shim with the REAL final origin to prevent relative path breakage
        const specializedShim = BRIDGE_SHIM.replace(
          'const TARGET_ORIGIN = new URL(new URLSearchParams(window.location.search).get("url")).origin;',
          `const TARGET_ORIGIN = "${finalOrigin}";`
        );

        htmlNode = htmlNode.replace('<head>', `<head>${baseTag}${specializedShim}`);

        res.set('Content-Type', 'text/html');
        res.set('X-Frame-Options', 'ALLOWALL');
        res.set('Access-Control-Allow-Origin', '*');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('content-security-policy');
        res.removeHeader('X-Content-Security-Policy');
        return res.send(htmlNode);
    } else {
        const data = await response.arrayBuffer();
        res.set('Content-Type', contentType);
        res.set('Access-Control-Allow-Origin', '*');
        res.set('X-Frame-Options', 'ALLOWALL');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('content-security-policy');
        return res.send(Buffer.from(data));
    }
  } catch (error) {
    console.error('[Bridge Error]', error);
    res.status(500).send(`GisunBridge Error: ${error.message}`);
  }
});

// GisunTube API: High-performance YouTube results scraper (Stable bypass)
app.get('/api/youtube/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = await response.text();
    const jsonStr = html.split('var ytInitialData = ')[1]?.split(';</script>')[0] ||
                    html.split('window["ytInitialData"] = ')[1]?.split(';</script>')[0];

    if (!jsonStr) return res.json([]);

    const data = JSON.parse(jsonStr);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    const itemSection = contents?.find(c => c.itemSectionRenderer)?.itemSectionRenderer?.contents;

    if (!itemSection) return res.json([]);

    const videos = itemSection
      .filter(item => item.videoRenderer)
      .map(item => {
        const v = item.videoRenderer;
        return {
          id: v.videoId,
          title: v.title?.runs?.[0]?.text || 'No Title',
          thumbnail: v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url || '',
          author: v.ownerText?.runs?.[0]?.text || 'Unknown',
          views: v.shortViewCountText?.simpleText || v.viewCountText?.simpleText || '0 views',
          timestamp: v.publishedTimeText?.simpleText || ''
        };
      });

    res.json(videos.slice(0, 24));
  } catch (err) {
    console.error('[GisunTube Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve the React app for all other routes (client-side routing)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

if (process.versions.electron) {
  app.listen(PORT, () => {
    console.log(`\n👑 GisunBridge Absolute running inside Electron on port ${PORT}`);
  });
} else if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n👑 GisunBridge Absolute is active on port ${PORT}`);
    console.log(`⚡ Full-Duplex Proxy Active (POST/GET supported)\n`);
  });
} else {
  // When packaged, open browser automatically using platform-appropriate command
  const { exec } = require('child_process');
  app.listen(PORT, () => {
    console.log(`\n👑 GisunBridge Absolute is active on port ${PORT}`);
    console.log(`⚡ Full-Duplex Proxy Active (POST/GET supported)\n`);

    // Open browser based on platform
    let command = '';
    if (process.platform === 'win32') {
      command = `start http://localhost:${PORT}`;
    } else if (process.platform === 'darwin') {
      command = `open http://localhost:${PORT}`;
    } else {
      command = `xdg-open http://localhost:${PORT}`;
    }

    exec(command, (err) => {
      if (err) {
        console.warn('Failed to open browser automatically:', err.message);
        console.log(`Please open http://localhost:${PORT} in your browser`);
      }
    });
  });
}

// Export for Vercel
module.exports = app;