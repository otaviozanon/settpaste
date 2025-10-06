import { useState, useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/base16/solarized-dark.css";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  // 🔹 Atualiza o destaque de sintaxe
  useEffect(() => {
    if (!text.trim()) return setHighlighted("");
    const result = hljs.highlightAuto(text);
    setHighlighted(result.value);
  }, [text]);

  // 🔹 Envia o texto para o Pastebin
  async function uploadText() {
    if (!text.trim()) return;

    try {
      const res = await fetch("/api/pastebin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title: "Settpaste Note" }),
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || "Failed to create paste");

      // Retorna link direto do Pastebin
      setGeneratedUrl(data.url);
    } catch (err) {
      setGeneratedUrl("Error: " + err.message);
    }
  }

  function copyUrl() {
    if (!generatedUrl) return alert("No URL to copy");
    navigator.clipboard.writeText(generatedUrl);
    alert("URL copied!");
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
    </div>
  );
}

export default App;
