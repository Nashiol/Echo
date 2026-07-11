import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

interface Recording {
  id: number;
  text: string;
  model: string | null;
  duration: number | null;
  is_favorite: number;
  created_at: string;
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("echo_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const favoritesOnly = url.searchParams.get("favorites") === "true";

    let recordings: Recording[];
    if (favoritesOnly) {
      recordings = db
        .prepare(
          "SELECT id, text, model, duration, is_favorite, created_at FROM recordings WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC"
        )
        .all(payload.userId) as Recording[];
    } else {
      recordings = db
        .prepare(
          "SELECT id, text, model, duration, is_favorite, created_at FROM recordings WHERE user_id = ? ORDER BY created_at DESC"
        )
        .all(payload.userId) as Recording[];
    }

    return NextResponse.json({ recordings });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
