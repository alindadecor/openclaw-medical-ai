import { NextResponse } from "next/server";
import { createToken, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name } = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const password_hash = await hashPassword(password);
    const token = await createToken({ userId: id, email });

    const response = NextResponse.json({
      success: true,
      data: { user: { id, email, name, plan: "basic" }, token },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // In production, save to D1:
    // const { env } = getCloudflareContext();
    // await env.DB.prepare("INSERT INTO users ...").bind(...).run();
    void password_hash;

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
