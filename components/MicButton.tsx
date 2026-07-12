"use client";

import { Mic, Square } from "lucide-react";

interface MicButtonProps {
  state: "idle" | "listening" | "processing";
  onClick: () => void;
  disabled?: boolean;
}

export default function MicButton({
  state,
  onClick,
  disabled = false,
}: MicButtonProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing";

  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <div className="absolute w-28 h-28 rounded-full bg-secondary/10 animate-ping" />
      )}
      {isListening && (
        <div className="absolute w-36 h-36 rounded-full bg-secondary/5 animate-pulse" />
      )}
      <button
        onClick={onClick}
        disabled={disabled || isProcessing}
        className={`
          relative z-10 w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${
            isListening
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
              : isProcessing
                ? "bg-secondary text-white cursor-wait"
                : "bg-secondary text-white hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/20 hover:scale-105 active:scale-95"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isProcessing ? (
          <svg
            className="w-8 h-8 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : isListening ? (
          <Square size={24} fill="currentColor" />
        ) : (
          <Mic size={24} />
        )}
      </button>
    </div>
  );
}
