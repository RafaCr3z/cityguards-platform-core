/* =======================================================================
 * CityGuards — Mock Data
 *
 * Dados simulados para o MVP. Todas as entidades são tipadas com as
 * interfaces definidas em @/app/types. Nenhum campo usa `any`.
 * ======================================================================= */

import type {
  Occurrence,
  KPICardData,
  NavItem,
  MapPin,
  DashboardStats,
} from "@/app/types";

/* ── Navegação ───────────────────────────────────────────────────────── */

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", iconName: "LayoutDashboard", active: true },
  {
    label: "Ocorrências",
    href: "/ocorrencias",
    iconName: "AlertTriangle",
    badge: 12,
  },
  { label: "Equipas no Terreno", href: "/equipas", iconName: "Users" },
  { label: "Integração SNC-AP", href: "/sncap", iconName: "FileBarChart" },
  { label: "Definições", href: "/definicoes", iconName: "Settings" },
];

/* ── KPIs ────────────────────────────────────────────────────────────── */

export const kpiCards: KPICardData[] = [
  {
    id: "kpi-open",
    title: "Ocorrências Abertas",
    value: "47",
    change: "+5 hoje",
    changeType: "negative",
    iconName: "AlertTriangle",
    iconBgClass: "bg-destructive-light",
    iconColorClass: "text-destructive",
  },
  {
    id: "kpi-resolved",
    title: "Resolvidas Hoje",
    value: "23",
    change: "+12% vs. ontem",
    changeType: "positive",
    iconName: "CheckCircle2",
    iconBgClass: "bg-success-light",
    iconColorClass: "text-success",
  },
  {
    id: "kpi-teams",
    title: "Equipas Ativas",
    value: "8 / 12",
    change: "4 em pausa",
    changeType: "neutral",
    iconName: "Users",
    iconBgClass: "bg-info-light",
    iconColorClass: "text-info",
  },
  {
    id: "kpi-savings",
    title: "Verbas PRR Poupadas",
    value: "€34.2k",
    change: "−18% custos operacionais",
    changeType: "positive",
    iconName: "TrendingDown",
    iconBgClass: "bg-warning-light",
    iconColorClass: "text-warning",
  },
];

/* ── Dashboard Stats (agregação) ─────────────────────────────────────── */

export const dashboardStats: DashboardStats = {
  kpis: kpiCards,
  summary: "47 ocorrências abertas, 23 resolvidas hoje, 8 equipas ativas.",
};

/* ── Ocorrências Recentes ────────────────────────────────────────────── */

export const recentOccurrences: Occurrence[] = [
  {
    id: "OC-2026-0471",
    title: "Buraco na estrada",
    location: "Av. da Liberdade, nº 142",
    status: "Pendente",
    urgency: "alta",
    reportedAt: "Há 12 min",
    category: "Pavimento",
  },
  {
    id: "OC-2026-0470",
    title: "Lâmpada fundida",
    location: "Rua de Sta. Catarina, nº 38",
    status: "Em Resolução",
    urgency: "média",
    reportedAt: "Há 34 min",
    category: "Iluminação",
  },
  {
    id: "OC-2026-0469",
    title: "Graffiti em fachada",
    location: "Praça do Município, nº 5",
    status: "Pendente",
    urgency: "baixa",
    reportedAt: "Há 1h 10min",
    category: "Vandalismo",
  },
  {
    id: "OC-2026-0468",
    title: "Contentor de lixo danificado",
    location: "Travessa do Carmo, nº 22",
    status: "Em Resolução",
    urgency: "alta",
    reportedAt: "Há 1h 48min",
    category: "Resíduos",
  },
  {
    id: "OC-2026-0467",
    title: "Sinal de trânsito partido",
    location: "Rotunda do Marquês",
    status: "Pendente",
    urgency: "alta",
    reportedAt: "Há 2h 05min",
    category: "Sinalização",
  },
  {
    id: "OC-2026-0466",
    title: "Fuga de água na via pública",
    location: "Rua do Almada, nº 89",
    status: "Em Resolução",
    urgency: "média",
    reportedAt: "Há 3h 22min",
    category: "Infraestrutura",
  },
  {
    id: "OC-2026-0465",
    title: "Banco de jardim vandalizado",
    location: "Jardim Municipal, zona norte",
    status: "Pendente",
    urgency: "baixa",
    reportedAt: "Há 5h 10min",
    category: "Mobiliário Urbano",
  },
];

/* ── Pins do Mapa (coordenadas percentuais) ──────────────────────────── */

export const mapPins: MapPin[] = [
  { id: "p1", x: 32, y: 28, urgency: "alta", title: "Buraco na estrada" },
  { id: "p2", x: 55, y: 42, urgency: "média", title: "Lâmpada fundida" },
  { id: "p3", x: 72, y: 18, urgency: "baixa", title: "Graffiti em fachada" },
  { id: "p4", x: 20, y: 62, urgency: "alta", title: "Contentor danificado" },
  { id: "p5", x: 65, y: 68, urgency: "alta", title: "Sinal de trânsito partido" },
  { id: "p6", x: 42, y: 55, urgency: "média", title: "Fuga de água" },
  { id: "p7", x: 80, y: 45, urgency: "baixa", title: "Banco vandalizado" },
];
