// DOUBLE TROUBLE frontend — sends words to /api/story (Sarvam), edgy fallback
const form = document.getElementById("story-form");
const makeBtn = document.getElementById("make");
const box = document.getElementById("story-box");
const titleEl = document.getElementById("story-title");
const textEl = document.getElementById("story-text");
const errEl = document.getElementById("story-error");
const loader = document.getElementById("loader");
const chipsEl = document.getElementById("chips");

let mood = "savage";
document.getElementById("moods").addEventListener("click", (e) => {
  const b = e.target.closest(".pill");
  if (!b) return;
  document.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
  b.classList.add("active");
  mood = b.dataset.mood;
});

const surpriseSets = [
  ["broke landlord", "ex with attitude", "2BHK in Andheri", "neighbour's pressure cooker", "rent"],
  ["gym trainer", "shaadi ka photographer", "5AM local train", "lost wallet", "stamina"],
  ["startup founder", "nosy aunty", "office pantry", "performance review", "package"],
  ["delivery guy", "late-night RJ", "rooftop party", "cheap whiskey", "long night"],
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
    if (v === "a") document.getElementById("hero").value = "broke landlord";
    if (v === "b") document.getElementById("place").value = "shaadi ka buffet";
    if (v === "c") document.getElementById("place").value = "5AM local train";
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
    showError("Drop at least one word first. Don't be shy.");
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
    titleEl.textContent = "Fresh damage delivered.";
  } catch (err) {
    // Never show server details to visitors.
    console.warn("API failed, using local fallback:", err);
    titleEl.textContent = "Offline roast (server busy)";
    typewriter(localStory(payload));
    showError("Server took a smoke break — here's a house special. Try again in a bit.");
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
  makeBtn.textContent = on ? "COOKING…" : "DROP THE STORY ↓";
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
  const items = [p.hero, p.buddy, p.place, p.treasure, p.mood, p.twist].filter(Boolean);
  chipsEl.innerHTML = items.map((c) => `<span class="chip">${escapeHtml(c.toUpperCase())}</span>`).join("");
}

function cleanStory(s) {
  return String(s || "").replace(/^Title:\s*/i, "").trim();
}

let typeTimer;
function typewriter(full) {
  clearInterval(typeTimer);
  errEl.classList.add("hidden");
  let i = 0;
  typeTimer = setInterval(() => {
    i += 8;
    textEl.textContent = full.slice(0, i);
    if (i >= full.length) clearInterval(typeTimer);
  }, 14);
}

function localStory(p) {
  const hero = p.hero || "broke landlord";
  const buddy = p.buddy || "ex with attitude";
  const place = p.place || "2BHK in Andheri";
  const treasure = p.treasure || "neighbour's pressure cooker";
  const twist = p.twist || "rent";
  return `The ${twist} always comes twice.\n\n${hero} swore this month would be different. Then ${buddy} showed up at ${place} with the ${treasure} and said, "I heard your ${twist} is too big to handle alone." Everyone laughed. ${hero} did not.\n\nYou can smell cheap deo and bad decisions. You hear the cooker whistle like it's judging you. Life lesson number 404: the longer you ignore your ${twist}, the harder it gets. In the end ${hero} paid double — once in cash, once in dignity.\n\nMoral: size of the ${twist} doesn't matter. Timing does.`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textEl.textContent);
    document.getElementById("copy").textContent = "COPIED";
    setTimeout(() => (document.getElementById("copy").textContent = "COPY"), 1500);
  } catch { showError("Copy blocked — select + copy manually."); }
});

document.getElementById("read").addEventListener("click", () => {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(textEl.textContent.slice(0, 800));
  u.rate = 0.95; u.pitch = 0.9;
  speechSynthesis.speak(u);
});

document.getElementById("again").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("hero").focus();
});
