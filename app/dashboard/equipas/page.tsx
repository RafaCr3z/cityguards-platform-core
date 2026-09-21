"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  MapPin,
  CheckCircle2,
  Clock,
  Pause,
  XCircle,
  Search,
  MoreHorizontal,
  Phone,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { fieldTeams } from "@/app/data/teamsData";
import { Skeleton } from "@/app/components/ui/Skeleton";
import type { FieldTeam, TeamStatus } from "@/app/types/pages";

/* -- Status config ---------------------------------------------------- */

const statusConfig: Record<TeamStatus, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  ativa: {
    label: "Ativa",
    color: "border-success/40 text-success bg-success-light/50",
    dot: "bg-success",
    icon: <CheckCircle2 size={12} aria-hidden="true" />,
  },
  "em pausa": {
    label: "Em Pausa",
    color: "border-warning/40 text-warning bg-warning-light/50",
    dot: "bg-warning",
    icon: <Pause size={12} aria-hidden="true" />,
  },
  inativa: {
    label: "Inativa",
    color: "border-muted-foreground/40 text-muted-foreground bg-muted",
    dot: "bg-muted-foreground",
    icon: <XCircle size={12} aria-hidden="true" />,
  },
};

/* -- Team Card -------------------------------------------------------- */

function TeamCard({ team }: { team: FieldTeam }) {
  const cfg = statusConfig[team.status];

  return (
    <article
      className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring"
      aria-label={`${team.name} - ${cfg.label}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-card-foreground">{team.name}</h3>
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${cfg.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
              {cfg.label}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin size={10} aria-hidden="true" />
            {team.zone}
          </p>
        </div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Opcoes da ${team.name}`}
        >
          <MoreHorizontal size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Current assignment */}
      {team.currentOccurrenceTitle ? (
        <div className="mt-3 rounded-lg bg-secondary/5 border border-secondary/10 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
            Ocorrencia atual
          </p>
          <p className="mt-0.5 text-xs font-medium text-card-foreground truncate">
            {team.currentOccurrenceTitle}
          </p>
          <p className="text-[10px] text-muted-foreground">{team.currentOccurrenceId}</p>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-muted/50 border border-border px-3 py-2">
          <p className="text-xs text-muted-foreground italic">Sem ocorrencia atribuida</p>
        </div>
      )}

      {/* Members */}
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Membros ({team.members.length})
        </p>
        <div className="flex items-center -space-x-2">
          {team.members.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-muted to-primary-accent text-[9px] font-bold text-primary-foreground ring-2 ring-card"
              title={`${member.name} - ${member.role}`}
              aria-label={`${member.name}, ${member.role}`}
            >
              {member.avatarInitials}
            </div>
          ))}
          {team.members.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-card">
              +{team.members.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <CheckCircle2 size={11} className="text-success" aria-hidden="true" />
          {team.completedToday} resolvidas hoje
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Contactar ${team.name}`}
          >
            <Phone size={12} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Ver detalhes da ${team.name}`}
          >
            <ChevronRight size={12} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* -- Page ------------------------------------------------------------- */

export default function EquipasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TeamStatus | "todas">("todas");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return fieldTeams.filter((team) => {
      if (filterStatus !== "todas" && team.status !== filterStatus) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        return (
          team.name.toLowerCase().includes(term) ||
          team.zone.toLowerCase().includes(term) ||
          team.members.some((m) => m.name.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [search, filterStatus]);

  const counts = {
    todas: fieldTeams.length,
    ativa: fieldTeams.filter((t) => t.status === "ativa").length,
    "em pausa": fieldTeams.filter((t) => t.status === "em pausa").length,
    inativa: fieldTeams.filter((t) => t.status === "inativa").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex -space-x-2">
                {[1, 2, 3].map((n) => <Skeleton key={n} className="h-7 w-7 rounded-full" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipas no Terreno</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitorizar e gerir as equipas de intervencao no terreno.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Adicionar nova equipa"
        >
          <UserPlus size={16} aria-hidden="true" />
          Nova Equipa
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total de Equipas", value: counts.todas, icon: Users, color: "text-secondary bg-secondary/10" },
          { label: "Ativas agora", value: counts.ativa, icon: CheckCircle2, color: "text-success bg-success-light" },
          { label: "Em Pausa", value: counts["em pausa"], icon: Pause, color: "text-warning bg-warning-light" },
          { label: "Inativas", value: counts.inativa, icon: XCircle, color: "text-muted-foreground bg-muted" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon size={18} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="Filtrar equipas por estado">
          {(["todas", "ativa", "em pausa", "inativa"] as const).map((key) => {
            const labels: Record<string, string> = { todas: "Todas", ativa: "Ativas", "em pausa": "Em Pausa", inativa: "Inativas" };
            const isActive = filterStatus === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilterStatus(key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {labels[key]}
                <span className={`text-[10px] font-bold ${isActive ? "text-secondary" : "text-muted-foreground"}`}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Pesquisar equipa ou membro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Pesquisar equipas por nome, zona ou membro"
            className="h-10 w-64 rounded-xl border border-input bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list" aria-label="Lista de equipas">
        {filtered.length > 0 ? (
          filtered.map((team) => (
            <div key={team.id} role="listitem">
              <TeamCard team={team} />
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search size={20} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-card-foreground">Nenhuma equipa encontrada</p>
            <p className="text-xs text-muted-foreground">Tente ajustar os filtros ou a pesquisa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
