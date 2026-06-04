import { NextResponse } from "next/server";
import { searchPubMed, fetchArticleSummaries, fetchAbstract } from "@/lib/pubmed";
import {
  buildRAGPrompt,
  extractCitations,
  extractConfidence,
} from "@/lib/ai-gateway";
import type { PubMedArticle } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { message, model } = (await request.json()) as {
      message: string;
      model?: string;
    };

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Step 1: Search PubMed for relevant articles
    const { pmids } = await searchPubMed(message, 5);
    let articles: PubMedArticle[] = [];

    if (pmids.length > 0) {
      articles = await fetchArticleSummaries(pmids);
      // Fetch abstracts for top 3
      const abstracts = await Promise.all(
        pmids.slice(0, 3).map((id) => fetchAbstract(id))
      );
      articles = articles.map((a, i) => ({
        ...a,
        abstract: i < 3 ? abstracts[i] : "",
      }));
    }

    // Step 2: Build RAG prompt
    const { system, user } = buildRAGPrompt(message, articles);

    // Step 3: Call AI Gateway
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const gatewayId = process.env.AI_GATEWAY_ID || "default";

    let aiResponse: string;

    if (accountId && apiToken) {
      const selectedModel = model || "@cf/meta/llama-3.1-8b-instruct";
      const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/workers-ai/v1/chat/completions`;

      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: 2048,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
          { success: false, error: `AI Gateway error: ${err}` },
          { status: 502 }
        );
      }

      const data = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      aiResponse = data.choices?.[0]?.message?.content ?? "No response generated.";
    } else {
      // Demo mode without credentials
      aiResponse = buildDemoResponse(message, articles);
    }

    // Step 4: Extract citations and confidence
    const citations = extractCitations(aiResponse, articles);
    const confidence = extractConfidence(aiResponse);

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        citations,
        confidence,
        sourcesSearched: articles.length,
        model: model || "@cf/meta/llama-3.1-8b-instruct",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

function buildDemoResponse(query: string, articles: PubMedArticle[]): string {
  const refs = articles
    .slice(0, 3)
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title} — ${a.journal} (${a.pubdate}). PMID: ${a.pmid}`
    )
    .join("\n");

  return `## Summary
Based on ${articles.length} retrieved studies related to "${query}", here is what the current evidence suggests.

## Evidence
${articles.length > 0 ? articles.slice(0, 3).map((a, i) => `- [${i + 1}] ${a.title}`).join("\n") : "No relevant studies found in PubMed."}

## Risks
Please consult a qualified healthcare professional for personalized medical advice. This information is for research purposes only.

## References
${refs || "No references available."}

## Confidence Score
${articles.length > 0 ? "65" : "20"}%

*Note: Running in demo mode. Connect AI Gateway credentials for full LLM-powered responses.*`;
}
