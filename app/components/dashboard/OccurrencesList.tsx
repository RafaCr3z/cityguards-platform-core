"use client";

import React from "react";
import {
  Clock,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Filter,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useOccurrences } from "@/app/hooks/useOccurrences";
import { OccurrencesListSkeleton } from "@/app/components/ui/Skeleton";
import type { Occurrence, UrgencyLevel, OccurrenceStatus } from "@/app/types";

/* ── Lookup tables semânticas ──────────────────────────────────────── */

const urgencyBadge: Record<UrgencyLevel, string> = {
  alta: "bg-destructive-light text-destructive",
  média: "bg-warning-light text-warning",
  baixa: "bg-info-light text-info",
};

const urgencyLabel: Record<UrgencyLevel, string> = {
  alta: "Alta",
  média: "Média",
  baixa: "Baixa",
};

const urgencyDot: Record<UrgencyLevel, string> = {
  alta: "bg-destructive",
  média: "bg-warning",
  baixa: "bg-info",
};

const statusBadge: Record<OccurrenceStatus, string> = {
  Pendente: "border-warning/40 text-warning bg-warning-light/50",
  "Em Resolução": "border-info/40 text-info bg-info-light/50",
  Resolvida: "border-success/40 text-success bg-success-light/50",
};

/* ── Occurrence Row ────────────────────────────────────────────────── */

interface OccurrenceRowProps {
  readonly occ: Occurrence;
  readonly index: number;
}

function OccurrenceRow({ occ, index }: OccurrenceRowProps) {
  return (
    <article
      className="animate-fadeInUp opacity-0 group flex gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/80"
      style={{ animationDelay: `${index * 60 + 400}ms` }}
      tabIndex={0}
      role="listitem"
      aria-label={`${occ.title} — ${occ.location} — Estado: ${occ.status} — Urgência: ${urgencyLabel[occ.urgency]}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Futuramente: navegar para detalhes da ocorrência
        }
      }}
    >
      {/* Urgency color strip */}
      <div className="relative mt-1 flex flex-col items-center" aria-hidden="true">
        <span className={`h-2.5 w-2.5 rounded-full ${urgencyDot[occ.urgency]}`} />
        <span className="mt-1 flex-1 w-px bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-card-foreground group-hover:text-secondary transition-colors">
              {occ.title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <MapPin size={11} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{occ.location}</span>
            </div>
          </div>
          <ChevronRight
            size={14}
            className="mt-1 shrink-0 text-border opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden="true"
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {/* Status */}
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusBadge[occ.status]}`}>
            {occ.status}
          </span>

          {/* Urgency */}
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${urgencyBadge[occ.urgency]}`}>
            {occ.urgency === "alta" && <AlertTriangle size={9} aria-hidden="true" />}
            {urgencyLabel[occ.urgency]}
          </span>

          {/* Category tag */}
          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {occ.category}
          </span>

          {/* Time */}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock size={10} aria-hidden="true" />
            {occ.reportedAt}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ── OccurrencesList ───────────────────────────────────────────────── */

export default function OccurrencesList() {
  const { data, isLoading, error, refetch } = useOccurrences();

  /* ── Loading ─────────────────────────────────────────────── */
  if (isLoading) {
    return <OccurrencesListSkeleton />;
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error) {
    return (
      <div
        role="alert"
        className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive-light">
          <AlertCircle size={24} className="text-destructive" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">
            Não foi possível carregar as ocorrências
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Tentar carregar as ocorrências novamente"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Tentar novamente
        </button>
      </div>
    );
  }

  /* ── Data ────────────────────────────────────────────────── */
  if (!data) return null;

  return (
    <div
      className="animate-fadeInUp opacity-0 delay-400 flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      role="region"
      aria-label="Lista de ocorrências recentes"
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-muted px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">
            Ocorrências Recentes
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {data.length} registos mais recentes
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Filtrar ocorrências"
          >
            <Filter size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Mais opções para a lista de ocorrências"
          >
            <MoreHorizontal size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      <div
        className="flex-1 divide-y divide-muted/60 overflow-y-auto px-2 py-1"
        role="list"
        aria-live="polite"
        aria-label="Alertas de ocorrências recentes"
      >
        {data.map((occ, i) => (
          <OccurrenceRow key={occ.id} occ={occ} index={i} />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="border-t border-muted px-6 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted py-2 text-xs font-semibold text-secondary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Ver a lista completa de todas as ocorrências"
        >
          Ver Todas as Ocorrências
          <ChevronRight size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
