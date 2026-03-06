import jsPDF from "jspdf";

const RISK_COLORS = {
  High:   [239, 68,  68],
  Medium: [245, 158, 11],
  Low:    [34,  197, 94],
};

export async function exportToPdf(results) {
  const pdf      = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W        = 210; // A4 width mm
  const margin   = 16;
  const maxWidth = W - margin * 2;
  let   y        = margin;

  // ── Helper functions ──────────────────────────────────────────────
  const line = (extra = 0) => { y += 4 + extra; };

  const text = (str, x, fontSize = 10, color = [30, 41, 59], bold = false) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    const lines = pdf.splitTextToSize(String(str), maxWidth - (x - margin));
    pdf.text(lines, x, y);
    y += lines.length * (fontSize * 0.4) + 1;
  };

  const checkPage = (needed = 20) => {
    if (y + needed > 280) { pdf.addPage(); y = margin; }
  };

  const badge = (label, riskLevel) => {
    const [r, g, b] = RISK_COLORS[riskLevel] || [100, 116, 139];
    pdf.setFillColor(r, g, b);
    pdf.roundedRect(margin, y, 22, 6, 2, 2, "F");
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text(label.toUpperCase(), margin + 2, y + 4.2);
    y += 8;
  };

  // ── Page 1: Cover ─────────────────────────────────────────────────
  // Header bar
  pdf.setFillColor(99, 102, 241);
  pdf.rect(0, 0, W, 40, "F");

  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.text("ClauseGuard", margin, 18);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("AI Contract Risk Analysis Report", margin, 26);

  pdf.setFontSize(9);
  pdf.text(new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  }), margin, 34);

  y = 52;

  // Doc name
  text(results.docName, margin, 16, [30, 41, 59], true);
  line();

  // Risk score box
  const [sr, sg, sb] = results.riskColor
    ? results.riskColor.match(/\w\w/g).map(x => parseInt(x, 16))
    : [100, 116, 139];

  pdf.setFillColor(sr, sg, sb, 0.1);
  pdf.setDrawColor(sr, sg, sb);
  pdf.roundedRect(margin, y, maxWidth, 24, 4, 4, "FD");

  pdf.setFontSize(28);
  pdf.setTextColor(sr, sg, sb);
  pdf.setFont("helvetica", "bold");
  pdf.text(String(results.riskScore), margin + 6, y + 16);

  pdf.setFontSize(12);
  pdf.text(results.riskLabel, margin + 22, y + 10);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 116, 139);
  pdf.text("OVERALL RISK SCORE", margin + 22, y + 17);

  y += 30;

  // Counts row
  const lvls = [
    ["High Risk",   results.clauses.filter(c => c.riskLevel === "High").length,   [239,68,68]],
    ["Medium Risk", results.clauses.filter(c => c.riskLevel === "Medium").length, [245,158,11]],
    ["Low Risk",    results.clauses.filter(c => c.riskLevel === "Low").length,    [34,197,94]],
    ["Total Flags", results.clauses.length,                                        [99,102,241]],
  ];

  const boxW = (maxWidth - 9) / 4;
  lvls.forEach(([label, count, color], i) => {
    const x = margin + i * (boxW + 3);
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.roundedRect(x, y, boxW, 18, 3, 3, "F");
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(count), x + boxW / 2, y + 10, { align: "center" });
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(label.toUpperCase(), x + boxW / 2, y + 15, { align: "center" });
  });

  y += 24;

  // Executive summary
  text("Executive Summary", margin, 12, [30,41,59], true);
  line(-2);
  text(results.summary, margin, 9, [71,85,105]);
  line(2);

  // ── Clause pages ──────────────────────────────────────────────────
  const sorted = [...results.clauses].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3);
  });

  text("Identified Risk Clauses", margin, 13, [30,41,59], true);
  line();

  sorted.forEach((clause, i) => {
    checkPage(50);

    // Clause number + risk badge
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Clause ${i + 1} · ${clause.category}`, margin, y);
    y += 5;

    badge(clause.riskLevel, clause.riskLevel);

    // Original text
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    pdf.setFont("helvetica", "italic");
    const quote = `"${(clause.originalText || "").substring(0, 220)}${
      (clause.originalText || "").length > 220 ? "…" : ""}"`;
    const qLines = pdf.splitTextToSize(quote, maxWidth);
    pdf.text(qLines, margin, y);
    y += qLines.length * 3.8 + 2;

    checkPage(20);

    // Reasoning
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Why it's risky:", margin, y);
    y += 4;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    const rLines = pdf.splitTextToSize(clause.reasoning || "", maxWidth);
    pdf.text(rLines, margin, y);
    y += rLines.length * 3.8 + 2;

    checkPage(20);

    // Suggested wording
    pdf.setFillColor(240, 253, 244);
    const swLines = pdf.splitTextToSize(clause.suggestedWording || "", maxWidth - 8);
    const boxH    = swLines.length * 3.8 + 8;
    pdf.roundedRect(margin, y, maxWidth, boxH, 2, 2, "F");
    pdf.setFontSize(7);
    pdf.setTextColor(21, 128, 61);
    pdf.setFont("helvetica", "bold");
    pdf.text("✓ SUGGESTED FIX", margin + 3, y + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(22, 101, 52);
    pdf.text(swLines, margin + 3, y + 9);
    y += boxH + 6;

    // Divider
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, y, W - margin, y);
    y += 5;
  });

  // ── Footer on each page ───────────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.setFont("helvetica", "normal");
    pdf.text(`ClauseGuard · AI Risk Report · Page ${i} of ${totalPages}`,
      W / 2, 292, { align: "center" });
  }

  pdf.save(`${results.docName.replace(/\.[^.]+$/, "")}_risk_report.pdf`);
}