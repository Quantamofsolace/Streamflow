// backend/middleware/auth.js
// JWT middleware — attach to any route that requires a logged-in user.
// Usage: router.get('/protected', auth, (req, res) => { ... })

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'streamflow-dev-secret-change-in-prod';

function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = auth;
