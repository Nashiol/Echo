"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-surface border border-outline-variant rounded-3xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-primary mb-2">Welcome back</h2>
      <p className="text-sm text-on-surface-variant mb-8">
        Sign in to your Echo account
      </p>

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-base outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-outline"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-base outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-outline"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>

      <p className="text-sm text-on-surface-variant text-center mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-secondary font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
