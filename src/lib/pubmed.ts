import type { PubMedArticle } from "./types";

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function searchPubMed(
  query: string,
  maxResults = 10
): Promise<{ pmids: string[]; total: number }> {
  const url = `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}&sort=relevance`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    esearchresult: { idlist: string[]; count: string };
  };
  return {
    pmids: data.esearchresult.idlist,
    total: parseInt(data.esearchresult.count, 10),
  };
}

export async function fetchArticleSummaries(
  pmids: string[]
): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  const url = `${BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json`;
  const res = await fetch(url);
  const data = (await res.json()) as { result: Record<string, RawSummary> & { uids: string[] } };
  const articles: PubMedArticle[] = [];
  for (const uid of data.result.uids) {
    const r = data.result[uid];
    if (!r) continue;
    articles.push({
      pmid: uid,
      title: r.title ?? "",
      authors: (r.authors ?? []).map(
        (a: { name: string }) => a.name
      ),
      journal: r.fulljournalname ?? r.source ?? "",
      pubdate: r.pubdate ?? "",
      abstract: "",
      doi: (r.articleids ?? []).find(
        (a: { idtype: string; value: string }) => a.idtype === "doi"
      )?.value,
      url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
    });
  }
  return articles;
}

export async function fetchAbstract(pmid: string): Promise<string> {
  const url = `${BASE}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text`;
  const res = await fetch(url);
  return res.text();
}

interface RawSummary {
  title?: string;
  authors?: { name: string }[];
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  articleids?: { idtype: string; value: string }[];
}
