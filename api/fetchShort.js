import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { id } = req.query;
  const filePath = path.resolve("./pasteMapping.json");

  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "Paste not found" });

  const mapping = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const pastebinId = mapping[id];

  if (!pastebinId) return res.status(404).json({ error: "Paste not found" });

  // buscar conteúdo do Pastebin
  try {
    const response = await fetch(`https://pastebin.com/raw/${pastebinId}`);
    if (!response.ok) throw new Error("Failed to fetch paste");
    const text = await response.text();
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
