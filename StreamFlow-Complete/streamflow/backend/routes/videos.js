// backend/routes/videos.js
// Full CRUD: GET (list), GET (single), POST (create), PUT (update), DELETE (soft-delete)

const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const s3      = require('../config/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }     = require('@aws-sdk/s3-request-presigner');

const BUCKET = process.env.S3_BUCKET_NAME;

// ── GET /api/videos  →  list all active videos ───────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, title, description, genre, year, episodes, emoji, color FROM videos WHERE active=1 ORDER BY created_at DESC'
    );
    res.json({ videos: rows });
  } catch (err) {
    console.error('GET /videos error:', err.message);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// ── GET /api/videos/:id  →  single video + signed S3 stream URL ──────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM videos WHERE id=? AND active=1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Video not found' });

    const video = rows[0];
    // Generate a pre-signed URL valid for 1 hour so browser can stream from S3
    const command   = new GetObjectCommand({ Bucket: BUCKET, Key: video.s3_key });
    const streamUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ video: { ...video, streamUrl } });
  } catch (err) {
    console.error('GET /videos/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// ── POST /api/videos  →  create new video record ─────────────────────────
// Body: { title, description, genre, year, episodes, emoji, color, s3_key }
router.post('/', async (req, res) => {
  const { title, description, genre, year, episodes, emoji, color, s3_key } = req.body;
  if (!title || !s3_key) return res.status(400).json({ error: 'title and s3_key are required' });
  try {
    const [result] = await db.execute(
      'INSERT INTO videos (title, description, genre, year, episodes, emoji, color, s3_key) VALUES (?,?,?,?,?,?,?,?)',
      [title, description || null, genre || null, year || null, episodes || 1, emoji || '🎬', color || '#1a1a2e', s3_key]
    );
    res.status(201).json({ message: 'Video created', id: result.insertId });
  } catch (err) {
    console.error('POST /videos error:', err.message);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// ── PUT /api/videos/:id  →  update video metadata ────────────────────────
// Body: any of { title, description, genre, year, episodes }
router.put('/:id', async (req, res) => {
  const { title, description, genre, year, episodes } = req.body;
  try {
    await db.execute(
      'UPDATE videos SET title=COALESCE(?,title), description=COALESCE(?,description), genre=COALESCE(?,genre), year=COALESCE(?,year), episodes=COALESCE(?,episodes), updated_at=NOW() WHERE id=?',
      [title || null, description || null, genre || null, year || null, episodes || null, req.params.id]
    );
    res.json({ message: 'Video updated' });
  } catch (err) {
    console.error('PUT /videos/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// ── DELETE /api/videos/:id  →  soft delete (active=0) ────────────────────
// Soft delete keeps the record in DB — just hides it from users.
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('UPDATE videos SET active=0, updated_at=NOW() WHERE id=?', [req.params.id]);
    res.json({ message: 'Video removed' });
  } catch (err) {
    console.error('DELETE /videos/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router;
