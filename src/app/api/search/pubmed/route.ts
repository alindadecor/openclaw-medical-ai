import { NextResponse } from "next/server";
import { searchPubMed, fetchArticleSummaries } from "@/lib/pubmed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const max = parseInt(searchParams.get("max") || "10", 10);

  if (!query) {
    return NextResponse.json(
      { success: false, error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const { pmids, total } = await searchPubMed(query, Math.min(max, 20));
    const articles = await fetchArticleSummaries(pmids);

    return NextResponse.json({
      success: true,
      data: { articles, total, query },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
