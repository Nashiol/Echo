"use client";

import { useState } from "react";
import { getModelDisplayName, timeAgo, formatDuration } from "@/lib/utils";

interface TranscriptCardProps {
  id: number;
  text: string;
  model?: string | null;
  duration?: number | null;
  isFavorite: boolean;
  onDelete?: (id: number) => void;
  onFavorite?: (id: number) => void;
  createdAt?: string;
}

export default function TranscriptCard({
  id,
  text,
  model,
  duration,
  isFavorite,
  onDelete,
  onFavorite,
  createdAt,
}: TranscriptCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLong = text.length > 150;
  const displayText = expanded || !isLong ? text : text.slice(0, 150) + "...";

  return (
    <div className="bg-white rounded-xl border border-outline-variant p-5 flex flex-col gap-3 transition-shadow hover:shadow-md">
      <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">
        {displayText}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-secondary hover:underline cursor-pointer self-start"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-outline-variant">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          {model && (
            <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
              {getModelDisplayName(model)}
            </span>
          )}
          {duration != null && duration > 0 && (
            <span className="font-mono">{formatDuration(duration)}</span>
          )}
          {createdAt && <span>{timeAgo(createdAt)}</span>}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 text-on-surface-variant hover:text-secondary hover:bg-surface rounded-lg transition-colors cursor-pointer"
            title="Copy"
          >
            <span className="material-symbols-rounded text-base">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
          <button
            onClick={() => onFavorite?.(id)}
            className="p-2 text-on-surface-variant hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
            title="Favorite"
          >
            <span className="material-symbols-rounded text-base">
              {isFavorite ? "star" : "star_border"}
            </span>
          </button>
          <button
            onClick={() => {
              if (window.confirm("Delete this recording?")) {
                onDelete?.(id);
              }
            }}
            className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <span className="material-symbols-rounded text-base">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
