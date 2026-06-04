import { NextResponse } from "next/server";
import { createToken, hashPassword } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/db";

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

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await createUser(id, email, passwordHash, name);

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

    return response;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
