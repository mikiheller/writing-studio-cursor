"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenLine,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Library", icon: Library },
  { href: "/settings", label: "Voice Profile", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-stone-900 text-stone-300">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
          <PenLine className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Writing Studio</h1>
          <p className="text-xs text-stone-500">AI-powered writing</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-stone-800 text-white"
                      : "text-stone-400 hover:bg-stone-800/50 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-stone-800 px-4 py-4">
        <div className="flex items-center gap-2 rounded-lg bg-stone-800/60 px-3 py-2.5">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-xs text-stone-400">
            AI ready — add API keys in settings
          </span>
        </div>
      </div>
    </aside>
  );
}
