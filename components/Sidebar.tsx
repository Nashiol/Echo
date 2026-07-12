"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Mic,
  Clock,
  Star,
  Settings,
  LogIn,
  AudioLines,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "New Recording", icon: Mic },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/favorites", label: "Favorites", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : null;

  return (
    <>
      {/* Hamburger toggle button — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-60 w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-low border border-outline-variant text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Backdrop overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/30 z-55 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar panel */}
      <nav
        className={`fixed left-0 top-0 h-screen w-60 bg-surface-container-low border-r border-outline-variant flex-col py-4 px-3 z-60 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-outline-variant">
            <AudioLines size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary tracking-tight">
              Echo
            </h1>
            <p className="text-[11px] text-on-surface-variant">AI Transcription</p>
          </div>
        </div>

        <ul className="flex-1 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-primary font-bold bg-surface-container-highest border-r-2 border-secondary"
                      : "text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto pt-4 border-t border-outline-variant">
          {user ? (
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary truncate">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-xs font-semibold"
            >
              <LogIn size={16} />
              Log In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
