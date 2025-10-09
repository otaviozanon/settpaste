import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ViewPaste() {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPaste() {
      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const res = await fetch(`${SUPABASE_URL}/rest/v1/pastes?id=eq.${id}`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });
        const data = await res.json();
        if (data.length === 0) throw new Error("Paste not found");
        setPaste(data[0]);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchPaste();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!paste) return <p>Loading...</p>;

  return (
    <div className="centered">
      <h1>{paste.title}</h1>
      <pre>{paste.content}</pre>
    </div>
  );
}

export default ViewPaste;
