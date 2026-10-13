// One test call to Sarvam. Run with: node --env-file=.env test-sarvam.mjs

const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-subscription-key": process.env.SARVAM_API_KEY
  },
  body: JSON.stringify({
    model: "sarvam-105b-conversations",
    messages: [{ role: "user", content: "Say hi in one sentence." }]
  })
});

const data = await response.json();
console.log(response.status, data.choices?.[0]?.message?.content ?? data);
