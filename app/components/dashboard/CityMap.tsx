"use client";

import React from "react";
import { MapPin, Crosshair, ZoomIn, ZoomOut, Layers } from "lucide-react";
import { mapPins } from "@/app/data/mockData";
import type { UrgencyLevel } from "@/app/types";

/** Classes por nível de urgência. */
const urgencyColor: Record<UrgencyLevel, string> = {
  alta: "bg-destructive",
  média: "bg-warning",
  baixa: "bg-info",
};

const urgencyRing: Record<UrgencyLevel, string> = {
  alta: "ring-destructive/30",
  média: "ring-warning/30",
  baixa: "ring-info/30",
};

export default function CityMap() {
  return (
    <div
      className="animate-fadeInUp opacity-0 delay-300 flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      role="region"
      aria-label="Mapa da cidade em tempo real com ocorrências activas"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-muted px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-bg">
            <MapPin size={16} className="text-secondary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              Mapa da Cidade em Tempo Real
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {mapPins.length} ocorrências ativas • Última atualização há 30s
            </p>
          </div>
        </div>

        {/* Map controls */}
        <div className="flex items-center gap-1" role="toolbar" aria-label="Controlos do mapa">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Aumentar zoom"
          >
            <ZoomIn size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Diminuir zoom"
          >
            <ZoomOut size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Alternar camadas do mapa"
          >
            <Layers size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ml-1 flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Centrar mapa na posição predefinida"
          >
            <Crosshair size={12} aria-hidden="true" />
            Centrar
          </button>
        </div>
      </div>

      {/* ── Map Area ────────────────────────────────────────────── */}
      <div
        className="relative flex-1 overflow-hidden bg-gradient-to-br from-secondary-bg/60 via-muted to-secondary-bg/30 map-grid"
        role="img"
        aria-label={`Mapa com ${mapPins.length} ocorrências marcadas por nível de urgência`}
      >
        {/* Simulated streets / paths */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(42,108,181,0.1)" strokeWidth="0.8" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(42,108,181,0.1)" strokeWidth="0.8" />
          <line x1="20" y1="10" x2="20" y2="90" stroke="rgba(42,108,181,0.06)" strokeWidth="0.4" />
          <line x1="80" y1="10" x2="80" y2="90" stroke="rgba(42,108,181,0.06)" strokeWidth="0.4" />
          <line x1="10" y1="25" x2="90" y2="25" stroke="rgba(42,108,181,0.06)" strokeWidth="0.4" />
          <line x1="10" y1="75" x2="90" y2="75" stroke="rgba(42,108,181,0.06)" strokeWidth="0.4" />
          <line x1="15" y1="15" x2="85" y2="85" stroke="rgba(42,108,181,0.05)" strokeWidth="0.3" />
          <line x1="30" y1="10" x2="70" y2="90" stroke="rgba(42,108,181,0.05)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(42,108,181,0.08)" strokeWidth="0.5" />
        </svg>

        {/* Zone labels */}
        <span className="absolute left-[14%] top-[14%] text-[9px] font-medium uppercase tracking-widest text-secondary/25" aria-hidden="true">
          Zona Norte
        </span>
        <span className="absolute bottom-[14%] right-[14%] text-[9px] font-medium uppercase tracking-widest text-secondary/25" aria-hidden="true">
          Zona Sul
        </span>
        <span className="absolute left-[44%] top-[44%] text-[10px] font-semibold uppercase tracking-widest text-secondary/18" aria-hidden="true">
          Centro
        </span>

        {/* Pins */}
        {mapPins.map((pin) => (
          <div
            key={pin.id}
            className="group absolute cursor-pointer"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            role="button"
            tabIndex={0}
            aria-label={`Ocorrência: ${pin.title} — Urgência ${pin.urgency}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                // Futuramente: abrir detalhe da ocorrência
              }
            }}
          >
            {/* Pulse ring */}
            <span
              className={`absolute inset-0 rounded-full ring-4 ${urgencyRing[pin.urgency]} animate-mapPulse`}
              style={{ margin: "-6px" }}
              aria-hidden="true"
            />
            {/* Pin dot */}
            <span
              className={`relative block h-3.5 w-3.5 rounded-full ${urgencyColor[pin.urgency]} ring-3 ring-card shadow-lg transition-transform group-hover:scale-150 group-focus-visible:scale-150`}
              aria-hidden="true"
            />
            {/* Tooltip */}
            <span
              className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none"
              role="tooltip"
            >
              {pin.title}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" aria-hidden="true" />
            </span>
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-xl bg-card/90 px-4 py-2.5 shadow-sm backdrop-blur-sm border border-border">
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" aria-hidden="true" />
            Alta
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-warning" aria-hidden="true" />
            Média
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-info" aria-hidden="true" />
            Baixa
          </span>
        </div>
      </div>
    </div>
  );
}
