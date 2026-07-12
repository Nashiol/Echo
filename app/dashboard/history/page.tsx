"use client";

import { useEffect, useState } from "react";
import { Loader2, Mic } from "lucide-react";
import TranscriptCard from "@/components/TranscriptCard";

interface Recording {
  id: number;
  text: string;
  model: string | null;
  duration: number | null;
  is_favorite: number;
  created_at: string;
}

export default function HistoryPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecordings = () => {
    fetch("/api/recordings")
      .then((res) => res.json())
      .then((data) => setRecordings(data.recordings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/recordings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleFavorite = async (id: number) => {
    const res = await fetch(`/api/recordings/${id}/favorite`, {
      method: "PUT",
    });
    if (res.ok) {
      const data = await res.json();
      setRecordings((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, is_favorite: data.is_favorite } : r
        )
      );
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-on-surface">History</h2>
        <p className="text-on-surface-variant text-xs mt-1">
          All your past transcriptions.
        </p>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-16">
          <Mic size={48} className="mx-auto text-on-surface-variant/30 mb-3" />
          <p className="text-on-surface-variant text-xs">
            No recordings yet. Start by tapping the mic!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recordings.map((rec) => (
            <TranscriptCard
              key={rec.id}
              id={rec.id}
              text={rec.text}
              model={rec.model}
              duration={rec.duration}
              isFavorite={rec.is_favorite === 1}
              createdAt={rec.created_at}
              onDelete={handleDelete}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
