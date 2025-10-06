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

  // 🔹 Carrega um paste se houver ?id=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pasteId = params.get("id");
    if (pasteId) fetchPaste(pasteId);
  }, []);

  // 🔹 Envia o texto para o Pastebin via API route
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

      setGeneratedUrl(data.url); // link do Pastebin
      alert("Paste criado com sucesso!");
    } catch (err) {
      setGeneratedUrl("Error: " + err.message);
    }
  }

  // 🔹 Busca paste pelo ID (caso queira exibir localmente)
  async function fetchPaste(pasteId) {
    try {
      const res = await fetch(`/api/fetch/${pasteId}`);
      if (!res.ok) throw new Error("not found");
      const t = await res.json();
      setText(t.text);
    } catch (err) {
      setText("Error loading paste: " + err.message);
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
      <h1>glockpaste</h1>

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
            placeholder="put your glock here"
            spellCheck="false"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onScroll={syncScroll}
          ></textarea>
        </div>

        <div className="flex-wrapper">
          <div className="code-block">
            <div className="inner">
              <button className="cs-btn" onClick={copyUrl}>
                Copy
              </button>
              <input
                type="text"
                value={generatedUrl}
                readOnly
                className="generated-url-input"
              />
            </div>
          </div>
          <button className="cs-btn send" onClick={uploadText}>
            Send
          </button>
        </div>
      </div>

      <a
        id="sharex-cfg"
        href="https://raw.githubusercontent.com/girlglock/girlglock/refs/heads/main/paste/glockpaste.sxcu"
        className="cs-btn"
      >
        get sharex config
      </a>
    </div>
  );
}

export default App;
