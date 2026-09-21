"use client";

import React from "react";
import { Search, Bell, ChevronDown, User } from "lucide-react";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-card/80 px-8 backdrop-blur-lg"
      role="banner"
    >
      {/* ── Left: Welcome + Search ──────────────────────────────── */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-foreground">
            Command Center
          </h2>
          <p className="text-xs text-muted-foreground">
            Quarta-feira, 9 de Abril de 2026
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            placeholder="Pesquisar ocorrências, equipas..."
            aria-label="Pesquisar ocorrências, equipas e localizações"
            className="h-10 w-72 rounded-xl border border-input bg-muted pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      {/* ── Right: Notifications + Profile ──────────────────────── */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          id="notifications-btn"
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Notificações — existem novos alertas por ler"
        >
          <Bell size={18} aria-hidden="true" />
          {/* Red alert dot */}
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-pulse-dot" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
          </span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-border" aria-hidden="true" />

        {/* User Profile */}
        <button
          id="user-profile-btn"
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Menu do perfil do utilizador — Administrador, Câmara Municipal"
          aria-haspopup="menu"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-accent to-secondary shadow-sm">
            <User size={16} className="text-primary-foreground" aria-hidden="true" />
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-foreground">
              Administrador
            </p>
            <p className="text-[11px] text-muted-foreground">Câmara Municipal</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
