// frontend/public/js/player.js
// Loads video from API, drives the player, fires anime drop animation on play.

const DROP_EMOJIS = [
  "⚔️","🔥","💪","☠️","🍃","📓","⚗️","🎯","🗡️","🐉",
  "💀","🕵️","🌸","⚡","🌊","🎭","🦊","🐺","🌙","✨",
  "🎌","🏯","🎋","🌺","🎏","💫","🎆","🎇","🐼","🦅"
];

// Same local list as app.js for fallback
const ANIME_LIST = [
  { id:1,  slug:"attack-on-titan-ep1",  title:"Attack on Titan",      subtitle:"The Last Hope of Humanity",    genre:"Action · Drama",    year:2013, eps:87,   rating:"TV-MA", desc:"When Titans breach humanity's last walls, one young soldier makes a vow that will change the world forever." },
  { id:2,  slug:"demon-slayer-ep1",     title:"Demon Slayer",          subtitle:"Kimetsu no Yaiba",             genre:"Action · Fantasy",   year:2019, eps:44,   rating:"TV-14", desc:"A kind-hearted boy takes up the blade to save his demon-cursed sister and hunt the creatures of the night." },
  { id:3,  slug:"mha-ep1",             title:"My Hero Academia",      subtitle:"Boku no Hero Academia",        genre:"Superhero · Action", year:2016, eps:138,  rating:"TV-PG", desc:"In a world where everyone has a superpower, one boy born without any dares to become the greatest hero." },
  { id:4,  slug:"one-piece-ep1",       title:"One Piece",             subtitle:"King of the Pirates",         genre:"Adventure · Action", year:1999, eps:1000, rating:"TV-PG", desc:"Set sail across the Grand Line. The legendary treasure One Piece awaits those bold enough to pursue it." },
  { id:5,  slug:"naruto-ep1",          title:"Naruto Shippuden",      subtitle:"Rise of the Hidden Leaf",     genre:"Action · Ninja",     year:2007, eps:500,  rating:"TV-PG", desc:"A lonely orphan who carries the Nine-Tails demon fox dreams of becoming the greatest Hokage of all time." },
  { id:6,  slug:"death-note-ep1",      title:"Death Note",            subtitle:"The God of the New World",    genre:"Thriller · Mystery", year:2006, eps:37,   rating:"TV-MA", desc:"A brilliant student discovers a supernatural notebook. Write a name — that person dies." },
  { id:7,  slug:"fma-ep1",             title:"Fullmetal Alchemist",   subtitle:"Brotherhood",                 genre:"Fantasy · Drama",    year:2009, eps:64,   rating:"TV-14", desc:"Two brothers pay the ultimate price for forbidden alchemy and quest for the Philosopher's Stone." },
  { id:8,  slug:"hxh-ep1",            title:"Hunter x Hunter",       subtitle:"World's Greatest Hunt",       genre:"Adventure · Action", year:2011, eps:148,  rating:"TV-14", desc:"A cheerful boy leaves everything behind to find his legendary Hunter father and claim the title himself." },
  { id:9,  slug:"sao-ep1",            title:"Sword Art Online",      subtitle:"Aincrad Arc",                 genre:"Isekai · Action",    year:2012, eps:96,   rating:"TV-14", desc:"Ten thousand players are trapped in a VR game where death means death in reality." },
  { id:10, slug:"dbs-ep1",            title:"Dragon Ball Super",     subtitle:"Beyond the Limits of Power",  genre:"Action · Tournament",year:2015, eps:131,  rating:"TV-PG", desc:"Goku and the Z-Fighters battle gods of destruction and warriors from across universes." },
  { id:11, slug:"jjk-ep1",            title:"Jujutsu Kaisen",        subtitle:"The Cursed Path",             genre:"Dark Fantasy",       year:2020, eps:48,   rating:"TV-MA", desc:"A high schooler swallows a cursed finger and enters a secret world of sorcerers and cursed spirits." },
  { id:12, slug:"spyfam-ep1",         title:"Spy x Family",          subtitle:"Operation Strix",             genre:"Comedy · Action",    year:2022, eps:37,   rating:"TV-PG", desc:"A spy, an assassin, and a telepath form the perfect fake family — none knowing the others' true secrets." },
];

let dropFired = false;

// ── READ ?id= FROM URL ────────────────────────────────────────────────────
const params  = new URLSearchParams(window.location.search);
const videoId = parseInt(params.get("id")) || 1;

// ── INIT PLAYER ───────────────────────────────────────────────────────────
async function initPlayer() {
  let anime = null;

  // 1. Try backend API
  try {
    const res  = await fetch(`/api/videos/${videoId}`);
    const data = await res.json();
    if (res.ok && data.video) {
      anime = data.video;
      document.getElementById("video-src").src = data.video.streamUrl;
      document.getElementById("main-video").load();
    }
  } catch (e) {
    console.warn("API unavailable:", e.message);
  }

  // 2. Fallback to local list
  if (!anime) {
    anime = ANIME_LIST.find(a => a.id === videoId) || ANIME_LIST[0];
    // Point to local video file
    const src = document.getElementById("video-src");
    src.src = `/videos/${anime.slug}.mp4`;
    document.getElementById("main-video").load();
  }

  // ── Populate UI ─────────────────────────────────────────────────────
  document.getElementById("video-title").textContent = anime.title || "Untitled";
  document.getElementById("video-sub").textContent   = anime.subtitle || "";

  // Tags
  const tagsEl = document.getElementById("video-tags");
  const genres = (anime.genre || "").split("·").map(g => g.trim()).filter(Boolean);
  tagsEl.innerHTML =
    `<span class="ptag red">${anime.rating || ""}</span>` +
    genres.map(g => `<span class="ptag">${g}</span>`).join("") +
    `<span class="ptag">${(anime.eps >= 1000 ? "1000+" : anime.eps)} Episodes</span>`;

  document.getElementById("episode-info").textContent =
    `${anime.title} — Episode 1 — ${anime.year}`;
  document.getElementById("video-desc").textContent = anime.desc || "";
}

// ── ANIME DROP — fires ONCE on first play press ───────────────────────────
function onPlay() {
  if (dropFired) return;
  dropFired = true;
  const container = document.getElementById("anime-drop-container");
  container.innerHTML = "";
  DROP_EMOJIS.forEach((emoji, i) => {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className   = "anime-drop-item";
      el.textContent = emoji;
      el.style.left  = (2 + Math.random() * 93) + "vw";
      el.style.fontSize = (44 + Math.random() * 38) + "px";
      el.style.setProperty("--dur", (2.4 + Math.random() * 1.8).toFixed(2) + "s");
      container.appendChild(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, i * 110);
  });
}

// ── QUALITY CHANGE ────────────────────────────────────────────────────────
function changeQuality(quality) {
  // In production: swap src to /api/videos/:id?quality=720p etc.
  console.log("Quality changed to:", quality);
}

// ── DOWNLOAD ──────────────────────────────────────────────────────────────
async function handleDownload() {
  const btn = document.getElementById("download-btn");
  const orig = btn.innerHTML;
  btn.innerHTML = "Preparing…"; btn.disabled = true;
  try {
    const res  = await fetch(`/api/download/${videoId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    const a = document.createElement("a");
    a.href = data.downloadUrl; a.download = data.filename || `episode_${videoId}.mp4`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch (err) {
    // Fallback: try local file
    const anime = ANIME_LIST.find(a => a.id === videoId) || ANIME_LIST[0];
    const a = document.createElement("a");
    a.href = `/videos/${anime.slug}.mp4`; a.download = `${anime.slug}.mp4`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } finally {
    btn.innerHTML = orig; btn.disabled = false;
  }
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initPlayer();
  document.getElementById("main-video").addEventListener("play", onPlay);
  document.getElementById("download-btn").addEventListener("click", handleDownload);
  document.getElementById("quality").addEventListener("change", e => changeQuality(e.target.value));
  document.getElementById("header")?.classList.add("scrolled");
});
