import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, title } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  const id = Math.random().toString(36).substring(2, 8);

  const { error } = await supabase
    .from("pastes")
    .insert([{ id, title: title || "Untitled", content: text }]);

  if (error) return res.status(500).json({ error: error.message });

  const url = `https://settpaste.vercel.app/${id}`;
  res.status(200).json({ url });
}
