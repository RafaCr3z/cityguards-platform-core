"use client";

import KPIGrid from "@/app/components/dashboard/KPIGrid";
import CityMap from "@/app/components/dashboard/CityMap";
import OccurrencesList from "@/app/components/dashboard/OccurrencesList";
import ErrorBoundary from "@/app/components/ui/ErrorBoundary";

export default function DashboardPage() {
  return (
    <>
      {/* ── KPI Cards (with loading/error states) ──────── */}
      <ErrorBoundary fallbackMessage="Não foi possível carregar as métricas do dashboard.">
        <KPIGrid />
      </ErrorBoundary>

      {/* ── Map + Occurrences ───────────────────────────── */}
      <section
        id="map-occurrences-section"
        className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5"
        style={{ minHeight: "520px" }}
        aria-label="Mapa e lista de ocorrências"
      >
        {/* Map – 3/5 of the width */}
        <div className="lg:col-span-3">
          <ErrorBoundary fallbackMessage="Não foi possível carregar o mapa. Tentar novamente.">
            <CityMap />
          </ErrorBoundary>
        </div>

        {/* Occurrences list – 2/5 of the width */}
        <div className="lg:col-span-2">
          <ErrorBoundary fallbackMessage="Não foi possível carregar as ocorrências.">
            <OccurrencesList />
          </ErrorBoundary>
        </div>
      </section>
    </>
  );
}
