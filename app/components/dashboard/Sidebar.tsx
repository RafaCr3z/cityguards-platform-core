"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileBarChart,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { NavIconName, NavItem } from "@/app/types";

/** Resolve uma chave de ícone (string) para o componente Lucide. */
const iconMap: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileBarChart,
  Settings,
};

/** Items de navegação — o estado activo é resolvido pelo pathname. */
const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
  { label: "Ocorrências", href: "/dashboard/ocorrencias", iconName: "AlertTriangle", badge: 12 },
  { label: "Equipas no Terreno", href: "/dashboard/equipas", iconName: "Users" },
  { label: "Integração SNC-AP", href: "/dashboard/sncap", iconName: "FileBarChart" },
  { label: "Definições", href: "/dashboard/definicoes", iconName: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-sidebar text-sidebar-foreground animate-slideInLeft"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* ── Logo ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary-light shadow-lg shadow-secondary/30">
          <Shield size={22} className="text-secondary-foreground" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight leading-tight">
            CityGuards
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-widest text-sidebar-muted-foreground/80">
            Command Center
          </p>
        </div>
      </div>

      {/* ── Separator ──────────────────────────────────────────── */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Navegação principal">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-label">
          Menu Principal
        </p>

        {navItems.map((item) => {
          const Icon = iconMap[item.iconName];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                  : "text-sidebar-muted-foreground/70 hover:bg-sidebar-muted/40 hover:text-sidebar-foreground"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-secondary-light"
                  aria-hidden="true"
                />
              )}

              <Icon
                size={20}
                aria-hidden="true"
                className={
                  isActive
                    ? "text-secondary-light"
                    : "text-sidebar-label group-hover:text-secondary-light"
                }
              />

              <span className="flex-1">{item.label}</span>

              {item.badge != null && item.badge > 0 && (
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground"
                  aria-label={`${item.badge} novos`}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight size={14} className="text-sidebar-label" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />

      <div className="p-4">
        {/* Sistema operacional status */}
        <div className="mb-4 rounded-xl bg-sidebar-muted/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-sidebar-muted-foreground/80">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span>Sistema Operacional</span>
          </div>
          <p className="mt-1 text-[11px] text-sidebar-label">
            Última sincronização: há 2 min
          </p>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-muted-foreground/70 transition-colors hover:bg-sidebar-muted/40 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          aria-label="Terminar sessão e sair do sistema"
        >
          <LogOut size={18} aria-hidden="true" />
          Terminar Sessão
        </button>
      </div>
    </aside>
  );
}
