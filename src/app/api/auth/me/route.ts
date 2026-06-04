import { NextResponse } from "next/server";
import { getTokenFromHeaders, verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
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

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.email.split("@")[0],
        plan: "basic",
      },
    },
  });
}
