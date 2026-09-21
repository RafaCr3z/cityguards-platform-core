import React from "react";

/* =======================================================================
 * Skeleton Loaders — Shadcn/ui Style
 *
 * Componentes de skeleton animados para indicar carregamento. Usam a
 * animação `animate-skeleton` definida em globals.css.
 * ======================================================================= */

interface SkeletonProps {
  className?: string;
}

/** Bloco base de skeleton — usa-se como building block. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-skeleton rounded-lg bg-muted ${className}`}
    />
  );
}

/** Skeleton para um cartão de KPI individual. */
export function KPICardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

/** Skeleton para a grelha de 4 KPI cards. */
export function KPIGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="A carregar métricas…"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
      <span className="sr-only">A carregar métricas do dashboard…</span>
    </div>
  );
}

/** Skeleton para um item na lista de ocorrências. */
export function OccurrenceItemSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-4 px-4 py-3.5">
      <div className="mt-1 flex flex-col items-center">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="mt-1 h-12 w-px" />
      </div>
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton para a lista completa de ocorrências. */
export function OccurrencesListSkeleton() {
  return (
    <div
      role="status"
      aria-label="A carregar ocorrências…"
      className="flex h-full flex-col rounded-2xl border border-border bg-card"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-muted px-6 py-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 divide-y divide-muted px-2 py-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <OccurrenceItemSkeleton key={i} />
        ))}
      </div>

      <span className="sr-only">A carregar lista de ocorrências…</span>
    </div>
  );
}

/** Skeleton para o mapa. */
export function MapSkeleton() {
  return (
    <div
      role="status"
      aria-label="A carregar mapa…"
      className="flex h-full flex-col rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-muted px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
      </div>
      <div className="flex-1 bg-muted/50">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <span className="sr-only">A carregar mapa da cidade…</span>
    </div>
  );
}
