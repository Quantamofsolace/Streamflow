// backend/config/db.js
// Creates a MySQL connection pool using credentials from AWS Secrets Manager.
// Pool keeps connections open — avoids reconnecting on every query.

const mysql        = require('mysql2/promise');
const { getSecret } = require('./secrets');

let pool = null;

async function getPool() {
  if (pool) return pool;

  let user, password;

  // In production: fetch credentials from Secrets Manager
  // In local dev: use env vars DB_USER / DB_PASSWORD directly
  if (process.env.DB_SECRET_NAME) {
    const raw  = await getSecret(process.env.DB_SECRET_NAME);
    const cred = JSON.parse(raw);
    user     = cred.username;
    password = cred.password;
  } else {
    user     = process.env.DB_USER     || 'root';
    password = process.env.DB_PASSWORD || '';
  }

  pool = mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    user,
    password,
    database:           process.env.DB_NAME     || 'streamflow',
    connectionLimit:    10,
    waitForConnections: true,
    queueLimit:         0,
    // Encrypt traffic to RDS in production
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com')
      ? { rejectUnauthorized: true }
      : undefined,
  });

  return pool;
}

module.exports = {
  execute: async (...args) => (await getPool()).execute(...args),
  query:   async (...args) => (await getPool()).query(...args),
};
