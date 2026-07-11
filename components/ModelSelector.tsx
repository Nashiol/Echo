"use client";

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

const MODELS = [
  { value: "whisper-large-v3-turbo", label: "Whisper V3 Turbo", badge: "Fast" },
  { value: "whisper-large-v3", label: "Whisper V3", badge: "Accurate" },
];

export default function ModelSelector({
  value,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors disabled:opacity-50"
    >
      {MODELS.map((model) => (
        <option key={model.value} value={model.value}>
          {model.label} — {model.badge}
        </option>
      ))}
    </select>
  );
}
