import { useState, useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/base16/solarized-dark.css";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Update highlight sintax
  useEffect(() => {
    if (!text.trim()) return setHighlighted("");
    const result = hljs.highlightAuto(text);
    setHighlighted(result.value);
  }, [text]);

  // Animation toast
  const showToast = (message) => {
    setToast(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  // Send text to Supabase first, fallback to Pastebin if fails
  async function uploadText() {
    if (!text.trim()) return;

    try {
      const supaRes = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title: "Settpaste Note" }),
      });

      if (!supaRes.ok) throw new Error("Supabase upload failed");

      const supaData = await supaRes.json();
      if (!supaData.url)
        throw new Error(supaData.error || "No URL from Supabase");

      setGeneratedUrl(supaData.url);
      showToast("Sent to SettPaste!");
    } catch (supabaseError) {
      console.error("Supabase failed:", supabaseError.message);
      showToast("Supabase failed — trying Pastebin...");

      try {
        const pasteRes = await fetch("/api/pastebin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, title: "Settpaste Fallback" }),
        });

        const pasteData = await pasteRes.json();
        if (!pasteData.url)
          throw new Error(pasteData.error || "Pastebin failed");

        setGeneratedUrl(pasteData.url);
        showToast("Sent to Pastebin!");
      } catch (pasteError) {
        console.error("Pastebin also failed:", pasteError.message);
        setGeneratedUrl("Error: " + pasteError.message);
        showToast("All uploads failed!");
      }
    }
  }

  function copyUrl() {
    if (!generatedUrl) return showToast("No URL to copy");
    navigator.clipboard.writeText(generatedUrl);
    showToast("URL copied!");
  }

  function syncScroll(e) {
    const highlight = document.getElementById("highlighted-output");
    highlight.scrollTop = e.target.scrollTop;
    highlight.scrollLeft = e.target.scrollLeft;
  }

  return (
    <div className="centered">
      <h1>settpaste</h1>

      <div id="paste-form">
        <div className="highlight-wrapper" id="highlight-wrapper">
          <pre>
            <code
              id="highlighted-output"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            ></code>
          </pre>
          <textarea
            id="text"
            className="cs-input"
            placeholder="put your note here"
            spellCheck="false"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onScroll={syncScroll}
          ></textarea>
        </div>

        <div
          className="flex-wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <div className="code-block" style={{ width: "85%" }}>
            <div className="inner">
              <button className="cs-btn" id="copy-button" onClick={copyUrl}>
                Copy
              </button>
              <pre>
                <code id="generated-url">{generatedUrl}</code>
              </pre>
            </div>
          </div>
          <button
            className="cs-btn"
            style={{ width: "14.5%", height: "35px" }}
            onClick={uploadText}
          >
            Send
          </button>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toastVisible ? "show" : ""}`}>{toast}</div>
      )}
    </div>
  );
}

export default App;
