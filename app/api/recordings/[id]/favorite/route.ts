import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("echo_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recording = db
      .prepare("SELECT id, is_favorite FROM recordings WHERE id = ? AND user_id = ?")
      .get(id, payload.userId) as { id: number; is_favorite: number } | undefined;

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    const newFavorite = recording.is_favorite === 0 ? 1 : 0;

    db.prepare(
      "UPDATE recordings SET is_favorite = ? WHERE id = ? AND user_id = ?"
    ).run(newFavorite, id, payload.userId);

    return NextResponse.json({ is_favorite: newFavorite });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
