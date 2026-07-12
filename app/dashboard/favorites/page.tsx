"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import TranscriptCard from "@/components/TranscriptCard";

interface Recording {
  id: number;
  text: string;
  model: string | null;
  duration: number | null;
  is_favorite: number;
  created_at: string;
}

export default function FavoritesPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    fetch("/api/recordings?favorites=true")
      .then((res) => res.json())
      .then((data) => setRecordings(data.recordings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
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
      setRecordings((prev) => prev.filter((r) => r.id !== id));
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
        <h2 className="text-xl font-bold text-on-surface">Favorites</h2>
        <p className="text-on-surface-variant text-xs mt-1">
          Your starred transcriptions.
        </p>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-16">
          <Star size={48} className="mx-auto text-on-surface-variant/30 mb-3" />
          <p className="text-on-surface-variant text-xs">
            No favorites yet. Star a recording from History.
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
