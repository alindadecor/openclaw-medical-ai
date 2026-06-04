import type { Citation, PubMedArticle } from "./types";

const MEDICAL_SYSTEM_PROMPT = `You are OpenClaw Medical Research AI.

Rules:
1. Never fabricate medical facts.
2. Always retrieve evidence from connected sources before answering.
3. Cite every medical claim using [1], [2], etc.
4. Show publication date for citations.
5. Distinguish between: Evidence, Hypothesis, Opinion.
6. If evidence is insufficient, explicitly say: "Current evidence is insufficient."
7. For clinical questions: Provide summary, evidence, risks, references.
8. For drug questions: Mechanism of action, clinical trial status, FDA approval status, safety concerns.
9. For research questions: PubMed references, trial identifiers, supporting and contradictory studies.
10. Never provide diagnosis. Never replace physician judgement.

Output format:
## Summary
[concise answer]

## Evidence
[supporting evidence with citations]

## Risks
[relevant risks if applicable]

## References
[numbered list]

## Confidence Score
[0-100]% based on evidence quality`;

export function buildRAGPrompt(
  question: string,
  articles: PubMedArticle[]
): { system: string; user: string } {
  const context = articles
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title}\nAuthors: ${a.authors.join(", ")}\nJournal: ${a.journal} (${a.pubdate})\nPMID: ${a.pmid}\nAbstract: ${a.abstract || "Not available"}\n`
    )
    .join("\n---\n");

  return {
    system: MEDICAL_SYSTEM_PROMPT,
    user: `Based on the following retrieved evidence, answer the user's question.

Retrieved Evidence:
${context || "No evidence retrieved. State this clearly in your response."}

User Question: ${question}`,
  };
}

export function extractCitations(
  text: string,
  articles: PubMedArticle[]
): Citation[] {
  const cited = new Set<number>();
  const regex = /\[(\d+)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    cited.add(parseInt(match[1], 10));
  }

  return Array.from(cited)
    .filter((i) => i > 0 && i <= articles.length)
    .map((i) => {
      const a = articles[i - 1];
      return {
        id: `cite-${a.pmid}`,
        title: a.title,
        authors: a.authors,
        journal: a.journal,
        year: a.pubdate,
        pmid: a.pmid,
        url: a.url,
        snippet: a.abstract?.substring(0, 200) || "",
      };
    });
}

export function extractConfidence(text: string): number {
  const match = text.match(/(\d{1,3})%/);
  return match ? Math.min(parseInt(match[1], 10), 100) : 50;
}
