export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const response = await fetch("https://safenote.co/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        note: text,
        lifetime: 48, // 48h de validade
        read_count: 3, // autodestrói após 3 leituras
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({
        error: data.message || "SafeNote error",
      });
    }

    return res.status(200).json({
      url: data.link,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
