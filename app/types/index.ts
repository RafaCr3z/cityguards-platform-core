/* =====================================================================
 * CityGuards — Definições de Tipos (Enterprise-Grade)
 *
 * Ficheiro central de tipos para todo o projecto. Todos os componentes,
 * hooks e módulos de dados DEVEM importar tipos daqui.
 * ===================================================================== */

/* ── Enums ──────────────────────────────────────────────────────────── */

/** Nível de urgência de uma ocorrência. */
export type UrgencyLevel = "alta" | "média" | "baixa";

/** Estado do ciclo de vida de uma ocorrência. */
export type OccurrenceStatus = "Pendente" | "Em Resolução" | "Resolvida";

/** Tipo de variação de uma métrica em relação ao período anterior. */
export type ChangeType = "positive" | "negative" | "neutral";

/* ── Entidades Principais ───────────────────────────────────────────── */

/** Representa uma ocorrência urbana reportada por um cidadão. */
export interface Occurrence {
  /** Identificador único (ex: "OC-2026-0471"). */
  readonly id: string;
  /** Título descritivo (ex: "Buraco na estrada"). */
  title: string;
  /** Morada ou referência geográfica. */
  location: string;
  /** Estado actual dentro do fluxo de resolução. */
  status: OccurrenceStatus;
  /** Grau de urgência atribuído — pode ser automático ou manual. */
  urgency: UrgencyLevel;
  /** Texto legível do momento do reporte (ex: "Há 12 min"). */
  reportedAt: string;
  /** Categoria temática (ex: "Pavimento", "Iluminação"). */
  category: string;
}

/** Um membro de uma equipa de manutenção no terreno. */
export interface Worker {
  readonly id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

/** Equipa de intervenção no terreno. */
export interface Team {
  readonly id: string;
  name: string;
  members: Worker[];
  status: "ativa" | "em pausa" | "inativa";
  currentOccurrenceId?: string;
}

/* ── KPIs e Métricas ────────────────────────────────────────────────── */

/** Ícones válidos para cartões de KPI (resolvidos no componente). */
export type KPIIconName =
  | "AlertTriangle"
  | "CheckCircle2"
  | "Users"
  | "TrendingDown";

/** Definição de um cartão de KPI no dashboard. */
export interface KPICardData {
  readonly id: string;
  /** Título da métrica (ex: "Ocorrências Abertas"). */
  title: string;
  /** Valor principal formatado (ex: "47", "€34.2k"). */
  value: string;
  /** Texto de variação (ex: "+5 hoje"). */
  change: string;
  /** Direcção da variação para coloração. */
  changeType: ChangeType;
  /** Nome do ícone Lucide — resolvido no runtime. */
  iconName: KPIIconName;
  /** Classe Tailwind para o fundo do ícone (semântica). */
  iconBgClass: string;
  /** Classe Tailwind para a cor do ícone (semântica). */
  iconColorClass: string;
}

/** Estatísticas agregadas do dashboard, retornadas pelo hook. */
export interface DashboardStats {
  kpis: KPICardData[];
  /** Resumo para screen-readers / cabeçalho. */
  summary: string;
}

/* ── Mapa ───────────────────────────────────────────────────────────── */

/** Pin georreferenciado no mapa (coordenadas % para layout simples). */
export interface MapPin {
  readonly id: string;
  /** Posição horizontal em percentagem (0-100). */
  x: number;
  /** Posição vertical em percentagem (0-100). */
  y: number;
  urgency: UrgencyLevel;
  title: string;
}

/* ── Navegação ──────────────────────────────────────────────────────── */

/** Chaves de ícones válidas para a sidebar. */
export type NavIconName =
  | "LayoutDashboard"
  | "AlertTriangle"
  | "Users"
  | "FileBarChart"
  | "Settings";

/** Item de navegação na sidebar. */
export interface NavItem {
  /** Texto visível do link. */
  label: string;
  /** Rota destino. */
  href: string;
  /** Nome do ícone Lucide (resolvido no componente). */
  iconName: NavIconName;
  /** Se true, o item está seleccionado na página actual. */
  active?: boolean;
  /** Badge numérico opcional (novos itens). */
  badge?: number;
}

/* ── Estado dos Hooks ───────────────────────────────────────────────── */

/** Tipo genérico para o retorno de hooks de dados assíncronos. */
export interface AsyncState<T> {
  /** Dados retornados pela "API" (null enquanto não carrega). */
  data: T | null;
  /** True durante o carregamento inicial. */
  isLoading: boolean;
  /** Erro retornado, se existir. */
  error: Error | null;
}

/* ── Componentes UI ─────────────────────────────────────────────────── */

/** Props para o componente genérico de ErrorBoundary. */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Mensagem exibida ao utilizador quando o componente falha. */
  fallbackMessage?: string;
  /** Callback opcional para retry. */
  onRetry?: () => void;
}

/** Estado interno do ErrorBoundary. */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
