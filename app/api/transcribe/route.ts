import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

interface UserSettings {
  groq_api_key: string | null;
  default_model: string;
  language: string;
}

export async function POST(request: Request) {
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
      .get(payload.userId) as UserSettings | undefined;

    if (!settings?.groq_api_key) {
      return NextResponse.json(
        {
          error:
            "No API key configured. Please add your Groq API key in Settings.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("file") as File | null;
    const model = (formData.get("model") as string) || settings.default_model;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const groqFormData = new FormData();
    groqFormData.append("file", audioFile, "recording.webm");
    groqFormData.append("model", model);
    groqFormData.append("response_format", "json");

    const language = settings.language || "en";
    if (language !== "auto") {
      groqFormData.append("language", language);
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.groq_api_key}`,
        },
        body: groqFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            errorData?.error?.message ||
            "Transcription failed. Check your API key in Settings.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcript = data.text as string;

    const duration = Number(formData.get("duration")) || null;

    const result = db
      .prepare(
        "INSERT INTO recordings (user_id, text, model, duration) VALUES (?, ?, ?, ?)"
      )
      .run(payload.userId, transcript, model, duration);

    return NextResponse.json({
      text: transcript,
      id: result.lastInsertRowid,
      model,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
