"use client";

import { useState, useEffect, useCallback } from "react";
import type { Occurrence, AsyncState } from "@/app/types";

const getUrgency = (categoria: string): "alta" | "média" | "baixa" => {
  if (categoria === "Vias Públicas") return "alta";
  if (categoria === "Iluminação Pública") return "média";
  return "baixa";
};

export function useOccurrences(): AsyncState<Occurrence[]> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<Occurrence[]>>({
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

      // 2. Fetch das ocorrências do município
      const response = await fetch(`/api/occurrences?municipio=${encodeURIComponent(municipio)}`);
      if (!response.ok) {
        throw new Error("Não foi possível carregar as ocorrências recentes.");
      }

      const rawData = await response.json();

      // 3. Mapear para o formato esperado pelo frontend
      const mapped: Occurrence[] = rawData.slice(0, 7).map((occ: any) => ({
        id: occ.id,
        title: occ.titulo || `Ocorrência #${occ.id.substring(0, 5)}`,
        location: occ.localizacao 
          ? `Lat: ${occ.localizacao.latitude.toFixed(4)} | Lon: ${occ.localizacao.longitude.toFixed(4)}`
          : "Coordenadas não disponíveis",
        status: occ.estado || "Pendente",
        urgency: getUrgency(occ.categoria || ""),
        reportedAt: occ.dataReporte 
          ? new Date(occ.dataReporte).toLocaleDateString("pt-PT")
          : "Recente",
        category: occ.categoria || "Outros",
      }));

      setState({
        data: mapped,
        isLoading: false,
        error: null,
      });

    } catch (err: any) {
      console.error("Erro no useOccurrences:", err);
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
