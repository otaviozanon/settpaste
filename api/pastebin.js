import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, title } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  const api_dev_key = process.env.PASTEBIN_API_KEY; // sua chave do Pastebin
  const api_user_key = ""; // guest paste

  const formData = new URLSearchParams();
  formData.append("api_dev_key", api_dev_key);
  formData.append("api_user_key", api_user_key);
  formData.append("api_option", "paste");
  formData.append("api_paste_code", text);
  formData.append("api_paste_name", title || "Settpaste");
  formData.append("api_paste_private", "1"); // 0=public, 1=unlisted
  formData.append("api_paste_expire_date", "10M");
  formData.append("api_paste_format", "text");

  try {
    const response = await fetch("https://pastebin.com/api/api_post.php", {
      method: "POST",
      body: formData,
    });

    const url = await response.text();
    if (url.startsWith("Bad API request"))
      return res.status(400).json({ error: url });

    const pasteId = url.split("/").pop(); // pega o ID real do Pastebin

    // gerar shortId aleatório (7 caracteres)
    const shortId = Math.random().toString(36).substring(2, 9);

    // caminho do arquivo de mapeamento
    const filePath = path.resolve("./pasteMapping.json");

    // ler arquivo existente
    let mapping = {};
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      mapping = JSON.parse(fileData);
    }

    // adicionar novo mapeamento shortId -> pasteId
    mapping[shortId] = pasteId;

    // salvar de volta
    fs.writeFileSync(filePath, JSON.stringify(mapping, null, 2));

    // retorna shortId e link curto para o React
    res.status(200).json({
      shortId,
      pasteId,
      url: `${req.headers.origin}/${shortId}`, // link curto completo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
