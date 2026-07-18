"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, X, Pencil } from "lucide-react";
import MicButton from "@/components/MicButton";
import ModelSelector from "@/components/ModelSelector";

type MicState = "idle" | "listening" | "processing";

export default function DashboardPage() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [model, setModel] = useState("whisper-large-v3-turbo");
  const [language, setLanguage] = useState("en");
  const [transcript, setTranscript] = useState("");
  const [recordingId, setRecordingId] = useState<number | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultModel) setModel(data.defaultModel);
        if (data.language) setLanguage(data.language);
      })
      .catch(() => {});
  }, []);

  const handleClick = async () => {
    if (micState === "listening") {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (micState === "processing") return;

    setError(null);
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        setMicState("processing");

        try {
          const formData = new FormData();
          formData.append("file", blob, "recording.webm");
          formData.append("model", model);
          formData.append("duration", String(duration));

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Transcription failed.");
          } else {
            setTranscript(data.text);
            setRecordingId(data.id);
          }
        } catch {
          setError("Network error. Please try again.");
        } finally {
          setMicState("idle");
        }
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setMicState("listening");
    } catch {
      setError("Microphone access denied. Please allow mic access in your browser.");
    }
  };

  const handleCopy = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTranscript("");
    setError(null);
    setIsEditing(false);
    setRecordingId(null);
    setOriginalText("");
  };

  const handleEdit = () => {
    setOriginalText(transcript);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTranscript(originalText);
    setIsEditing(false);
    setOriginalText("");
  };

  const handleSave = async () => {
    if (!recordingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/recordings/${recordingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });
      if (res.ok) {
        setIsEditing(false);
        setOriginalText("");
      }
    } catch {
      // stay in edit mode on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="flex flex-col items-center justify-center pt-6 md:pt-0 pb-4 gap-3">
        <div className="w-full max-w-xs mb-1">
          <ModelSelector value={model} onChange={setModel} disabled={micState !== "idle"} />
          <p className="text-[10px] text-on-surface-variant text-center mt-1">
            Language: {language === "auto" ? "Auto-detect" : language.toUpperCase()}
          </p>
        </div>

        <p className="text-sm text-on-surface-variant">
          {micState === "idle"
            ? "Tap the mic to start recording"
            : micState === "listening"
              ? "Listening... tap to stop"
              : "Transcribing..."}
        </p>

        <MicButton state={micState} onClick={handleClick} />

        {error && (
          <p className="text-xs text-red-500 mt-1 text-center max-w-sm">{error}</p>
        )}
      </section>

      <section className="max-w-2xl mx-auto w-full bg-surface border border-outline-variant rounded-2xl p-4 flex flex-col gap-3 transition-colors hover:border-secondary shadow-sm">
        <div className="flex justify-between items-center border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            {micState === "listening" && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
            {micState === "processing" && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            )}
            <h2 className="text-sm font-semibold text-primary">
              {micState === "idle" && transcript
                ? "Transcription Complete"
                : micState === "listening"
                  ? "Recording..."
                  : micState === "processing"
                    ? "Processing..."
                    : "Current Recording"}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
            {transcript ? `${transcript.length} chars` : "00:00"}
          </span>
        </div>

        <div className="min-h-[100px] text-sm text-on-surface leading-relaxed">
          {transcript ? (
            isEditing ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full min-h-[100px] bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors"
                autoFocus
              />
            ) : (
              <p className="whitespace-pre-wrap">{transcript}</p>
            )
          ) : (
            <p className="text-on-surface-variant italic">
              Your transcription will appear here...
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 mt-auto border-t border-outline-variant/50">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors text-xs disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              transcript && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-xs"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )
            )}
            <button
              onClick={handleCopy}
              disabled={!transcript}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleClear}
              disabled={!transcript && micState === "idle"}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-on-error-container transition-colors text-on-surface-variant text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={14} />
              Clear
            </button>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant">
            {transcript.length} chars
          </span>
        </div>
      </section>
    </>
  );
}
