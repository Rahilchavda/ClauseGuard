import { useState, useRef, useCallback } from "react";

export default function UploadZone({ onFilesReady, loading }) {
  const [dragOver,  setDragOver]  = useState(false);
  const [files,     setFiles]     = useState([]);
  const fileRef = useRef();

  const readFile = async (file) => {
    if (file.type === "application/pdf") {
      if (!window.pdfjsLib) {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        );
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const buffer  = await file.arrayBuffer();
      const pdf     = await window.pdfjsLib.getDocument({ data: buffer }).promise;
      let   text    = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(x => x.str).join(" ") + "\n";
      }
      return { name: file.name, text, size: file.size };
    } else {
      const text = await file.text();
      return { name: file.name, text, size: file.size };
    }
  };

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const handleFiles = useCallback(async (newFiles) => {
    const validFiles = Array.from(newFiles).filter(f =>
      f.type === "application/pdf" ||
      f.type === "text/plain" ||
      f.name.endsWith(".md") ||
      f.name.endsWith(".txt")
    );

    if (!validFiles.length) return;

    const processed = await Promise.all(validFiles.map(readFile));
    setFiles(prev => {
      const merged = [...prev, ...processed];
      onFilesReady(merged);
      return merged;
    });
  }, [onFilesReady]);

  const removeFile = (index) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesReady(updated);
      return updated;
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: `2px dashed ${dragOver ? "#6366f1" : files.length ? "#22c55e" : "#1e3a5f"}`,
          borderRadius: "20px", padding: "40px 24px",
          textAlign: "center", cursor: "pointer",
          background: dragOver ? "rgba(99,102,241,0.08)"
                    : files.length ? "rgba(34,197,94,0.04)"
                    : "rgba(255,255,255,0.02)",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={fileRef} type="file" style={{ display: "none" }}
          accept=".pdf,.txt,.md" multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>
          {files.length ? "✅" : "📂"}
        </div>
        <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "6px",
                      color: files.length ? "#22c55e" : "#f8fafc" }}>
          {files.length
            ? `${files.length} file${files.length > 1 ? "s" : ""} ready`
            : "Drop files here"}
        </div>
        <div style={{ fontSize: "12px", color: "#475569" }}>
          PDF or TXT · Multiple files supported · Click to browse
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: "12px", display: "flex",
                      flexDirection: "column", gap: "8px" }}>
          {files.map((file, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #1e3a5f"
            }}>
              <span style={{ fontSize: "18px" }}>
                {file.name.endsWith(".pdf") ? "📄" : "📝"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "13px",
                              color: "#f8fafc", overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </div>
                <div style={{ fontSize: "11px", color: "#475569" }}>
                  {file.text.split(/\s+/).length.toLocaleString()} words ·{" "}
                  {formatSize(file.size)}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                style={{
                  background: "none", border: "none", color: "#475569",
                  cursor: "pointer", fontSize: "16px", padding: "4px",
                  borderRadius: "6px", transition: "color 0.15s"
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}