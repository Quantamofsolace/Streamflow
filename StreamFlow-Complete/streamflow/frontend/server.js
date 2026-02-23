// frontend/server.js
// WHY: Serves static HTML/CSS/JS files on port 3000.
// Proxies all /api/* requests to the backend (port 4000 or Internal ALB).
// This way the browser only talks to ONE server — no CORS issues.

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.FRONTEND_PORT || 3000;

// PRODUCTION CHANGE: Set BACKEND_URL env var to your Internal ALB DNS name.
// Example: http://streamflow-internal-alb-xxxx.us-east-1.elb.amazonaws.com
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// Serve everything in /public as static files.
// So frontend/public/index.html → served at http://yourserver/
app.use(express.static(path.join(__dirname, 'public')));

// Proxy: any /api/... request is forwarded to the backend server.
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[Proxy Error]', err.message);
      res.status(502).json({ error: 'Backend unavailable' });
    }
  }
}));

// Health check endpoint — ALB uses this to know if the server is healthy.
// If /health returns non-200, ALB stops sending traffic here.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'frontend', port: PORT });
});

app.listen(PORT, () => {
  console.log(`[StreamFlow Frontend] Running on port ${PORT}`);
  console.log(`[StreamFlow Frontend] Proxying /api to ${BACKEND_URL}`);
});
