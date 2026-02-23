// frontend/public/js/player.js
// Loads video metadata from API, sets up player, triggers anime drop on play.

// Emojis that fall from top to bottom when play is pressed (fires ONCE)
const DROP_EMOJIS = [
  '⚔️','🔥','💪','☠️','🍃','📓','⚗️','🎯','🗡️','🐉',
  '💀','🕵️','🌸','⚡','🌊','🎭','🦊','🐺','🌙','✨',
  '🎌','🏯','🎋','🌺','🎏','🐼','🦅','💫','🎆','🎇'
];

let dropFired = false; // ensure animation runs only once

// Read ?id= from the URL  e.g. /player.html?id=3
const params  = new URLSearchParams(window.location.search);
const videoId = params.get('id');

// ── INIT PLAYER ───────────────────────────────────────────────────────────
async function initPlayer() {
  if (!videoId) {
    document.getElementById('video-title').textContent = 'No video selected';
    return;
  }

  try {
    // GET /api/videos/:id  →  { video: { title, description, streamUrl, ... } }
    const res  = await fetch(`/api/videos/${videoId}`);
    const data = await res.json();

    if (!res.ok || !data.video) throw new Error(data.error || 'Not found');

    const v = data.video;
    document.getElementById('video-title').textContent = v.title        || 'Untitled';
    document.getElementById('video-desc').textContent  = v.description  || '';
    document.getElementById('episode-info').textContent = `Episode 1 — ${v.genre || ''} ${v.year ? '(' + v.year + ')' : ''}`;

    // Set the video source (signed S3 URL from backend)
    const srcEl = document.getElementById('video-src');
    srcEl.src   = v.streamUrl;
    document.getElementById('main-video').load(); // reload player with new src

  } catch (err) {
    console.warn('API error, loading demo video:', err.message);
    // Fallback: free public domain test video so the UI still works
    document.getElementById('video-src').src =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    document.getElementById('main-video').load();
    document.getElementById('video-title').textContent = 'Demo Episode';
    document.getElementById('video-desc').textContent  = 'Backend not connected — playing demo video';
  }
}

// ── ANIME DROP ANIMATION ──────────────────────────────────────────────────
// Called once when user first presses play.
// Spawns 30 emoji elements at random X positions with staggered delays.
// Each element falls from above the screen to below via CSS keyframe.
// Elements self-remove from the DOM after their animation ends.
function triggerAnimeDrop() {
  if (dropFired) return;
  dropFired = true;

  const container = document.getElementById('anime-drop-container');

  DROP_EMOJIS.forEach((emoji, i) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className   = 'anime-drop-item';
      el.textContent = emoji;

      // Random horizontal position between 2vw and 95vw
      el.style.left = (2 + Math.random() * 93) + 'vw';

      // Slightly vary the duration so they don't all land at the same time
      const duration = 2.2 + Math.random() * 1.6; // 2.2s – 3.8s
      el.style.setProperty('--drop-duration', duration + 's');

      // Random size variation
      el.style.fontSize = (48 + Math.random() * 40) + 'px';

      container.appendChild(el);

      // Clean up DOM after animation finishes
      el.addEventListener('animationend', () => el.remove(), { once: true });

    }, i * 120); // 120 ms stagger between each emoji
  });
}

// ── QUALITY CHANGE ────────────────────────────────────────────────────────
// Called when the quality <select> changes.
// In a real implementation you'd swap the video src to a different S3 key
// (e.g. videos/480p/ep1.mp4 vs videos/720p/ep1.mp4).
function changeQuality(quality) {
  console.log('Quality changed to:', quality);
  // TODO: fetch new signed URL for selected quality and update video src
  const video = document.getElementById('main-video');
  const currentTime = video.currentTime; // remember playhead position
  // video.src = newSignedUrl;
  // video.load();
  // video.currentTime = currentTime;
}

// ── DOWNLOAD BUTTON ───────────────────────────────────────────────────────
async function handleDownload() {
  if (!videoId) return;
  const btn = document.getElementById('download-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Preparing download…'; btn.disabled = true;

  try {
    // GET /api/download/:id  →  { downloadUrl, filename }
    const res  = await fetch(`/api/download/${videoId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');

    const a = document.createElement('a');
    a.href     = data.downloadUrl;
    a.download = data.filename || `episode_${videoId}.mp4`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch (err) {
    alert('Download error: ' + err.message);
  } finally {
    btn.innerHTML = orig; btn.disabled = false;
  }
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPlayer();

  // Trigger anime drop the first time the user presses play
  document.getElementById('main-video').addEventListener('play', () => {
    triggerAnimeDrop();
  }, { once: false }); // we use the dropFired flag internally

  // Download button
  document.getElementById('download-btn').addEventListener('click', handleDownload);
});
