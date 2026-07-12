import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
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

    const settings = db
      .prepare("SELECT groq_api_key, default_model, language FROM user_settings WHERE user_id = ?")
      .get(payload.userId) as {
      groq_api_key: string | null;
      default_model: string;
      language: string;
    } | undefined;

    return NextResponse.json({
      groqApiKey: settings?.groq_api_key || "",
      defaultModel: settings?.default_model || "whisper-large-v3-turbo",
      language: settings?.language || "en",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json();
    const { groqApiKey, defaultModel, language } = body;

    if (!groqApiKey || !groqApiKey.trim()) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const validModels = ["whisper-large-v3", "whisper-large-v3-turbo"];
    const model = validModels.includes(defaultModel)
      ? defaultModel
      : "whisper-large-v3-turbo";

    const validLanguages = [
      "auto", "en", "sw", "es", "fr", "pt", "de", "ja", "zh", "ar",
      "hi", "ko", "it", "nl", "ru", "tr", "pl", "sv", "da", "no", "fi",
    ];
    const lang = validLanguages.includes(language) ? language : "en";

    db.prepare(
      "UPDATE user_settings SET groq_api_key = ?, default_model = ?, language = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
    ).run(groqApiKey.trim(), model, lang, payload.userId);

    return NextResponse.json({ message: "Settings saved" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
