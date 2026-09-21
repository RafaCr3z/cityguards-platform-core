"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Occurrence, OccurrenceStatus, AsyncState } from "@/app/types";

export interface OccurrenceFilters {
  status: OccurrenceStatus | "Todas";
  search: string;
}

interface UseAllOccurrencesReturn extends AsyncState<Occurrence[]> {
  filtered: Occurrence[];
  filters: OccurrenceFilters;
  setFilters: (partial: Partial<OccurrenceFilters>) => void;
  counts: Record<OccurrenceStatus | "Todas", number>;
  refetch: () => void;
}

const getUrgency = (categoria: string): "alta" | "média" | "baixa" => {
  if (categoria === "Vias Públicas") return "alta";
  if (categoria === "Iluminação Pública") return "média";
  return "baixa";
};

export function useAllOccurrences(): UseAllOccurrencesReturn {
  const [state, setState] = useState<AsyncState<Occurrence[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const [filters, setFiltersState] = useState<OccurrenceFilters>({
    status: "Todas",
    search: "",
  });

  const fetchData = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      // 1. Obter o município do utilizador autárquico a partir do localStorage
      let municipio = "";
      const storedUser = localStorage.getItem("cityguards_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.tipoUtilizador === "Autarquia") {
          municipio = user.municipio;
        }
      }

      // Se não houver município logado, usamos um padrão para testes
      if (!municipio) {
        municipio = "Castelo Branco";
      }

      // 2. Fazer pedido real ao backend
      const response = await fetch(`/api/occurrences?municipio=${encodeURIComponent(municipio)}`);
      if (!response.ok) {
        throw new Error("Não foi possível estabelecer ligação com a API do Firestore.");
      }

      const rawData = await response.json();

      // 3. Mapear dados do Firestore para o tipo Occurrence esperado pelo frontend
      const mappedOccurrences: Occurrence[] = rawData.map((occ: any) => ({
        id: occ.id,
        title: occ.titulo || `Ocorrência #${occ.id.substring(0, 5)}`,
        location: occ.localizacao 
          ? `Lat: ${occ.localizacao.latitude.toFixed(4)} | Lon: ${occ.localizacao.longitude.toFixed(4)}`
          : "Coordenadas não disponíveis",
        status: (occ.estado === "Em Resolução" || occ.estado === "Resolvida" || occ.estado === "Pendente") 
          ? occ.estado 
          : "Pendente",
        urgency: getUrgency(occ.categoria || ""),
        reportedAt: occ.dataReporte 
          ? new Date(occ.dataReporte).toLocaleDateString("pt-PT") + " " + new Date(occ.dataReporte).toLocaleTimeString("pt-PT", {hour: '2-digit', minute:'2-digit'})
          : "Data desconhecida",
        category: occ.categoria || "Outros",
        // Campo extra para visualização rápida no dashboard se necessário
        fotografiaUrl: occ.fotografiaUrl || "",
        descricao: occ.descricao || ""
      }));

      setState({
        data: mappedOccurrences,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Erro ao carregar dados do Firestore:", err);
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

  const setFilters = useCallback(
    (partial: Partial<OccurrenceFilters>) => {
      setFiltersState((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const filtered = useMemo(() => {
    if (!state.data) return [];

    return state.data.filter((occ) => {
      if (filters.status !== "Todas" && occ.status !== filters.status) {
        return false;
      }

      if (filters.search.trim()) {
        const term = filters.search.toLowerCase();
        return (
          occ.title.toLowerCase().includes(term) ||
          occ.location.toLowerCase().includes(term) ||
          occ.id.toLowerCase().includes(term) ||
          occ.category.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [state.data, filters]);

  const counts = useMemo(() => {
    const data = state.data ?? [];
    return {
      Todas: data.length,
      Pendente: data.filter((o) => o.status === "Pendente").length,
      "Em Resolução": data.filter((o) => o.status === "Em Resolução").length,
      Resolvida: data.filter((o) => o.status === "Resolvida").length,
    };
  }, [state.data]);

  return {
    ...state,
    filtered,
    filters,
    setFilters,
    counts,
    refetch: fetchData,
  };
}
