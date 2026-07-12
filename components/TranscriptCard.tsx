"use client";

import { useState } from "react";
import { Copy, Check, Star, Trash2 } from "lucide-react";
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
    <div className="bg-white rounded-xl border border-outline-variant p-4 flex flex-col gap-2 transition-shadow hover:shadow-md">
      <p className="text-on-surface text-xs leading-relaxed whitespace-pre-wrap">
        {displayText}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-secondary hover:underline cursor-pointer self-start"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-outline-variant">
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
          {model && (
            <span className="bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-medium">
              {getModelDisplayName(model)}
            </span>
          )}
          {duration != null && duration > 0 && (
            <span className="font-mono">{formatDuration(duration)}</span>
          )}
          {createdAt && <span>{timeAgo(createdAt)}</span>}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={handleCopy}
            className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface rounded-lg transition-colors cursor-pointer"
            title="Copy"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => onFavorite?.(id)}
            className="p-1.5 text-on-surface-variant hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
            title="Favorite"
          >
            <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Delete this recording?")) {
                onDelete?.(id);
              }
            }}
            className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
