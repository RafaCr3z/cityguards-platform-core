"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingDown,
  TrendingUp,
  Minus,
  type LucideIcon,
} from "lucide-react";
import type { KPICardData, KPIIconName } from "@/app/types";

/** Resolve o nome do ícone para o componente Lucide. */
const kpiIconMap: Record<KPIIconName, LucideIcon> = {
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingDown,
};

interface KPICardProps {
  readonly card: KPICardData;
  readonly index: number;
}

export default function KPICard({ card, index }: KPICardProps) {
  const Icon = kpiIconMap[card.iconName];

  const changeIcon =
    card.changeType === "positive" ? (
      <TrendingUp size={12} aria-hidden="true" />
    ) : card.changeType === "negative" ? (
      <TrendingDown size={12} aria-hidden="true" />
    ) : (
      <Minus size={12} aria-hidden="true" />
    );

  const changeColor =
    card.changeType === "positive"
      ? "text-success bg-success-light"
      : card.changeType === "negative"
      ? "text-destructive bg-destructive-light"
      : "text-muted-foreground bg-muted";

  return (
    <article
      className="animate-fadeInUp opacity-0 group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring"
      style={{ animationDelay: `${index * 100 + 100}ms` }}
      aria-label={`${card.title}: ${card.value}`}
    >
      {/* Subtle gradient accent top */}
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary to-secondary-light opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {card.title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">
            {card.value}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${changeColor}`}
            >
              {changeIcon}
              {card.change}
            </span>
          </div>
        </div>

        {/* Icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBgClass} transition-transform duration-300 group-hover:scale-110`}
          aria-hidden="true"
        >
          <Icon size={22} className={card.iconColorClass} />
        </div>
      </div>
    </article>
  );
}
