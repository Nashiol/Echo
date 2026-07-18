"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {options.map((opt) => (
          <div
            key={opt.value}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-xs"
          >
            <opt.icon size={14} className="text-on-surface-variant" />
            <span className="text-on-surface-variant">{opt.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
            theme === opt.value
              ? "border-secondary bg-secondary/5 text-on-surface"
              : "border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <opt.icon size={14} />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
