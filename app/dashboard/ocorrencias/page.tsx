"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Play,
  Loader2,
} from "lucide-react";
import { useAllOccurrences } from "@/app/hooks/useAllOccurrences";
import { Skeleton } from "@/app/components/ui/Skeleton";
import type { Occurrence, OccurrenceStatus, UrgencyLevel } from "@/app/types";

/* ── Lookup tables ─────────────────────────────────────────────────── */

const statusBadge: Record<OccurrenceStatus, string> = {
  Pendente: "border-warning/40 text-warning bg-warning-light/50",
  "Em Resolução": "border-info/40 text-info bg-info-light/50",
  Resolvida: "border-success/40 text-success bg-success-light/50",
};

const statusDot: Record<OccurrenceStatus, string> = {
  Pendente: "bg-warning",
  "Em Resolução": "bg-info",
  Resolvida: "bg-success",
};

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

/* ── Tab type ──────────────────────────────────────────────────────── */

type StatusTab = OccurrenceStatus | "Todas";

const tabs: { key: StatusTab; label: string }[] = [
  { key: "Todas", label: "Todas" },
  { key: "Pendente", label: "Pendentes" },
  { key: "Em Resolução", label: "Em Resolução" },
  { key: "Resolvida", label: "Resolvidas" },
];

/* ── Table Row ─────────────────────────────────────────────────────── */

interface OccurrenceTableRowProps {
  occ: Occurrence & { fotografiaUrl?: string; descricao?: string };
  index: number;
  onUpdateStatus: (id: string, novoEstado: "Em Resolução" | "Resolvida") => Promise<void>;
}

function OccurrenceTableRow({
  occ,
  index,
  onUpdateStatus
}: OccurrenceTableRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAction = async (e: React.MouseEvent, novoEstado: "Em Resolução" | "Resolvida") => {
    e.stopPropagation(); // Evitar clique na linha
    setIsUpdating(true);
    try {
      await onUpdateStatus(occ.id, novoEstado);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr
      className="animate-fadeInUp opacity-0 group border-b border-muted/60 transition-colors hover:bg-muted/40 cursor-pointer"
      style={{ animationDelay: `${index * 40 + 200}ms` }}
      tabIndex={0}
      role="row"
      aria-label={`Ocorrência ${occ.id}: ${occ.title}`}
    >
      {/* ID */}
      <td className="px-4 py-3.5 text-xs font-mono font-medium text-muted-foreground">
        {occ.id.substring(0, 8)}...
      </td>

      {/* Título + Localização */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          {occ.fotografiaUrl && (
            <img 
              src={occ.fotografiaUrl} 
              alt={occ.title} 
              className="h-9 w-9 rounded-lg object-cover border border-border shrink-0" 
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground group-hover:text-secondary transition-colors truncate max-w-[220px]">
              {occ.title}
            </p>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin size={10} aria-hidden="true" className="shrink-0" />
              <span className="truncate max-w-[200px]">{occ.location}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Categoria */}
      <td className="px-4 py-3.5">
        <span className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {occ.category}
        </span>
      </td>

      {/* Urgência */}
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold ${urgencyBadge[occ.urgency]}`}
        >
          {occ.urgency === "alta" && (
            <AlertTriangle size={10} aria-hidden="true" />
          )}
          {urgencyLabel[occ.urgency]}
        </span>
      </td>

      {/* Estado */}
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold ${statusBadge[occ.status]}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusDot[occ.status]}`}
            aria-hidden="true"
          />
          {occ.status}
        </span>
      </td>

      {/* Data */}
      <td className="px-4 py-3.5">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} aria-hidden="true" />
          {occ.reportedAt}
        </span>
      </td>

      {/* Ações */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          {isUpdating ? (
            <Loader2 size={16} className="text-secondary animate-spin" />
          ) : (
            <>
              {occ.status === "Pendente" && (
                <button
                  type="button"
                  onClick={(e) => handleAction(e, "Em Resolução")}
                  className="inline-flex items-center gap-1 rounded-lg bg-info/10 text-info px-2.5 py-1 text-xs font-bold hover:bg-info/20 transition-all"
                  title="Colocar ocorrência em resolução ativa"
                >
                  <Play size={10} />
                  Atuar
                </button>
              )}
              {occ.status === "Em Resolução" && (
                <button
                  type="button"
                  onClick={(e) => handleAction(e, "Resolvida")}
                  className="inline-flex items-center gap-1 rounded-lg bg-success/10 text-success px-2.5 py-1 text-xs font-bold hover:bg-success/20 transition-all"
                  title="Marcar como resolvida e creditar pontos"
                >
                  <CheckCircle2 size={10} />
                  Resolver
                </button>
              )}
              {occ.status === "Resolvida" && (
                <span className="text-[10px] text-muted-foreground font-medium">Sem ações pendentes</span>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── Table Skeleton ────────────────────────────────────────────────── */

function TableSkeleton() {
  return (
    <div role="status" aria-label="A carregar tabela de ocorrências…" className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-muted px-6 py-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      <div className="divide-y divide-muted/60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
      <span className="sr-only">A carregar…</span>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default function OccurrencesPage() {
  const { filtered, isLoading, error, filters, setFilters, counts, refetch } =
    useAllOccurrences();
  
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    let municipio = "Castelo Branco";
    const storedUser = localStorage.getItem("cityguards_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      municipio = user.municipio || municipio;
    }

    try {
      const response = await fetch("http://localhost:5001/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          municipio,
          ocorrencias: filtered,
        }),
      });

      if (!response.ok) throw new Error("Erro na geração do PDF.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-ocorrencias-${municipio.toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.warn("Serviço Docker de PDF inacessível. Usando exportação CSV de contingência...", err);
      try {
        const headers = ["ID", "Titulo", "Localizacao", "Categoria", "Urgencia", "Estado", "Data"];
        const rows = filtered.map(occ => [
          occ.id,
          `"${occ.title.replace(/"/g, '""')}"`,
          `"${occ.location.replace(/"/g, '""')}"`,
          occ.category,
          occ.urgency,
          occ.status,
          occ.reportedAt
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
          + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const a = document.createElement("a");
        a.href = encodedUri;
        a.download = `relatorio-ocorrencias-${municipio.toLowerCase()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("Aviso: O microsserviço de PDF (Docker na porta 5001) não se encontra ativo. Descarregamos em formato CSV de contingência.");
      } catch (csvErr) {
        alert("Não foi possível exportar os dados.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateStatus = async (id: string, novoEstado: "Em Resolução" | "Resolvida") => {
    try {
      const response = await fetch("/api/occurrences/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occurrenceId: id, estado: novoEstado }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao atualizar estado.");

      setFeedbackMsg(`Ocorrência atualizada para '${novoEstado}' com sucesso!`);
      setTimeout(() => setFeedbackMsg(""), 4000);
      refetch(); // Recarregar dados do Firestore em tempo real
    } catch (err: any) {
      alert(err.message || "Não foi possível atualizar o estado.");
    }
  };

  /* ── Loading ──────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────── */
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-12 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive-light">
          <AlertCircle size={28} className="text-destructive" aria-hidden="true" />
        </div>
        <div>
          <p className="text-base font-semibold text-card-foreground">
            Não foi possível carregar as ocorrências
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Tentar carregar novamente"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Tentar novamente
        </button>
      </div>
    );
  }

  /* ── Data ──────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Ocorrências
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerir e monitorizar todas as ocorrências reportadas pelos cidadãos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            aria-label="Exportar lista de ocorrências"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} aria-hidden="true" />
            )}
            Exportar
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Registar nova ocorrência manualmente"
          >
            <Plus size={16} aria-hidden="true" />
            Nova Ocorrência
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="rounded-xl bg-success-light/30 border border-success/30 p-4 text-xs font-semibold text-success animate-fadeIn">
          {feedbackMsg}
        </div>
      )}

      {/* ── Tabs + Search bar ──────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="Filtrar por estado">
          {tabs.map((tab) => {
            const isActive = filters.status === tab.key;
            const count = counts[tab.key];

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilters({ status: tab.key })}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-secondary/10 text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="occurrence-search"
              type="search"
              placeholder="Pesquisar por título, local, ID..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              aria-label="Pesquisar ocorrências por título, localização ou ID"
              className="h-10 w-64 rounded-xl border border-input bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Filtros avançados"
          >
            <Filter size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        role="region"
        aria-label="Tabela de ocorrências"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left" role="table">
            <thead>
              <tr className="border-b border-muted bg-muted/30">
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label="Ordenar por ID"
                  >
                    ID <ArrowUpDown size={11} aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ocorrência
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label="Ordenar por urgência"
                  >
                    Urgência <ArrowUpDown size={11} aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label="Ordenar por data"
                  >
                    Data <ArrowUpDown size={11} aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {filtered.length > 0 ? (
                filtered.map((occ: any, i) => (
                  <OccurrenceTableRow 
                    key={occ.id} 
                    occ={occ} 
                    index={i} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Search
                          size={20}
                          className="text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-sm font-medium text-card-foreground">
                        Nenhuma ocorrência encontrada
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tente ajustar os filtros ou a pesquisa.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer — Result count */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-muted px-6 py-3">
            <p className="text-xs text-muted-foreground">
              A mostrar{" "}
              <span className="font-semibold text-card-foreground">
                {filtered.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-card-foreground">
                {counts.Todas}
              </span>{" "}
              ocorrências
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground disabled:opacity-40"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
                aria-current="page"
              >
                1
              </button>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Página seguinte"
              >
                Seguinte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
