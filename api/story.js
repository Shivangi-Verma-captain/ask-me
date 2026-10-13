export default async function handler(req, res) {
  // CORS for local preview
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST to make a story." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const hero = String(body.hero || "").trim().slice(0, 80);
    const buddy = String(body.buddy || "").trim().slice(0, 80);
    const place = String(body.place || "").trim().slice(0, 80);
    const treasure = String(body.treasure || "").trim().slice(0, 80);
    const mood = String(body.mood || "cozy").trim().slice(0, 40);
    const twist = String(body.twist || "").trim().slice(0, 80);
    const language = String(body.language || "English").trim().slice(0, 40);

    if (!hero && !place && !treasure && !twist && !buddy) {
      return res.status(400).json({ error: "Add at least one word to start the magic!" });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey || apiKey === "paste-your-key-here") {
      console.error("Missing SARVAM_API_KEY (server env not set).");
      return res.status(500).json({
        error: "Our story oven is still warming up. Try again in a moment!"
      });
    }

    const words = [
      hero && `Hero: ${hero}`,
      buddy && `Buddy: ${buddy}`,
      place && `Place: ${place}`,
      treasure && `Magical object: ${treasure}`,
      `Mood: ${mood}`,
      twist && `Secret twist word: ${twist}`,
    ].filter(Boolean).join("\n");

    const prompt = `Write a short immersive story (140-220 words, 3 tiny paragraphs).
Use ALL of these ideas naturally:
${words}

Rules:
- Language: ${language}. If Hinglish, mix Hindi + English playfully.
- Second person touches ("you can smell...", "you hear...") so it feels immersive.
- Vivid senses: 1 smell, 1 sound, 1 texture.
- The magical object must matter to the ending.
- End with one warm sparkly line + an emoji.
- Give it a cute 4-6 word title on the first line as "Title: ...".
- No scary gore, kid-friendly, cozy.`;

    const sarvamRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        model: "sarvam-105b",
        temperature: 0.85,
        max_tokens: 600,
        messages: [
          { role: "system", content: "You are Story Sprinkles, a cute playful storyteller who writes tiny immersive fairytales full of sensory sparkle." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await sarvamRes.json().catch(() => ({}));

    if (!sarvamRes.ok) {
      console.error("Sarvam error", sarvamRes.status, data);
      return res.status(502).json({
        error: "Our story oven hiccuped. Try again in a moment!",
      });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(502).json({ error: "Our story oven hiccuped. Try again in a moment!" });

    return res.status(200).json({ story: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Oops! Our story oven hiccuped. Try again!" });
  }
}
