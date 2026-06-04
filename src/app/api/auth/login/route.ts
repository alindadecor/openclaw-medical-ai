import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // In production, verify against D1:
    // const { env } = getCloudflareContext();
    // const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    // if (!user || !(await verifyPassword(password, user.password_hash))) ...

    const id = crypto.randomUUID();
    const token = await createToken({ userId: id, email });

    const response = NextResponse.json({
      success: true,
      data: { user: { id, email, name: email.split("@")[0], plan: "basic" }, token },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
