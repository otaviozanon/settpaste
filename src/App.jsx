import { useState, useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/base16/solarized-dark.css";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState(
    "https://settpaste.vercel.app/paste/"
  );

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

  async function uploadText() {
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", blob, "paste.txt");

    try {
      const proxyUrl = "https://api.allorigins.win/raw?url=https://0x0.st";
      const res = await fetch(proxyUrl, {
        method: "POST",
        body: formData,
      });
      const url = await res.text();
      const id = url.trim().split("/").pop();
      setGeneratedUrl(
        `${window.location.origin}${window.location.pathname}?id=${id}`
      );
    } catch (err) {
      setGeneratedUrl("Error: " + err.message);
    }
  }

  async function fetchPaste(pasteId) {
    try {
      const res = await fetch(
        `https://api.allorigins.win/raw?url=https://0x0.st/${pasteId}`
      );
      if (!res.ok) throw new Error("not found");
      const t = await res.text();
      setText(t);
    } catch (err) {
      setText("Error loading paste: " + err.message);
    }
  }

  function copyUrl() {
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

        <div className="flex-wrapper">
          <div className="code-block">
            <div className="inner">
              <button className="cs-btn" onClick={copyUrl}>
                Copy
              </button>
              <pre>
                <code id="generated-url">{generatedUrl}</code>
              </pre>
            </div>
          </div>
          <button className="cs-btn send" onClick={uploadText}>
            Send
          </button>
        </div>
      </div>

      <a
        id="sharex-cfg"
        href="https://raw.githubusercontent.com/otaviozanon/settpaste/main/settpaste.sxcu"
        className="cs-btn"
      >
        get sharex config
      </a>
    </div>
  );
}

export default App;
