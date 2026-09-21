"use client";

import React, { useState, useEffect } from "react";
import {
  FileBarChart,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Search,
} from "lucide-react";
import { integrationStats, financialRecords } from "@/app/data/sncapData";
import { Skeleton } from "@/app/components/ui/Skeleton";
import type { FinancialRecord, SyncStatus } from "@/app/types/pages";

/* -- Status config ---------------------------------------------------- */

const syncConfig: Record<SyncStatus, { label: string; color: string; icon: React.ReactNode }> = {
  sincronizado: {
    label: "Sincronizado",
    color: "border-success/40 text-success bg-success-light/50",
    icon: <CheckCircle2 size={12} aria-hidden="true" />,
  },
  pendente: {
    label: "Pendente",
    color: "border-warning/40 text-warning bg-warning-light/50",
    icon: <Clock size={12} aria-hidden="true" />,
  },
  erro: {
    label: "Erro",
    color: "border-destructive/40 text-destructive bg-destructive-light/50",
    icon: <AlertTriangle size={12} aria-hidden="true" />,
  },
};

/* -- Page ------------------------------------------------------------- */

export default function SncapPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = financialRecords.filter(
    (record) =>
      record.description.toLowerCase().includes(search.toLowerCase()) ||
      record.sncapCode.toLowerCase().includes(search.toLowerCase()) ||
      record.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Integracao SNC-AP</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sincronizacao financeira e contabilistica com o Sistema de Normalizacao Contabilistica para Administracoes Publicas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Exportar relatorio SNC-AP"
          >
            <Download size={16} aria-hidden="true" />
            Exportar
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Forcar sincronizacao agora"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Sincronizar Agora
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-light">
            <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Ligacao SNC-AP Estavel</p>
            <p className="text-xs text-muted-foreground">Ultima sincronizacao: {integrationStats.lastSyncAt}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-card-foreground">{integrationStats.pendingSync} registos pendentes</p>
          <p className="text-xs text-muted-foreground">A aguardar proximo ciclo (00:00)</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Orcamento Disponivel (Geral)</p>
            <FileBarChart size={18} className="text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency(integrationStats.totalBudget - integrationStats.spent)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            De um total de {formatCurrency(integrationStats.totalBudget)}
          </p>
        </article>
        
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Despesa Acumulada</p>
            <ArrowUpRight size={18} className="text-destructive" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency(integrationStats.spent)}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex rounded-full bg-destructive-light px-2 py-0.5 text-[11px] font-semibold text-destructive">
              +4.2% vs. mes anterior
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Verbas PRR Utilizadas</p>
            <ArrowDownRight size={18} className="text-success" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency(integrationStats.saved)}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex rounded-full bg-success-light px-2 py-0.5 text-[11px] font-semibold text-success">
              14% do fundo PRR alocado
            </span>
          </div>
        </article>
      </div>

      {/* Transactions Table */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-muted px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Movimentos Recentes</h3>
             <p className="text-[11px] text-muted-foreground">Registo de despesas e receitas associadas a ocorrencias.</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="Pesquisar movimento ou codigo SNC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Pesquisar movimentos financeiros"
              className="h-9 w-64 rounded-xl border border-input bg-muted pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-muted bg-muted/30">
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID/Cod</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Descricao</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Valor</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">SNC-AP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((record) => {
                  const isDespesa = record.type === "despesa";
                  const syncLabel = syncConfig[record.syncStatus];

                  return (
                    <tr key={record.id} className="border-b border-muted/60 transition-colors hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="text-xs font-mono font-medium text-card-foreground">{record.id}</p>
                        <p className="text-[10px] text-muted-foreground">{record.sncapCode}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-card-foreground">{record.description}</p>
                        <p className="text-[11px] text-muted-foreground">{record.category}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs text-muted-foreground">{record.date}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${isDespesa ? 'text-destructive bg-destructive-light/30' : 'text-success bg-success-light/30'}`}>
                          {isDespesa ? "-" : "+"} {formatCurrency(record.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                         <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${syncLabel.color}`}>
                            {syncLabel.icon}
                            {syncLabel.label}
                          </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Nenhum movimento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
