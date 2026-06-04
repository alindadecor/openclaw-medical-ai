import { NextResponse } from "next/server";
import { getTokenFromHeaders, verifyToken, hashPassword } from "@/lib/auth";
import { createApiKey, getUserApiKeys, deleteApiKey } from "@/lib/db";

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

    const { results } = await getUserApiKeys(payload.userId);
    const keys = results.map((k) => ({
      id: k.id,
      name: k.name,
      preview: `oc_live_****...${k.key_hash.slice(-4)}`,
      lastUsed: k.last_used,
      created: k.created_at,
    }));

    return NextResponse.json({ success: true, data: { keys } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const { name } = (await request.json()) as { name: string };
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Key name is required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const rawKey = `oc_live_${crypto.randomUUID().replace(/-/g, "")}`;
    const keyHash = await hashPassword(rawKey);

    await createApiKey(id, payload.userId, keyHash, name);

    return NextResponse.json({
      success: true,
      data: { id, name, key: rawKey },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Key ID is required" },
        { status: 400 }
      );
    }

    await deleteApiKey(id, payload.userId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete key" },
      { status: 500 }
    );
  }
}
