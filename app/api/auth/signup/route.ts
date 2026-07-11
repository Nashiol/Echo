import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = db
      .prepare(
        "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)"
      )
      .run(firstName, lastName, email, passwordHash);

    const userId = result.lastInsertRowid as number;

    db.prepare(
      "INSERT INTO user_settings (user_id) VALUES (?)"
    ).run(userId);

    const token = await signToken(userId);

    const response = NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );

    response.cookies.set("echo_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
