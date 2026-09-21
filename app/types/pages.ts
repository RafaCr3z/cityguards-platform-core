/* =======================================================================
 * CityGuards - Tipos adicionais para paginas secundarias
 * ======================================================================= */

import type { OccurrenceStatus } from "./index";

/* -- Equipas no Terreno ------------------------------------------------ */

export type TeamStatus = "ativa" | "em pausa" | "inativa";

export interface TeamMember {
  readonly id: string;
  name: string;
  role: string;
  avatarInitials: string;
}

export interface FieldTeam {
  readonly id: string;
  name: string;
  status: TeamStatus;
  members: TeamMember[];
  currentOccurrenceId: string | null;
  currentOccurrenceTitle: string | null;
  completedToday: number;
  zone: string;
}

/* -- Integracao SNC-AP ------------------------------------------------- */

export type SyncStatus = "sincronizado" | "pendente" | "erro";

export interface FinancialRecord {
  readonly id: string;
  description: string;
  type: "receita" | "despesa";
  amount: number;
  date: string;
  category: string;
  syncStatus: SyncStatus;
  sncapCode: string;
}

export interface IntegrationStats {
  totalBudget: number;
  spent: number;
  saved: number;
  pendingSync: number;
  lastSyncAt: string;
  syncHealth: "healthy" | "warning" | "error";
}

/* -- Definicoes -------------------------------------------------------- */

export type SettingsTab = "perfil" | "notificacoes" | "sistema" | "seguranca";

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SystemSetting {
  id: string;
  label: string;
  description: string;
  value: string;
  type: "select" | "toggle" | "text";
  options?: string[];
}
