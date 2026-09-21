"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardStats, AsyncState, KPICardData } from "@/app/types";

export function useDashboardStats(): AsyncState<DashboardStats> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<DashboardStats>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      // 1. Obter município logado do localStorage
      let municipio = "";
      const storedUser = localStorage.getItem("cityguards_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.tipoUtilizador === "Autarquia") {
          municipio = user.municipio;
        }
      }

      if (!municipio) {
        municipio = "Castelo Branco";
      }

      // 2. Obter ocorrências do município
      const response = await fetch(`/api/occurrences?municipio=${encodeURIComponent(municipio)}`);
      if (!response.ok) {
        throw new Error("Não foi possível carregar as estatísticas da API do Firestore.");
      }

      const occurrences = await response.json();

      // 3. Processar métricas dinamicamente
      const abertas = occurrences.filter((o: any) => o.estado === "Pendente" || o.estado === "Em Resolução").length;
      const resolvidas = occurrences.filter((o: any) => o.estado === "Resolvida").length;
      
      // Simular variação diária (ex: ocorrências abertas hoje)
      const criadasHoje = occurrences.filter((o: any) => {
        const dataReporte = new Date(o.dataReporte);
        const hoje = new Date();
        return dataReporte.toDateString() === hoje.toDateString();
      }).length;

      // Calcular despesa poupada estimada (cada ocorrência resolvida poupa aprox. €1,200 em manutenção tardia)
      const poupancaPRR = (resolvidas * 1200) / 1000; // em milhares k€

      const kpis: KPICardData[] = [
        {
          id: "kpi-open",
          title: "Ocorrências Abertas",
          value: abertas.toString(),
          change: `+${criadasHoje} hoje`,
          changeType: criadasHoje > 0 ? "negative" : "neutral", // mais abertas hoje é negativo para a autarquia
          iconName: "AlertTriangle",
          iconBgClass: "bg-destructive-light",
          iconColorClass: "text-destructive",
        },
        {
          id: "kpi-resolved",
          title: "Total de Resolvidas",
          value: resolvidas.toString(),
          change: `Taxa de ${occurrences.length > 0 ? Math.round((resolvidas / occurrences.length) * 100) : 0}%`,
          changeType: "positive",
          iconName: "CheckCircle2",
          iconBgClass: "bg-success-light",
          iconColorClass: "text-success",
        },
        {
          id: "kpi-teams",
          title: "Equipas Ativas",
          value: "8 / 12",
          change: "4 prontas no quartel",
          changeType: "neutral",
          iconName: "Users",
          iconBgClass: "bg-info-light",
          iconColorClass: "text-info",
        },
        {
          id: "kpi-savings",
          title: "Poupado SNC-AP/PRR",
          value: `€${poupancaPRR.toFixed(1)}k`,
          change: "Prevenção infraestruturas",
          changeType: "positive",
          iconName: "TrendingDown",
          iconBgClass: "bg-warning-light",
          iconColorClass: "text-warning",
        },
      ];

      setState({
        data: {
          kpis,
          summary: `${abertas} ocorrências abertas, ${resolvidas} resolvidas na jurisdição de ${municipio}.`,
        },
        isLoading: false,
        error: null,
      });

    } catch (err: any) {
      console.error("Erro ao carregar KPIs do Firestore:", err);
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err : new Error(err.message || "Erro desconhecido"),
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
