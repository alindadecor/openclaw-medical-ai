import { NextResponse } from "next/server";
import { getTokenFromHeaders, verifyToken } from "@/lib/auth";
import { getUserSessions } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId") ?? undefined;

    const { results } = await getUserSessions(payload.userId, projectId);

    return NextResponse.json({ success: true, data: { sessions: results } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}
