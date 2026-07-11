"use client";

import { useEffect, useRef, useState } from "react";
import MicButton from "@/components/MicButton";
import ModelSelector from "@/components/ModelSelector";

type MicState = "idle" | "listening" | "processing";

export default function DashboardPage() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [model, setModel] = useState("whisper-large-v3-turbo");
  const [transcript, setTranscript] = useState("");
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
  };

  return (
    <>
      <section className="flex flex-col items-center justify-center pt-10 md:pt-0 pb-6 gap-4">
        <div className="w-full max-w-xs mb-2">
          <ModelSelector value={model} onChange={setModel} disabled={micState !== "idle"} />
        </div>

        <p className="text-lg text-on-surface-variant">
          {micState === "idle"
            ? "Tap the mic to start recording"
            : micState === "listening"
              ? "Listening... tap to stop"
              : "Transcribing..."}
        </p>

        <MicButton state={micState} onClick={handleClick} />

        {error && (
          <p className="text-sm text-red-500 mt-2 text-center max-w-sm">{error}</p>
        )}
      </section>

      <section className="bg-surface border border-outline-variant rounded-3xl p-6 flex flex-col gap-4 transition-colors hover:border-secondary shadow-sm">
        <div className="flex justify-between items-center border-b border-outline-variant pb-4">
          <div className="flex items-center gap-3">
            {micState === "listening" && (
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
            {micState === "processing" && (
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
            )}
            <h2 className="text-lg font-semibold text-primary">
              {micState === "idle" && transcript
                ? "Transcription Complete"
                : micState === "listening"
                  ? "Recording..."
                  : micState === "processing"
                    ? "Processing..."
                    : "Current Recording"}
            </h2>
          </div>
          <span className="text-[13px] font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded">
            {transcript ? `${transcript.length} chars` : "00:00"}
          </span>
        </div>

        <div className="min-h-[150px] text-base text-on-surface leading-relaxed">
          {transcript ? (
            <p className="whitespace-pre-wrap">{transcript}</p>
          ) : (
            <p className="text-on-surface-variant italic">
              Your transcription will appear here...
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 mt-auto border-t border-outline-variant/50">
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              disabled={!transcript}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleClear}
              disabled={!transcript && micState === "idle"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-on-error-container transition-colors text-on-surface-variant text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                clear_all
              </span>
              Clear
            </button>
          </div>
          <span className="text-[13px] font-mono text-on-surface-variant">
            {transcript.length} chars
          </span>
        </div>
      </section>
    </>
  );
}
