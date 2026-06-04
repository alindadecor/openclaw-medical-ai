"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  FileDown,
  Quote,
} from "lucide-react";
import type { PubMedArticle } from "@/lib/types";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PubMedArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/search/pubmed?q=${encodeURIComponent(query)}&max=15`
      );
      const data = (await res.json()) as {
        success: boolean;
        data?: { articles: PubMedArticle[]; total: number };
      };
      if (data.success && data.data) {
        setResults(data.data.articles);
        setTotal(data.data.total);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  function exportResults(format: "markdown" | "citation") {
    if (results.length === 0) return;

    if (format === "markdown") {
      let md = `# PubMed Search Results: "${query}"\n\n`;
      md += `*${total.toLocaleString()} total results | ${results.length} shown*\n\n---\n\n`;
      results.forEach((a, i) => {
        md += `## ${i + 1}. ${a.title}\n\n`;
        md += `**Authors:** ${a.authors.join(", ")}\n\n`;
        md += `**Journal:** ${a.journal} (${a.pubdate})\n\n`;
        md += `**PMID:** ${a.pmid}${a.doi ? ` | **DOI:** ${a.doi}` : ""}\n\n`;
        md += `**Link:** ${a.url}\n\n---\n\n`;
      });
      downloadFile(md, `pubmed-search-${slugify(query)}.md`, "text/markdown");
    } else {
      let bib = `PubMed Search Citations: "${query}"\nGenerated: ${new Date().toISOString().split("T")[0]}\nTotal: ${results.length} articles\n\n`;
      results.forEach((a, i) => {
        bib += `[${i + 1}] ${a.authors.join(", ")}. "${a.title}." ${a.journal} (${a.pubdate}). PMID: ${a.pmid}. ${a.url}\n\n`;
      });
      bib += `\n--- BibTeX ---\n\n`;
      results.forEach((a) => {
        bib += `@article{pmid${a.pmid},\n  title = {${a.title}},\n  author = {${a.authors.join(" and ")}},\n  journal = {${a.journal}},\n  year = {${a.pubdate}},\n  pmid = {${a.pmid}},\n  url = {${a.url}}\n}\n\n`;
      });
      downloadFile(bib, `pubmed-citations-${slugify(query)}.txt`, "text/plain");
    }
  }

  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Research Search
          </h2>
          <p className="text-gray-500 text-sm">
            Search PubMed for biomedical literature. Access millions of
            peer-reviewed articles.
          </p>
        </div>
        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => exportResults("markdown")}
            >
              <FileDown className="w-3.5 h-3.5 mr-1" />
              Export MD
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => exportResults("citation")}
            >
              <Quote className="w-3.5 h-3.5 mr-1" />
              Export Citations
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PubMed (e.g., CRISPR gene therapy, GLP-1 receptor agonist)..."
            className="pl-10 h-11"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "mRNA vaccine",
          "CRISPR clinical trial",
          "GLP-1 obesity",
          "immunotherapy cancer",
          "Alzheimer treatment 2024",
        ].map((q) => (
          <button
            key={q}
            onClick={() => {
              setQuery(q);
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Searching PubMed...</p>
        </div>
      )}

      {!loading && searched && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {total.toLocaleString()} results for &quot;{query}&quot;
            </p>
            <Badge variant="outline">{results.length} shown</Badge>
          </div>

          <div className="space-y-4">
            {results.map((article) => (
              <Card
                key={article.pmid}
                className="border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base leading-snug">
                      {article.title}
                    </CardTitle>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Badge
                        variant="outline"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        PubMed
                      </Badge>
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {article.authors.slice(0, 3).join(", ")}
                      {article.authors.length > 3 && " et al."}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {article.journal}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.pubdate}
                    </span>
                    {article.doi && (
                      <span className="text-gray-400">
                        DOI: {article.doi}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    PMID: {article.pmid}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found. Try different search terms.</p>
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500 mb-2">
            Search Biomedical Literature
          </p>
          <p className="text-sm">
            Enter a medical topic to search PubMed&apos;s database of over 36
            million citations.
          </p>
        </div>
      )}
    </div>
  );
}
