export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    // paste.rs: POST raw body, retorna URL direto
    const response = await fetch("https://paste.rs/", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: text,
    });

    if (!response.ok) {
      throw new Error(`paste.rs error: ${response.status}`);
    }

    const url = await response.text();
    res.status(200).json({ url: url.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
