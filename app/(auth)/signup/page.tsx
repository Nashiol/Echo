"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
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
      <h2 className="text-2xl font-bold text-primary mb-2">Create account</h2>
      <p className="text-sm text-on-surface-variant mb-8">
        Start transcribing with Echo
      </p>

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label
              htmlFor="firstName"
              className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-base outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-outline"
              placeholder="Jane"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label
              htmlFor="lastName"
              className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-base outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-outline"
              placeholder="Doe"
            />
          </div>
        </div>

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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 pr-10 rounded-lg border border-outline-variant bg-surface text-on-surface text-base outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-outline"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-sm text-on-surface-variant text-center mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-secondary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
