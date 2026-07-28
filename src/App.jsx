import { useState, useEffect, useRef, useCallback } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";
import "highlight.js/styles/base16/solarized-dark.css";
import "./App.css";

// Registra só linguagens comuns (reduz bundle de 1.1MB → ~200KB)
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("bash", bash);

const PROVIDERS = [
  { endpoint: "/api/paste-rs", name: "paste.rs" },
  { endpoint: "/api/safenote", name: "SafeNote" },
];

const TOAST_MESSAGES = {
  errorSending: "Error sending!",
  urlCopied: "URL copied!",
  noUrl: "No URL to copy",
  emptyNote: "Empty note!",
};

function App() {
  const [text, setText] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const highlightRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    if (!text.trim()) {
      setHighlighted("");
      return;
    }
    const result = hljs.highlightAuto(text);
    setHighlighted(result.value);
  }, [text]);

  // Reseta provider index quando texto mudar
  useEffect(() => {
    setCurrentProviderIndex(0);
  }, [text]);

  // Cleanup timeout ao desmontar
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(message);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  // Upload genérico (DRY)
  const uploadToHost = useCallback(
    async (endpoint, payload, successMessage) => {
      setIsLoading(true);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
        const data = await res.json();
        if (!data.url) throw new Error("No URL returned");
        setGeneratedUrl(data.url);
        showToast(successMessage);
        return true;
      } catch (err) {
        setGeneratedUrl("Error: " + err.message);
        showToast(TOAST_MESSAGES.errorSending);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  // Envia para o provider atual
  const handleSend = useCallback(async () => {
    if (!text.trim()) return showToast(TOAST_MESSAGES.emptyNote);

    const provider = PROVIDERS[currentProviderIndex];
    const success = await uploadToHost(
      provider.endpoint,
      { text },
      `Sent to ${provider.name}!`,
    );

    if (success) {
      // Avança para o próximo provider (rotação circular)
      setCurrentProviderIndex((prev) => (prev + 1) % PROVIDERS.length);
    }
  }, [text, currentProviderIndex, showToast, uploadToHost]);

  const copyUrl = useCallback(() => {
    if (!generatedUrl) return showToast(TOAST_MESSAGES.noUrl);
    navigator.clipboard.writeText(generatedUrl);
    showToast(TOAST_MESSAGES.urlCopied);
  }, [generatedUrl, showToast]);

  const syncScroll = useCallback((e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  return (
    <div className="centered">
      <h1>settpaste</h1>

      <div id="paste-form">
        <div className="highlight-wrapper" id="highlight-wrapper">
          <pre>
            <code
              ref={highlightRef}
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
            aria-label="Paste content"
          ></textarea>
        </div>

        <div className="flex-wrapper">
          <div className="code-block url-output">
            <div className="inner">
              <button
                className="cs-btn"
                id="copy-button"
                onClick={copyUrl}
                disabled={!generatedUrl}
                aria-label="Copy generated URL"
              >
                Copy
              </button>
              <pre>
                <code id="generated-url">{generatedUrl}</code>
              </pre>
            </div>
          </div>

          <button
            className="cs-btn send-button"
            onClick={handleSend}
            disabled={isLoading}
            aria-label={`Send to ${PROVIDERS[currentProviderIndex].name}`}
          >
            {isLoading
              ? "..."
              : currentProviderIndex === 0
                ? "Send"
                : `Send to ${PROVIDERS[currentProviderIndex].name}`}
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
