"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "New Recording", icon: "mic" },
  { href: "/dashboard/history", label: "History", icon: "history" },
  { href: "/dashboard/favorites", label: "Favorites", icon: "star" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex w-[280px] h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex-col py-6 px-4 z-50">
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-outline-variant">
          <span className="material-symbols-outlined text-primary">
            graphic_eq
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">
            Echo
          </h1>
          <p className="text-sm text-on-surface-variant">AI Transcription</p>
        </div>
      </div>

      <ul className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary font-bold bg-surface-container-highest border-r-2 border-secondary"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="text-base">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-6 border-t border-outline-variant">
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          Log In
        </Link>
      </div>
    </nav>
  );
}
