import { NextResponse } from "next/server";
import type { Citation } from "@/lib/types";

interface ExportMessage {
  role: string;
  content: string;
  citations?: Citation[];
  confidence?: number;
}

export async function POST(request: Request) {
  try {
    const { format, messages, title } = (await request.json()) as {
      format: "markdown" | "citation" | "pdf";
      messages: ExportMessage[];
      title?: string;
    };

    if (!format || !messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Format and messages are required" },
        { status: 400 }
      );
    }

    const docTitle = title || "OpenClaw Medical AI — Research Export";

    if (format === "markdown") {
      const md = buildMarkdown(docTitle, messages);
      return new Response(md, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slugify(docTitle)}.md"`,
        },
      });
    }

    if (format === "citation") {
      const bib = buildCitations(messages);
      return new Response(bib, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slugify(docTitle)}-citations.txt"`,
        },
      });
    }

    if (format === "pdf") {
      const html = buildPdfHtml(docTitle, messages);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slugify(docTitle)}.html"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid format" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Export failed" },
      { status: 500 }
    );
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function buildMarkdown(title: string, messages: ExportMessage[]): string {
  let md = `# ${title}\n\n`;
  md += `*Exported from OpenClaw Medical AI on ${new Date().toISOString().split("T")[0]}*\n\n---\n\n`;

  for (const msg of messages) {
    if (msg.role === "user") {
      md += `## Question\n\n${msg.content}\n\n`;
    } else {
      md += `## Answer\n\n${msg.content}\n\n`;
      if (msg.confidence != null) {
        md += `**Confidence Score:** ${msg.confidence}%\n\n`;
      }
      if (msg.citations && msg.citations.length > 0) {
        md += `### References\n\n`;
        msg.citations.forEach((c, i) => {
          md += `${i + 1}. ${c.authors.join(", ")}. "${c.title}." *${c.journal}* (${c.year}). PMID: ${c.pmid}. ${c.url}\n`;
        });
        md += "\n";
      }
      md += "---\n\n";
    }
  }

  return md;
}

function buildCitations(messages: ExportMessage[]): string {
  const allCitations: Citation[] = [];
  const seenPmids = new Set<string>();

  for (const msg of messages) {
    if (msg.citations) {
      for (const c of msg.citations) {
        if (!seenPmids.has(c.pmid)) {
          seenPmids.add(c.pmid);
          allCitations.push(c);
        }
      }
    }
  }

  if (allCitations.length === 0) return "No citations found in the conversation.";

  let out = `OpenClaw Medical AI — Citation Export\n`;
  out += `Generated: ${new Date().toISOString().split("T")[0]}\n`;
  out += `Total Citations: ${allCitations.length}\n\n`;
  out += `${"=".repeat(60)}\n\n`;

  // APA-style citations
  out += `## APA Format\n\n`;
  allCitations.forEach((c, i) => {
    const authors = c.authors.length > 0 ? c.authors.join(", ") : "Unknown";
    out += `[${i + 1}] ${authors}. (${c.year}). ${c.title}. ${c.journal}. PMID: ${c.pmid}. ${c.url}\n\n`;
  });

  // BibTeX format
  out += `\n${"=".repeat(60)}\n\n## BibTeX Format\n\n`;
  allCitations.forEach((c) => {
    const key = `pmid${c.pmid}`;
    out += `@article{${key},\n`;
    out += `  title = {${c.title}},\n`;
    out += `  author = {${c.authors.join(" and ")}},\n`;
    out += `  journal = {${c.journal}},\n`;
    out += `  year = {${c.year}},\n`;
    out += `  pmid = {${c.pmid}},\n`;
    out += `  url = {${c.url}}\n`;
    out += `}\n\n`;
  });

  return out;
}

function buildPdfHtml(title: string, messages: ExportMessage[]): string {
  let body = "";

  for (const msg of messages) {
    if (msg.role === "user") {
      body += `<div class="question"><h3>Question</h3><p>${escapeHtml(msg.content)}</p></div>`;
    } else {
      body += `<div class="answer"><h3>Answer</h3><div class="content">${escapeHtml(msg.content).replace(/\n/g, "<br>")}</div>`;
      if (msg.confidence != null) {
        body += `<p class="confidence">Confidence: ${msg.confidence}%</p>`;
      }
      if (msg.citations && msg.citations.length > 0) {
        body += `<h4>References</h4><ol>`;
        msg.citations.forEach((c) => {
          body += `<li>${escapeHtml(c.authors.join(", "))}. "${escapeHtml(c.title)}." <em>${escapeHtml(c.journal)}</em> (${escapeHtml(c.year)}). PMID: ${escapeHtml(c.pmid)}. <a href="${escapeHtml(c.url)}">${escapeHtml(c.url)}</a></li>`;
        });
        body += `</ol>`;
      }
      body += `</div><hr>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}
h1{color:#059669;border-bottom:2px solid #059669;padding-bottom:10px}
h3{color:#1e293b;margin-top:24px}
.question{background:#f0fdf4;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #059669}
.answer{margin:16px 0}
.confidence{color:#059669;font-weight:bold}
.content{white-space:pre-wrap}
hr{border:none;border-top:1px solid #e2e8f0;margin:24px 0}
ol{padding-left:20px}
li{margin:8px 0}
a{color:#059669}
.footer{text-align:center;color:#94a3b8;font-size:12px;margin-top:40px}
@media print{body{margin:20px}}
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p style="color:#64748b">Exported from OpenClaw Medical AI on ${new Date().toISOString().split("T")[0]}</p>
${body}
<div class="footer">
<p>Generated by OpenClaw Medical AI &mdash; Research-Grounded Medical Intelligence</p>
<p>This document is for research purposes only. Not a substitute for medical advice.</p>
</div>
<script>window.onload=function(){window.print()}</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
