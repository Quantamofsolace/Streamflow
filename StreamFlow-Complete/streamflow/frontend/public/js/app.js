// frontend/public/js/app.js
// Fetches anime from backend API, falls back to local list.
// Uses local thumbnails from /thumbnails/ folder.

const ANIME_LIST = [
  { id:1,  slug:"attack-on-titan-ep1",  title:"Attack on Titan",      subtitle:"The Last Hope of Humanity",    genre:"Action · Drama · Survival",        year:2013, eps:87,   rating:"TV-MA", color1:"#5a0a0a", color2:"#c01010", desc:"When Titans breach humanity's last walls, one young soldier makes a vow that will change the world forever." },
  { id:2,  slug:"demon-slayer-ep1",     title:"Demon Slayer",          subtitle:"Kimetsu no Yaiba",             genre:"Action · Fantasy · Supernatural",   year:2019, eps:44,   rating:"TV-14", color1:"#3a0a1a", color2:"#d04000", desc:"A kind-hearted boy takes up the blade to save his demon-cursed sister and hunt the creatures of the night." },
  { id:3,  slug:"mha-ep1",             title:"My Hero Academia",      subtitle:"Boku no Hero Academia",        genre:"Superhero · Action · School",       year:2016, eps:138,  rating:"TV-PG", color1:"#00103a", color2:"#1050c0", desc:"In a world where everyone has a superpower, one boy born without any dares to become the greatest hero." },
  { id:4,  slug:"one-piece-ep1",       title:"One Piece",             subtitle:"King of the Pirates",         genre:"Adventure · Action · Comedy",       year:1999, eps:1000, rating:"TV-PG", color1:"#2a1a00", color2:"#c09000", desc:"Set sail across the Grand Line. The legendary treasure One Piece awaits those bold enough to pursue it." },
  { id:5,  slug:"naruto-ep1",          title:"Naruto Shippuden",      subtitle:"Rise of the Hidden Leaf",     genre:"Action · Ninja · Adventure",        year:2007, eps:500,  rating:"TV-PG", color1:"#0a1a00", color2:"#508000", desc:"A lonely orphan who carries the Nine-Tails demon fox dreams of becoming the greatest Hokage of all time." },
  { id:6,  slug:"death-note-ep1",      title:"Death Note",            subtitle:"The God of the New World",    genre:"Thriller · Mystery · Psychological",year:2006, eps:37,   rating:"TV-MA", color1:"#050510", color2:"#5030a0", desc:"A brilliant student discovers a supernatural notebook. Write a name — that person dies." },
  { id:7,  slug:"fma-ep1",             title:"Fullmetal Alchemist",   subtitle:"Brotherhood",                 genre:"Fantasy · Adventure · Drama",       year:2009, eps:64,   rating:"TV-14", color1:"#1a0a00", color2:"#906000", desc:"Two brothers pay the ultimate price for forbidden alchemy and quest for the Philosopher's Stone." },
  { id:8,  slug:"hxh-ep1",            title:"Hunter x Hunter",       subtitle:"World's Greatest Hunt",       genre:"Adventure · Action · Fantasy",      year:2011, eps:148,  rating:"TV-14", color1:"#001018", color2:"#006090", desc:"A cheerful boy leaves everything behind to find his legendary Hunter father and claim the title himself." },
  { id:9,  slug:"sao-ep1",            title:"Sword Art Online",      subtitle:"Aincrad Arc",                 genre:"Isekai · Action · Romance",         year:2012, eps:96,   rating:"TV-14", color1:"#00000f", color2:"#1010a0", desc:"Ten thousand players are trapped in a VR game where death in the virtual world means death in reality." },
  { id:10, slug:"dbs-ep1",            title:"Dragon Ball Super",     subtitle:"Beyond the Limits of Power",  genre:"Action · Tournament · Martial Arts",year:2015, eps:131,  rating:"TV-PG", color1:"#1a0800", color2:"#c05000", desc:"Goku and the Z-Fighters battle gods of destruction and warriors from across universes." },
  { id:11, slug:"jjk-ep1",            title:"Jujutsu Kaisen",        subtitle:"The Cursed Path",             genre:"Dark Fantasy · Action · Horror",    year:2020, eps:48,   rating:"TV-MA", color1:"#0a0020", color2:"#5000b0", desc:"A high schooler swallows a cursed finger and enters a secret world of sorcerers and cursed spirits." },
  { id:12, slug:"spyfam-ep1",         title:"Spy x Family",          subtitle:"Operation Strix",             genre:"Comedy · Action · Slice of Life",   year:2022, eps:37,   rating:"TV-PG", color1:"#001810", color2:"#008040", desc:"A spy, an assassin, and a telepath form the perfect fake family — none knowing the others' true secrets." },
];

// ── LOAD ─────────────────────────────────────────────────────────────────
// Try backend API first; fall back to ANIME_LIST above.
async function loadAnime() {
  const grid = document.getElementById("anime-grid");
  grid.innerHTML = '<div style="color:#555;padding:40px;grid-column:1/-1">Loading...</div>';

  let list = ANIME_LIST;
  try {
    const res = await fetch("/api/videos");
    if (res.ok) {
      const data = await res.json();
      if (data.videos && data.videos.length > 0) list = data.videos;
    }
  } catch (e) {
    console.warn("API unavailable, using local data:", e.message);
  }

  // Update hero stat count
  const sc = document.getElementById("stat-count");
  if (sc) sc.textContent = list.length;

  renderGrid(list);
}

// ── RENDER ────────────────────────────────────────────────────────────────
let allAnime = [];

function renderGrid(list) {
  allAnime = list;
  const grid = document.getElementById("anime-grid");
  grid.innerHTML = "";
  list.forEach(a => {
    // Thumbnail: use local file if slug exists, else fallback gradient
    const thumbSrc = `/thumbnails/${a.slug}.jpg`;
    const card = document.createElement("div");
    card.className = "anime-card";
    card.dataset.genre = (a.genre || "").toLowerCase();
    card.innerHTML = `
      <div class="card-thumb-wrap">
        <img class="card-thumb" src="${thumbSrc}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
             alt="${safe(a.title)}" loading="lazy">
        <!-- Fallback gradient shown if image missing -->
        <div class="card-thumb-fallback" style="display:none;background:radial-gradient(circle at 40% 40%,${a.color2||'#333'},${a.color1||'#111'})">
          <span style="font-size:52px">${a.emoji||'🎬'}</span>
        </div>
        <div class="card-overlay">
          <div class="card-play-big">&#9654;</div>
        </div>
        <div class="card-badge">EP 1</div>
        <div class="card-rating">${safe(a.rating||'')}</div>
      </div>
      <div class="card-info">
        <div class="card-title" title="${safe(a.title)}">${safe(a.title)}</div>
        <div class="card-sub">${safe(a.subtitle||'')}</div>
        <div class="card-meta">
          <span>${a.year}</span>
          <span class="cmd"></span>
          <span>${(a.eps>=1000)?'1000+':a.eps} eps</span>
          <span class="cmd"></span>
          <span>${safe((a.genre||'').split('·')[0].trim())}</span>
        </div>
        <div class="card-actions">
          <button class="btn-play" onclick="playAnime(${a.id})">&#9654; Play</button>
          <button class="btn-dl"   onclick="quickDownload(${a.id},event)" title="Download">&#8595;</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── GENRE FILTER ──────────────────────────────────────────────────────────
function filterGenre(btn, genre) {
  document.querySelectorAll(".genre-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const filtered = genre === "all"
    ? allAnime
    : allAnime.filter(a => (a.genre || "").toLowerCase().includes(genre));
  renderGrid(filtered);
}

// ── NAVIGATE TO PLAYER ────────────────────────────────────────────────────
function playAnime(id) {
  window.location.href = `/player.html?id=${id}`;
}

// ── QUICK DOWNLOAD FROM HOME PAGE ─────────────────────────────────────────
async function quickDownload(id, event) {
  event.stopPropagation();
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = "…"; btn.disabled = true;
  try {
    const res  = await fetch(`/api/download/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    triggerDownload(data.downloadUrl, data.filename || `anime_${id}.mp4`);
    showToast("⬇ Download started");
  } catch (err) {
    alert("Download error: " + err.message);
  } finally {
    btn.innerHTML = orig; btn.disabled = false;
  }
}

function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ── TOAST ─────────────────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  let t = document.getElementById("sf-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "sf-toast"; t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function safe(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── HEADER SCROLL EFFECT ──────────────────────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("header")
    ?.classList.toggle("scrolled", window.scrollY > 60);
});

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", loadAnime);
