export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const hero = String(body.hero || "").trim().slice(0, 80);
    const buddy = String(body.buddy || "").trim().slice(0, 80);
    const place = String(body.place || "").trim().slice(0, 80);
    const treasure = String(body.treasure || "").trim().slice(0, 80);
    const mood = String(body.mood || "dark").trim().slice(0, 40);
    const twist = String(body.twist || "").trim().slice(0, 80);
    const language = String(body.language || "English").trim().slice(0, 40);

    // Words are optional — vibe alone is a valid request.

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey || apiKey === "paste-your-key-here") {
      console.error("Missing SARVAM_API_KEY (server env not set).");
      return res.status(500).json({ error: "Server warming up. Try again." });
    }

    const words = [
      hero && `Main character: ${hero}`,
      buddy && `Partner in crime: ${buddy}`,
      place && `Location: ${place}`,
      treasure && `Cursed object: ${treasure}`,
      twist && `Twist word: ${twist}`,
    ].filter(Boolean).join("\n");

    const hasSpice = Boolean(words);
    const spiceLine = hasSpice
      ? `Work these in naturally:\n${words}`
      : `No user words given — invent your own savage adult characters, messy location and cursed object that fit the vibe.`;

    const prompt = `Write a short dark-comedy story (150-220 words, 3 paragraphs) full of fun, sarcasm and clever double-meaning wordplay.
Vibe: ${mood}
${spiceLine}

Rules:
- Language: ${language}. If Hinglish, mix Hindi + English like a late-night standup set.
- Tone: savage, witty, roasty, adult-ish. Punchlines, reality checks, "that's what she said" style misdirection.
- Double meaning = clever, not crude. Flirty wordplay allowed, but NO pornographic detail, NO graphic sex, NO minors (all characters 25+ adults), NO incest, NO non-consensual stuff.
- Dark = sarcastic about rent, jobs, exes, adulting, hangovers — NOT gore, NOT self-harm, NOT hate, NO slurs.
- Second-person jabs ("you know that feeling when...").
- The cursed object must cause the climax.
- First line = punchy title (4-7 words), no "Title:" prefix.
- End with a brutal one-line moral.`;

    const sarvamRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        model: "sarvam-105b",
        temperature: 0.9,
        max_tokens: 650,
        messages: [
          { role: "system", content: "You are DOUBLE TROUBLE, a savage Indian standup-comic storyteller. Dark, funny, full of clever double-meaning. Adults only, consensual, never explicit, never hateful." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await sarvamRes.json().catch(() => ({}));

    if (!sarvamRes.ok) {
      console.error("Sarvam error", sarvamRes.status, data);
      return res.status(502).json({ error: "Server hiccup. Try again." });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(502).json({ error: "Server hiccup. Try again." });

    return res.status(200).json({ story: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server hiccup. Try again." });
  }
}
