"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Clock, Star, Settings } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Record", icon: Mic },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/favorites", label: "Saved", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex justify-around items-center h-20 pb-safe px-2 fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container-lowest shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navLinks.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

        const isRecord = link.icon === Mic;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-colors active:scale-90 duration-200 ${
              isRecord
                ? "bg-secondary-container text-on-secondary-container rounded-full"
                : isActive
                  ? "text-primary rounded-full"
                  : "text-on-surface-variant hover:bg-surface-container-high rounded-full"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-semibold tracking-wide mt-1 uppercase">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
