"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("whisper-large-v3-turbo");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setApiKey(data.groqApiKey || "");
        setModel(data.defaultModel || "whisper-large-v3-turbo");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "API key cannot be empty." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groqApiKey: apiKey, defaultModel: model }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully." });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Settings</h2>
        <p className="text-on-surface-variant text-xs mt-1">
          Configure your Groq API key and transcription preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant p-4 space-y-5">
        <div>
          <h3 className="text-xs font-semibold text-on-surface mb-1">
            Groq API Key
          </h3>
          <p className="text-[11px] text-on-surface-variant mb-2">
            Get your free API key at{" "}
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline"
            >
              console.groq.com
            </a>
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
          />
        </div>

        <div>
          <h3 className="text-xs font-semibold text-on-surface mb-1">
            Default Model
          </h3>
          <p className="text-[11px] text-on-surface-variant mb-2">
            Choose the Whisper model for transcription.
          </p>
          <div className="space-y-1.5">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                model === "whisper-large-v3-turbo"
                  ? "border-secondary bg-secondary/5"
                  : "border-outline-variant hover:bg-surface"
              }`}
            >
              <input
                type="radio"
                name="model"
                value="whisper-large-v3-turbo"
                checked={model === "whisper-large-v3-turbo"}
                onChange={(e) => setModel(e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  model === "whisper-large-v3-turbo"
                    ? "border-secondary"
                    : "border-outline-variant"
                }`}
              >
                {model === "whisper-large-v3-turbo" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-on-surface">
                  Whisper V3 Turbo
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Faster inference — recommended for most use cases
                </p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                model === "whisper-large-v3"
                  ? "border-secondary bg-secondary/5"
                  : "border-outline-variant hover:bg-surface"
              }`}
            >
              <input
                type="radio"
                name="model"
                value="whisper-large-v3"
                checked={model === "whisper-large-v3"}
                onChange={(e) => setModel(e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  model === "whisper-large-v3"
                    ? "border-secondary"
                    : "border-outline-variant"
                }`}
              >
                {model === "whisper-large-v3" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-on-surface">
                  Whisper V3
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Maximum accuracy, supports 90+ languages
                </p>
              </div>
            </label>
          </div>
        </div>

        {message && (
          <div
            className={`px-3 py-2 rounded-lg text-xs font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-secondary text-white rounded-lg py-2.5 text-xs font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
