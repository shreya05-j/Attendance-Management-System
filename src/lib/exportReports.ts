/**
 * Export reports — lightweight client-side implementations.
 * Avoids heavy dependencies (jspdf, xlsx) by using browser-native APIs.
 */

export interface ReportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ReportConfig {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: Record<string, any>[];
  filename?: string;
  meta?: Record<string, string>;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── CSV Export ─────────────────────────────────────────
export function exportToCSV(config: ReportConfig): void {
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines: string[] = [];

  // Meta as comments
  if (config.title) lines.push(`# ${config.title}`);
  if (config.subtitle) lines.push(`# ${config.subtitle}`);
  if (config.meta) {
    for (const [k, v] of Object.entries(config.meta)) {
      lines.push(`# ${k}: ${v}`);
    }
  }
  if (lines.length > 0) lines.push("");

  // Headers
  lines.push(config.columns.map((c) => escape(c.header)).join(","));
  // Rows
  config.rows.forEach((row) => {
    lines.push(config.columns.map((c) => escape(row[c.key])).join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${config.filename || "report"}.csv`);
}

// ─── Excel Export (XML SpreadsheetML — opens in Excel) ──
export function exportToExcel(config: ReportConfig): void {
  // Build an Excel-compatible HTML table. Excel reads .xls as HTML.
  const escape = (v: any) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const styles = `
    <style>
      table { border-collapse: collapse; font-family: Calibri, Arial; }
      th { background: #6366f1; color: white; padding: 10px; border: 1px solid #4338ca; font-weight: bold; }
      td { padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 11pt; }
      tr:nth-child(even) td { background: #f8fafc; }
      h1 { color: #1f2937; font-family: Calibri, Arial; }
      .meta { color: #6b7280; font-size: 10pt; margin: 4px 0; }
    </style>
  `;

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="UTF-8">${styles}</head><body>`;
  html += `<h1>${escape(config.title)}</h1>`;
  if (config.subtitle) html += `<p class="meta"><i>${escape(config.subtitle)}</i></p>`;
  if (config.meta) {
    for (const [k, v] of Object.entries(config.meta)) {
      html += `<p class="meta"><strong>${escape(k)}:</strong> ${escape(v)}</p>`;
    }
  }
  html += `<br/><table>`;
  html += `<thead><tr>`;
  config.columns.forEach((c) => { html += `<th>${escape(c.header)}</th>`; });
  html += `</tr></thead><tbody>`;
  config.rows.forEach((row) => {
    html += `<tr>`;
    config.columns.forEach((c) => { html += `<td>${escape(row[c.key])}</td>`; });
    html += `</tr>`;
  });
  html += `</tbody></table></body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  downloadBlob(blob, `${config.filename || "report"}.xls`);
}

// ─── PDF Export (uses browser's native print → save as PDF) ──
export function exportToPDF(config: ReportConfig): void {
  const escape = (v: any) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const styles = `
    <style>
      @page { size: A4 landscape; margin: 15mm; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: #1f2937; margin: 0; padding: 24px;
      }
      .header {
        display: flex; justify-content: space-between; align-items: flex-start;
        border-bottom: 3px solid #6366f1; padding-bottom: 12px; margin-bottom: 18px;
      }
      h1 { color: #4f46e5; font-size: 22pt; margin: 0; font-weight: 700; }
      .subtitle { color: #6b7280; font-size: 10pt; margin-top: 4px; }
      .brand {
        text-align: right; font-size: 10pt; color: #6b7280;
      }
      .brand strong { color: #4f46e5; display: block; font-size: 11pt; }
      .meta-grid {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
        background: #f8fafc; padding: 10px 14px; border-radius: 8px;
        margin-bottom: 16px; font-size: 9pt;
      }
      .meta-grid div span { color: #6b7280; display: block; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; }
      .meta-grid div strong { color: #1f2937; font-size: 10pt; }
      table {
        width: 100%; border-collapse: collapse; font-size: 9pt;
      }
      th {
        background: #4f46e5; color: white; padding: 8px 10px;
        text-align: left; font-weight: 600; font-size: 8pt;
        text-transform: uppercase; letter-spacing: 0.03em;
      }
      td {
        padding: 6px 10px; border-bottom: 1px solid #e5e7eb;
      }
      tr:nth-child(even) td { background: #f9fafb; }
      .footer {
        position: fixed; bottom: 8mm; left: 15mm; right: 15mm;
        text-align: center; font-size: 8pt; color: #9ca3af;
        border-top: 1px solid #e5e7eb; padding-top: 8px;
      }
      @media print {
        body { padding: 0; }
        .no-print { display: none !important; }
      }
    </style>
  `;

  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escape(config.title)}</title>${styles}</head><body>`;
  html += `<div class="header">`;
  html += `<div><h1>${escape(config.title)}</h1>`;
  if (config.subtitle) html += `<div class="subtitle">${escape(config.subtitle)}</div>`;
  html += `</div>`;
  html += `<div class="brand"><strong>AMS</strong>Jagran Lakecity University<br/>${new Date().toLocaleString()}</div>`;
  html += `</div>`;

  if (config.meta) {
    html += `<div class="meta-grid">`;
    for (const [k, v] of Object.entries(config.meta)) {
      html += `<div><span>${escape(k)}</span><strong>${escape(v)}</strong></div>`;
    }
    html += `</div>`;
  }

  html += `<table><thead><tr>`;
  config.columns.forEach((c) => { html += `<th>${escape(c.header)}</th>`; });
  html += `</tr></thead><tbody>`;
  config.rows.forEach((row) => {
    html += `<tr>`;
    config.columns.forEach((c) => { html += `<td>${escape(row[c.key])}</td>`; });
    html += `</tr>`;
  });
  html += `</tbody></table>`;

  html += `<div class="footer">AMS — JLU Attendance Management System · ${config.rows.length} records</div>`;

  // Auto-print script
  html += `<script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 500);
      }, 300);
    };
  </script>`;
  html += `</body></html>`;

  // Open in a new window and trigger print dialog (user can "Save as PDF")
  const printWindow = window.open("", "_blank", "width=1024,height=768");
  if (!printWindow) {
    alert("Please allow popups to export as PDF");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
}
