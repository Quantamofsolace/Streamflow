// backend/routes/download.js
// Returns a signed S3 URL with Content-Disposition: attachment
// so the browser downloads the file instead of streaming it.

const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const s3      = require('../config/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }     = require('@aws-sdk/s3-request-presigner');

const BUCKET = process.env.S3_BUCKET_NAME;

// GET /api/download/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM videos WHERE id=? AND active=1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Video not found' });

    const video    = rows[0];
    const filename = `${video.title.replace(/[^a-z0-9]/gi,'_')}.mp4`;

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key:    video.s3_key,
      // Content-Disposition: attachment → browser downloads, doesn't stream
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });

    // URL valid for 15 minutes
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // Log download event (optional: insert into downloads table)
    try {
      await db.execute(
        'INSERT INTO downloads (video_id, ip_address) VALUES (?,?)',
        [video.id, req.ip]
      );
    } catch (_) { /* non-fatal */ }

    res.json({ downloadUrl, filename });
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).json({ error: 'Failed to generate download link' });
  }
});

module.exports = router;
