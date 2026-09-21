/* =======================================================================
 * Mock Data - Integracao SNC-AP
 * ======================================================================= */

import type { FinancialRecord, IntegrationStats } from "@/app/types/pages";

export const integrationStats: IntegrationStats = {
  totalBudget: 250000,
  spent: 187400,
  saved: 34200,
  pendingSync: 3,
  lastSyncAt: "09/04/2026, 21:45",
  syncHealth: "healthy",
};

export const financialRecords: FinancialRecord[] = [
  {
    id: "FIN-001",
    description: "Reparacao de pavimento - Av. da Liberdade",
    type: "despesa",
    amount: 4250.0,
    date: "09/04/2026",
    category: "Manutencao Viaria",
    syncStatus: "sincronizado",
    sncapCode: "62.2.1",
  },
  {
    id: "FIN-002",
    description: "Substituicao de lampadas LED - Zona Norte",
    type: "despesa",
    amount: 1870.5,
    date: "09/04/2026",
    category: "Iluminacao Publica",
    syncStatus: "sincronizado",
    sncapCode: "62.2.3",
  },
  {
    id: "FIN-003",
    description: "Verba PRR - Eficiencia municipal Q2",
    type: "receita",
    amount: 15000.0,
    date: "08/04/2026",
    category: "Financiamento PRR",
    syncStatus: "sincronizado",
    sncapCode: "72.1.1",
  },
  {
    id: "FIN-004",
    description: "Equipamento de sinalizacao de emergencia",
    type: "despesa",
    amount: 890.0,
    date: "08/04/2026",
    category: "Sinalizacao",
    syncStatus: "pendente",
    sncapCode: "62.2.5",
  },
  {
    id: "FIN-005",
    description: "Servicos de remocao de graffiti",
    type: "despesa",
    amount: 320.0,
    date: "07/04/2026",
    category: "Limpeza Urbana",
    syncStatus: "sincronizado",
    sncapCode: "62.2.8",
  },
  {
    id: "FIN-006",
    description: "Reparacao de contentor - Travessa do Carmo",
    type: "despesa",
    amount: 560.0,
    date: "07/04/2026",
    category: "Residuos",
    syncStatus: "pendente",
    sncapCode: "62.2.4",
  },
  {
    id: "FIN-007",
    description: "Manutencao de semaforos - Cruzamento Formosa",
    type: "despesa",
    amount: 2100.0,
    date: "06/04/2026",
    category: "Sinalizacao",
    syncStatus: "sincronizado",
    sncapCode: "62.2.5",
  },
  {
    id: "FIN-008",
    description: "Fundo de contingencia municipal - Abril",
    type: "receita",
    amount: 8500.0,
    date: "05/04/2026",
    category: "Fundo Municipal",
    syncStatus: "pendente",
    sncapCode: "72.1.3",
  },
];
