// backend/server.js
// Main Express API server — port 4000
// Handles all business logic: videos, users, downloads

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');  // adds security HTTP headers
const morgan  = require('morgan');  // HTTP request logging

const app  = express();
const PORT = process.env.BACKEND_PORT || 4000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(helmet());                                           // security headers
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' })); // allow frontend
app.use(express.json());                                     // parse JSON bodies
app.use(morgan('combined'));                                  // log every request

// ── ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/videos',   require('./routes/videos'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/download', require('./routes/download'));

// ── HEALTH CHECK (ALB uses this) ──────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'backend' }));
app.get('/',       (req, res) => res.json({ name: 'StreamFlow API', version: '1.0.0' }));

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`[StreamFlow Backend] Running on port ${PORT}`));
module.exports = app;
