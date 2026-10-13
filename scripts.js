// Story Sprinkles frontend — sends words to /api/story (Sarvam) with cute fallback
const form = document.getElementById("story-form");
const makeBtn = document.getElementById("make");
const box = document.getElementById("story-box");
const titleEl = document.getElementById("story-title");
const textEl = document.getElementById("story-text");
const errEl = document.getElementById("story-error");
const loader = document.getElementById("loader");
const chipsEl = document.getElementById("chips");

let mood = "cozy";
document.getElementById("moods").addEventListener("click", (e) => {
  const b = e.target.closest(".pill");
  if (!b) return;
  document.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
  b.classList.add("active");
  mood = b.dataset.mood;
});

const surpriseSets = [
  ["sleepy panda", "talking samosa", "floating chai shop", "glowing jhumka", "monsoon giggle"],
  ["brave squirrel", "robot nani", "moon metro", "singing laddoo", "time-freeze"],
  ["shy dragon", "cloud auto-driver", "library of smells", "invisible umbrella", "midnight post"],
  ["curious otter", "dj peacock", "underwater mela", "memory marbles", "first rain"],
];

document.getElementById("surprise").addEventListener("click", () => {
  const s = surpriseSets[Math.floor(Math.random() * surpriseSets.length)];
  document.getElementById("hero").value = s[0];
  document.getElementById("buddy").value = s[1];
  document.getElementById("place").value = s[2];
  document.getElementById("treasure").value = s[3];
  document.getElementById("twist").value = s[4];
  bake();
});

document.querySelectorAll("[data-fill]").forEach((b) =>
  b.addEventListener("click", () => {
    const v = b.dataset.fill;
    if (v === "panda") document.getElementById("hero").value = "sleepy panda";
    if (v === "place") document.getElementById("place").value = "moon metro";
    if (v === "treasure") document.getElementById("treasure").value = "singing laddoo";
  })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  bake();
});

async function bake() {
  const payload = {
    hero: val("hero"),
    buddy: val("buddy"),
    place: val("place"),
    treasure: val("treasure"),
    twist: val("twist"),
    mood,
    language: document.getElementById("language").value,
  };

  if (!payload.hero && !payload.buddy && !payload.place && !payload.treasure && !payload.twist) {
    showError("Sprinkle at least one word in a box first! Even a tiny one. 🐭");
    return;
  }

  box.classList.remove("hidden");
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  setLoading(true);
  renderChips(payload);

  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Server said ${res.status}`);
    typewriter(cleanStory(data.story));
    titleEl.textContent = "Your story is served! 🍰";
  } catch (err) {
    // Cute offline fallback so the site still feels magical. Never show server details to visitors.
    console.warn("API failed, using local sprinkle:", err);
    titleEl.textContent = "A pocket story (offline sprinkle) 🌙";
    typewriter(localStory(payload));
    showError("Our story oven hiccuped, so here's a homemade tale — try baking again in a moment! 🍞");
  } finally {
    setLoading(false);
  }
}

function val(id) {
  return document.getElementById(id).value.trim();
}

function setLoading(on) {
  loader.classList.toggle("hidden", !on);
  makeBtn.disabled = on;
  makeBtn.textContent = on ? "✨ Baking…" : "✨ Bake my story";
  if (on) {
    errEl.classList.add("hidden");
    textEl.textContent = "";
  }
}

function showError(msg) {
  box.classList.remove("hidden");
  errEl.textContent = msg;
  errEl.classList.remove("hidden");
}

function renderChips(p) {
  const items = [p.hero && `🦊 ${p.hero}`, p.buddy && `🍙 ${p.buddy}`, p.place && `🏰 ${p.place}`, p.treasure && `💎 ${p.treasure}`, `💫 ${p.mood}`, p.twist && `🌀 ${p.twist}`].filter(Boolean);
  chipsEl.innerHTML = items.map((c) => `<span class="chip">${escapeHtml(c)}</span>`).join("");
}

function cleanStory(s) {
  return String(s || "").replace(/^Title:\s*/i, "🌟 ").trim();
}

let typeTimer;
function typewriter(full) {
  clearInterval(typeTimer);
  errEl.classList.add("hidden");
  let i = 0;
  // fast + cute: reveal in chunks so long stories don't take forever
  typeTimer = setInterval(() => {
    i += 6;
    textEl.textContent = full.slice(0, i);
    if (i >= full.length) clearInterval(typeTimer);
  }, 18);
}

function localStory(p) {
  const hero = p.hero || "a sleepy panda";
  const buddy = p.buddy || "a talking samosa";
  const place = p.place || "a floating chai shop";
  const treasure = p.treasure || "a glowing jhumka";
  const twist = p.twist || "a monsoon giggle";
  return `🌟 The ${twist} at ${place}\n\nYou push open a creaky cardamom-smelling door and ${hero} looks up, eyes full of crumbs and hope. Beside them, ${buddy} crackles, “You came! The ${treasure} only glows when someone ${p.mood} believes.”\n\nYou hear tiny bells in the steam. You touch the ${treasure} — warm as toast — and the whole ${place} tilts toward adventure. Together you chase the ${twist} through cinnamon clouds, laughing so hard the stars wobble.\n\nIn the end, the ${treasure} wasn’t magic. Your kindness was. And you carry its glow home in your pocket. ✨`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textEl.textContent);
    document.getElementById("copy").textContent = "✅ Copied!";
    setTimeout(() => (document.getElementById("copy").textContent = "📋 Copy"), 1500);
  } catch { showError("Copy didn’t work in this browser — just select + copy!"); }
});

document.getElementById("read").addEventListener("click", () => {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(textEl.textContent.slice(0, 800));
  u.rate = 0.95; u.pitch = 1.1;
  speechSynthesis.speak(u);
});

document.getElementById("again").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("hero").focus();
});
