"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@prisma/client";
import type { DashboardSidebarItem } from "@/lib/rbac";
import LogoutButton from "@/components/dashboard/LogoutButton";

type AppSidebarProps = {
  name?: string | null;
  role?: UserRole;
  items: DashboardSidebarItem[];
};

function itemClassByTone(tone?: DashboardSidebarItem["tone"]) {
  if (tone === "admin") {
    return "text-gold/70 hover:bg-gold/5 hover:text-gold";
  }
  if (tone === "coach") {
    return "text-electric-blue/70 hover:bg-electric-blue/10 hover:text-electric-blue";
  }
  return "text-snow/60 hover:bg-white/5 hover:text-snow";
}

function iconForItem(icon: DashboardSidebarItem["icon"]) {
  if (icon === "courses") return <BookOpen className="w-5 h-5" />;
  if (icon === "coaching") return <Users className="w-5 h-5" />;
  if (icon === "admin") return <Shield className="w-5 h-5" />;
  return <LayoutDashboard className="w-5 h-5" />;
}

function isItemActive(pathname: string, item: DashboardSidebarItem) {
  if (item.match === "exact") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function AppSidebar({ name, role, items }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={`border-r border-white/5 bg-elite-black/40 hidden md:flex md:sticky md:top-0 md:h-screen flex-col transition-all duration-300 ${
          collapsed ? "w-24" : "w-64"
        }`}
      >
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between gap-2">
            {!collapsed ? (
              <h1 className="font-elite text-lg font-bold gold-text-gradient uppercase tracking-widest">
                ELITE 4.0
              </h1>
            ) : (
              <h1 className="font-elite text-lg font-bold gold-text-gradient uppercase tracking-widest">
                E4
              </h1>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-snow/70 hover:text-snow hover:bg-white/5 transition"
              aria-label={collapsed ? "Déplier la sidebar" : "Plier la sidebar"}
              title={collapsed ? "Déplier" : "Plier"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {items.map((item) => {
            const active = isItemActive(pathname, item);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium border ${
                  active
                    ? "border-gold/30 bg-gold/10 text-gold"
                    : `border-transparent ${itemClassByTone(item.tone)}`
                }`}
                title={item.label}
              >
                {iconForItem(item.icon)}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div
            className={`flex items-center rounded-xl border border-white/5 bg-white/[0.02] ${
              collapsed ? "justify-center py-2" : "gap-2 px-3 py-2.5"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">
              {name?.[0] || "U"}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-snow text-[13px] leading-tight font-semibold truncate">
                  {name || "Utilisateur"}
                </p>
                <p className="text-snow/45 text-[10px] leading-tight uppercase font-bold tracking-wide mt-0.5">
                  {role || "STUDENT"}
                </p>
              </div>
            )}
          </div>

          <LogoutButton compact={collapsed} />
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-elite-black/95 backdrop-blur supports-[backdrop-filter]:bg-elite-black/80">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const active = isItemActive(pathname, item);
            return (
              <Link
                key={`mobile-${item.href}-${item.label}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider ${
                  active ? "text-gold" : "text-snow/60"
                }`}
              >
                {iconForItem(item.icon)}
                <span className="truncate max-w-[90%]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
