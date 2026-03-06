import { useState, useRef } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useAnalyzer() {
  const [clauses,   setClauses]   = useState([]);
  const [summary,   setSummary]   = useState("");
  const [riskScore, setRiskScore] = useState(0);
  const [riskLabel, setRiskLabel] = useState("");
  const [riskColor, setRiskColor] = useState("#64748b");
  const [progress,  setProgress]  = useState({ chunk: 0, total: 0, label: "" });
  const [status,    setStatus]    = useState("idle"); // idle|loading|done|error
  const [error,     setError]     = useState("");
  const [docId,     setDocId]     = useState(null);
  const abortRef = useRef(null);

  function reset() {
    setClauses([]);
    setSummary("");
    setRiskScore(0);
    setRiskLabel("");
    setRiskColor("#64748b");
    setProgress({ chunk: 0, total: 0, label: "" });
    setStatus("idle");
    setError("");
    setDocId(null);
  }

  async function streamAnalysis(url, options) {
    reset();
    setStatus("loading");

    // Allow cancellation
    const controller  = new AbortController();
    abortRef.current  = controller;

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Request failed");
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        const events = buffer.split("\n\n");
        buffer = events.pop(); // keep incomplete event in buffer

        for (const eventStr of events) {
          if (!eventStr.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(eventStr.replace("data: ", ""));
            handleEvent(data);
          } catch (e) {
            console.warn("Failed to parse event:", eventStr);
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
      setStatus("error");
    }
  }

  function handleEvent(data) {
    switch (data.type) {
      case "start":
        setProgress({ chunk: 0, total: data.totalChunks, label: "Starting analysis…" });
        break;

      case "progress":
        setProgress({ chunk: data.chunk, total: data.total, label: data.label });
        break;

      case "clause":
        // Append clause immediately as it arrives
        setClauses(prev => [...prev, data.clause]);
        break;

      case "done":
        setSummary(data.summary);
        setRiskScore(data.riskScore);
        setRiskLabel(data.riskLabel);
        setRiskColor(data.riskColor);
        setDocId(data.id);
        setStatus("done");
        setProgress(p => ({ ...p, label: "Analysis complete!" }));
        break;

      default:
        break;
    }
  }

  function runText(text, docName) {
    return streamAnalysis(`${BASE}/analyze/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, docName }),
    });
  }

  function runFile(file) {
    const form = new FormData();
    form.append("file", file);
    form.append("docName", file.name);
    return streamAnalysis(`${BASE}/analyze/file`, {
      method: "POST",
      body: form,
    });
  }

  function cancel() {
    abortRef.current?.abort();
    setStatus("idle");
  }

  return {
    clauses, summary, riskScore, riskLabel, riskColor,
    progress, status, error, docId,
    runText, runFile, cancel, reset,
  };
}