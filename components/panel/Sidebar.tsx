"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  Inbox,
  Settings,
  Receipt,
} from "lucide-react";

const items = [
  { href: "/panel", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/panel/quotes", label: "הצעות מחיר", icon: Receipt },
  { href: "/panel/prospects", label: "לידים", icon: Users },
  { href: "/panel/inbox", label: "תיבת נכנס", icon: Inbox },
  { href: "/panel/upload", label: "ייבוא CSV", icon: Upload },
  { href: "/panel/templates", label: "תבניות", icon: FileText },
  { href: "/panel/settings", label: "הגדרות", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 bg-brand-surface border-l border-brand-line min-h-screen p-4 flex flex-col gap-1">
      <div className="px-3 py-4 mb-2">
        <div className="text-brand-gold font-serif text-xl tracking-wide">
          PrintBox
        </div>
        <div className="text-brand-boneDim text-xs mt-1">פאנל תפעול SDR</div>
      </div>
      {items.map((it) => {
        const active =
          it.href === "/panel"
            ? pathname === "/panel"
            : pathname.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              active
                ? "bg-brand-gold/15 text-brand-goldHi border border-brand-gold/30"
                : "text-brand-bone hover:bg-brand-surfaceHi"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{it.label}</span>
          </Link>
        );
      })}
      <div className="mt-auto px-3 py-3 text-[11px] text-brand-boneDim border-t border-brand-line">
        <Link
          href="/panel/settings"
          className="hover:text-brand-bone transition-colors"
        >
          מצב שליחה והגדרות →
        </Link>
      </div>
    </aside>
  );
}
