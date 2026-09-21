"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Award, 
  PlusCircle, 
  MapPin, 
  Clock, 
  LogOut, 
  Gift, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Search
} from "lucide-react";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  municipio: string;
  tipoUtilizador: string;
  pontosGamificacao: number;
}

interface Occurrence {
  id: string;
  titulo: string;
  descricao: string;
  municipio: string;
  categoria: string;
  estado: string;
  localizacao: {
    latitude: number;
    longitude: number;
  };
  fotografiaUrl: string;
  dataReporte: string;
}

// Recompensas pré-definidas para a montra local
const LOCAL_REWARDS = [
  { id: "r1", title: "Entrada Grátis - Piscinas Municipais", cost: 100, category: "Desporto", desc: "Acesso de 1 dia às piscinas olímpicas municipais." },
  { id: "r2", title: "Desconto 15% - Comércio Tradicional", cost: 150, category: "Comércio", desc: "Cupão de desconto aplicável em lojas locais parceiras." },
  { id: "r3", title: "Bilhete Grátis - Museus da Cidade", cost: 80, category: "Cultura", desc: "Entrada livre para todas as exposições temporárias e permanentes." },
  { id: "r4", title: "Passe Mensal - Transportes Públicos", cost: 500, category: "Mobilidade", desc: "Assinatura mensal para autocarros urbanos municipais." },
  { id: "r5", title: "Aluguer Bicicleta Elétrica (2h)", cost: 50, category: "Sustentabilidade", desc: "Utilização gratuita da rede de partilha municipal de e-bikes." },
];

export default function CitizenDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const storedUser = localStorage.getItem("cityguards_user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(storedUser) as UserProfile;
    if (userData.tipoUtilizador !== "Cidadao") {
      window.location.href = "/dashboard";
      return;
    }

    fetchProfileAndOccurrences(userData.id);
  }, []);

  const fetchProfileAndOccurrences = async (userId: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // 1. Fetch Perfil Atualizado (Pontos)
      const userRes = await fetch(`/api/users/${userId}`);
      if (!userRes.ok) throw new Error("Não foi possível carregar as informações do perfil.");
      const freshUser = await userRes.json();
      setUser(freshUser);

      // Guardar perfil atualizado no localStorage
      localStorage.setItem("cityguards_user", JSON.stringify(freshUser));

      // 2. Fetch Ocorrências do Cidadão
      const occRes = await fetch(`/api/occurrences?cidadaoId=${userId}`);
      if (!occRes.ok) throw new Error("Não foi possível obter o histórico de ocorrências.");
      const occData = await occRes.json();
      setOccurrences(occData);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de ligação ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cityguards_user");
    window.location.href = "/";
  };

  const handleRedeem = async (rewardTitle: string, cost: number) => {
    if (!user) return;
    if (user.pontosGamificacao < cost) {
      setErrorMsg(`Pontos insuficientes! Precisa de ${cost} pontos.`);
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }

    setIsRedeeming(rewardTitle);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`/api/users/${user.id}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recompensaNome: rewardTitle, custoPontos: cost }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao processar a troca.");

      setSuccessMsg(`Recompensa '${rewardTitle}' resgatada com sucesso! Código gerado enviado para o seu email.`);
      
      // Atualizar o perfil do cidadão após a troca
      const updatedUser = { ...user, pontosGamificacao: data.novosPontos };
      setUser(updatedUser);
      localStorage.setItem("cityguards_user", JSON.stringify(updatedUser));

      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao efetuar a troca.");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setIsRedeeming(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Resolvida":
        return "bg-success/10 text-success border border-success/30";
      case "Em Resolução":
        return "bg-info/10 text-info border border-info/30";
      default:
        return "bg-warning/10 text-warning border border-warning/30";
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={40} className="text-secondary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">A carregar o seu portal cívico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-accent shadow-sm">
              <Shield size={18} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">CityGuards</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">
              Munícipe de {user?.municipio}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors font-semibold"
              title="Sair da conta"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Container ────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 lg:px-8 mt-10">
        
        {/* Banner de Mensagens */}
        {successMsg && (
          <div className="mb-6 rounded-xl bg-success-light/30 border border-success/30 p-4 flex gap-3 text-sm text-success animate-fadeIn">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 rounded-xl bg-destructive-light/30 border border-destructive/30 p-4 flex gap-3 text-sm text-destructive animate-fadeIn">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {/* ── Perfil / Pontos Grid ───────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card de Boas-vindas e Pontos */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 p-8 shadow-sm">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                  Olá, <span className="text-secondary-light">{user?.nome}</span>!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Obrigado por contribuir para um concelho mais limpo e organizado. Cada problema reportado ajuda toda a comunidade.
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary-light shadow-md text-secondary-foreground animate-bounce">
                    <Award size={30} />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Saldo de Pontos Cívicos</span>
                    <h2 className="text-3xl font-extrabold text-foreground">{user?.pontosGamificacao} <span className="text-xs font-semibold text-secondary-light">pts</span></h2>
                  </div>
                </div>

                <Link
                  href="/cidadao/reportar"
                  className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-lg hover:bg-secondary-light hover:scale-105 active:scale-95 transition-all"
                >
                  <PlusCircle size={16} />
                  Reportar Ocorrência
                </Link>
              </div>
            </div>
            {/* Background design */}
            <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 -z-10 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
          </div>

          {/* Mini-Estatísticas */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-card-foreground">Resumo Cívico</h3>
              <p className="text-xs text-muted-foreground">O impacto das suas ações no seu município.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-muted/50 p-4 rounded-2xl text-center border border-muted">
                <span className="text-2xl font-bold block text-foreground">{occurrences.length}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Reportes</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-2xl text-center border border-muted">
                <span className="text-2xl font-bold block text-success">
                  {occurrences.filter(o => o.estado === "Resolvida").length}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Resolvidos</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-6 bg-secondary/5 border border-secondary/10 p-3 rounded-xl flex gap-2">
              <Gift size={16} className="text-secondary shrink-0" />
              <span>Ganha até 50 pontos por ocorrência que for resolvida pelas equipas municipais!</span>
            </div>
          </div>
        </section>

        {/* ── Histórico e Montra Tabs ────────────────────────── */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Histórico - 3/5 width */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">As Minhas Ocorrências</h3>
                <p className="text-xs text-muted-foreground">Acompanhe em tempo real o estado de resolução dos seus alertas.</p>
              </div>
              <button 
                onClick={() => user && fetchProfileAndOccurrences(user.id)}
                className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                title="Atualizar lista"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="space-y-3">
              {occurrences.length > 0 ? (
                occurrences.map((occ) => (
                  <div key={occ.id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex gap-4">
                      {occ.fotografiaUrl ? (
                        <img 
                          src={occ.fotografiaUrl} 
                          alt={occ.titulo} 
                          className="h-14 w-14 rounded-xl object-cover shrink-0 border border-border" 
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-xs uppercase">
                          No Pic
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                          {occ.titulo}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                          {occ.descricao}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} />
                            Lat: {occ.localizacao.latitude.toFixed(4)} | Lon: {occ.localizacao.longitude.toFixed(4)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} />
                            {new Date(occ.dataReporte).toLocaleDateString("pt-PT")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(occ.estado)}`}>
                        {occ.estado}
                      </span>
                      {occ.estado === "Resolvida" && (
                        <span className="text-[10px] text-success font-semibold flex items-center gap-0.5">
                          <Award size={10} /> +Pontos Creditados
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card">
                  <AlertTriangle size={24} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-semibold text-card-foreground">Nenhuma ocorrência registada</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Ainda não submeteu nenhum reporte no sistema.</p>
                  <Link
                    href="/cidadao/reportar"
                    className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Registar Primeira Ocorrência
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Montra de Recompensas - 2/5 width */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Montra de Recompensas</h3>
              <p className="text-xs text-muted-foreground">Troque os seus pontos por benefícios no comércio e infraestruturas locais.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {LOCAL_REWARDS.map((reward) => {
                const canAfford = (user?.pontosGamificacao ?? 0) >= reward.cost;
                const isProcessing = isRedeeming === reward.title;

                return (
                  <div key={reward.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] uppercase font-extrabold tracking-wider bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full">
                          {reward.category}
                        </span>
                        <h4 className="text-sm font-bold mt-2 text-foreground">{reward.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{reward.desc}</p>
                      </div>
                      
                      <div className="bg-muted px-3 py-1.5 rounded-xl text-center shrink-0 border border-border">
                        <span className="text-xs font-extrabold block text-foreground">{reward.cost}</span>
                        <span className="text-[8px] uppercase text-muted-foreground font-bold">pontos</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeem(reward.title, reward.cost)}
                      disabled={!canAfford || isProcessing}
                      className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                        canAfford 
                          ? "bg-secondary text-secondary-foreground shadow hover:bg-secondary-light cursor-pointer active:scale-[0.98]" 
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      }`}
                    >
                      {isProcessing ? (
                        <span className="inline-flex items-center gap-1">
                          <RefreshCw size={10} className="animate-spin" /> A processar...
                        </span>
                      ) : canAfford ? (
                        "Trocar Pontos"
                      ) : (
                        `Faltam ${reward.cost - (user?.pontosGamificacao ?? 0)} pontos`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
