"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useDashboardStats } from "@/app/hooks/useDashboardStats";
import KPICard from "@/app/components/dashboard/KPICard";
import { KPIGridSkeleton } from "@/app/components/ui/Skeleton";

/**
 * Grelha de KPIs que reage aos 3 estados do hook:
 *   - isLoading → mostra skeleton loaders
 *   - error     → mostra mensagem de erro com botão de retry
 *   - data      → renderiza os cartões de KPI
 */
export default function KPIGrid() {
  const { data, isLoading, error, refetch } = useDashboardStats();

  /* ── Loading State ───────────────────────────────────────────── */
  if (isLoading) {
    return <KPIGridSkeleton />;
  }

  /* ── Error State ─────────────────────────────────────────────── */
  if (error) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive-light px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-destructive" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-card-foreground">
              Não foi possível carregar as métricas
            </p>
            <p className="text-xs text-muted-foreground">{error.message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Tentar carregar as métricas novamente"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Tentar novamente
        </button>
      </div>
    );
  }

  /* ── Data Estado ─────────────────────────────────────────────── */
  if (!data) return null;

  return (
    <section
      id="kpi-section"
      aria-label="Métricas-chave do dashboard"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {data.kpis.map((card, i) => (
        <KPICard key={card.id} card={card} index={i} />
      ))}
    </section>
  );
}
