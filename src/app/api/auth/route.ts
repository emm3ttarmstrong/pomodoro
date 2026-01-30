import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { password } = await request.json();
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  if (password === appPassword) {
    const cookieStore = await cookies();
    cookieStore.set("pomo-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("pomo-auth");

  return NextResponse.json({
    authenticated: authCookie?.value === "authenticated",
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("pomo-auth");
  return NextResponse.json({ success: true });
}
