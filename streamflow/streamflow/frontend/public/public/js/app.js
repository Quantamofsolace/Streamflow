// frontend/public/js/app.js
// Fetches anime from backend API, renders the card grid.
// Falls back to local data if API is unreachable.

const ANIME_LIST = [
  { id: 1,  title: 'Attack on Titan',       genre: 'Action/Drama',   episodes: 87,   year: 2013, emoji: '⚔️',  color: '#5a0a0a' },
  { id: 2,  title: 'Demon Slayer',           genre: 'Action/Fantasy', episodes: 44,   year: 2019, emoji: '🔥',  color: '#5a1a00' },
  { id: 3,  title: 'My Hero Academia',       genre: 'Superhero',      episodes: 138,  year: 2016, emoji: '💪',  color: '#001a4a' },
  { id: 4,  title: 'One Piece',              genre: 'Adventure',      episodes: 1000, year: 1999, emoji: '☠️',  color: '#3a2a00' },
  { id: 5,  title: 'Naruto Shippuden',       genre: 'Action/Ninja',   episodes: 500,  year: 2007, emoji: '🍃',  color: '#1a2a00' },
  { id: 6,  title: 'Death Note',             genre: 'Thriller',       episodes: 37,   year: 2006, emoji: '📓',  color: '#0a0a0a' },
  { id: 7,  title: 'Fullmetal Alchemist',    genre: 'Fantasy/Drama',  episodes: 64,   year: 2009, emoji: '⚗️',  color: '#2a1500' },
  { id: 8,  title: 'Hunter x Hunter',        genre: 'Adventure',      episodes: 148,  year: 2011, emoji: '🎯',  color: '#001020' },
  { id: 9,  title: 'Sword Art Online',       genre: 'Isekai/Action',  episodes: 96,   year: 2012, emoji: '🗡️',  color: '#00001a' },
  { id: 10, title: 'Dragon Ball Super',      genre: 'Action',         episodes: 131,  year: 2015, emoji: '🐉',  color: '#2a1000' },
  { id: 11, title: 'Jujutsu Kaisen',         genre: 'Dark Fantasy',   episodes: 48,   year: 2020, emoji: '💀',  color: '#15003a' },
  { id: 12, title: 'Spy x Family',           genre: 'Comedy/Action',  episodes: 37,   year: 2022, emoji: '🕵️', color: '#002a15' },
];

// On page load: try API, fall back to local list
async function loadAnime() {
  const grid = document.getElementById('anime-grid');
  grid.innerHTML = '<div class="loading">Loading anime...</div>';

  let animeData = ANIME_LIST;
  try {
    const res = await fetch('/api/videos');
    if (res.ok) {
      const data = await res.json();
      if (data.videos && data.videos.length > 0) animeData = data.videos;
    }
  } catch (err) {
    console.warn('API unavailable, using local data:', err.message);
  }
  renderGrid(animeData);
}

// Build and inject one card per anime
function renderGrid(list) {
  const grid = document.getElementById('anime-grid');
  grid.innerHTML = '';
  list.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <div class="card-thumb" style="background:radial-gradient(circle,${brighten(anime.color)},${anime.color});">
        <span class="card-emoji">${anime.emoji || '🎬'}</span>
      </div>
      <div class="card-info">
        <div class="card-title" title="${safe(anime.title)}">${safe(anime.title)}</div>
        <div class="card-meta">${safe(anime.genre)} &bull; ${anime.year} &bull; ${anime.episodes} eps</div>
        <div class="card-actions">
          <button class="btn-play"     onclick="playAnime(${anime.id})">&#9654; Play</button>
          <button class="btn-download" onclick="quickDownload(${anime.id},event)" title="Download">&#8595;</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// Navigate to player page with anime id in query string
function playAnime(id) {
  window.location.href = `/player.html?id=${id}`;
}

// Download without opening the player
async function quickDownload(id, event) {
  event.stopPropagation();
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '…'; btn.disabled = true;
  try {
    const res  = await fetch(`/api/download/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    const a = document.createElement('a');
    a.href = data.downloadUrl;
    a.download = data.filename || `anime_${id}.mp4`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch (err) {
    alert('Download error: ' + err.message);
  } finally {
    btn.innerHTML = orig; btn.disabled = false;
  }
}

// Escape HTML to prevent XSS
function safe(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Lighten a hex color slightly for gradient
function brighten(hex) {
  if (!hex || hex.length < 7) return '#333';
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + 40);
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + 40);
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + 40);
  return `rgb(${r},${g},${b})`;
}

document.addEventListener('DOMContentLoaded', loadAnime);
