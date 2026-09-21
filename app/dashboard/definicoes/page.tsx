"use client";

import React, { useState } from "react";
import { User, Bell, ShieldCheck, HardDrive, Laptop, GlobeLock, Smartphone, Mail, Key, AlertTriangle, FileBarChart, CheckCircle2 } from "lucide-react";

type TabId = "perfil" | "notificacoes" | "sistema" | "seguranca";

export default function DefinicoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("perfil");

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "perfil", label: "Perfil", icon: <User size={16} /> },
    { id: "notificacoes", label: "Notificacoes", icon: <Bell size={16} /> },
    { id: "sistema", label: "Sistema", icon: <HardDrive size={16} /> },
    { id: "seguranca", label: "Seguranca & Acessos", icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Definicoes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerir configuracoes da plataforma, perfil de utilizador e conectividade.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full shrink-0 lg:w-64">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0" aria-label="Novedades de definicoes">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          
          {/* PERFIL */}
          {activeTab === "perfil" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Informacao do Perfil</h2>
                <p className="text-sm text-muted-foreground">Os dadas exibidos publicamente na plataforma.</p>
              </div>
              <div className="h-px w-full bg-muted" />

              <div className="flex gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-accent to-secondary text-xl font-bold text-primary-foreground shadow-md">
                  AD
                </div>
                <div>
                  <button type="button" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                    Mudar Fotografia
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground">JPG, GIF ou PNG. Max: 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-card-foreground">Nome Completo</label>
                  <input id="name" type="text" defaultValue="Administrador" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-card-foreground">Email de Trabalho</label>
                  <input id="email" type="email" defaultValue="admin@cityguards.pt" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="cargo" className="text-sm font-medium text-card-foreground">Cargo Institucional</label>
                  <input id="cargo" type="text" defaultValue="Gestor de Operacoes - Camara Municipal" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button type="button" className="rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary-light transition-colors">
                  Guardar Alteracoes
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICACOES */}
          {activeTab === "notificacoes" && (
            <div className="space-y-8 animate-fadeIn">
               <div>
                <h2 className="text-lg font-semibold text-card-foreground">Preferencias de Notificacao</h2>
                <p className="text-sm text-muted-foreground">Selecione como quer ser alertado sobre as ocorrencias.</p>
              </div>
              <div className="h-px w-full bg-muted" />

              <div className="space-y-6">
                {[
                  { id: "n1", title: "Novas Ocorrencias", desc: "Sempre que um cidadao reportar um problema.", def: true, icon: AlertTriangle },
                  { id: "n2", title: "Mudancas de Estado", desc: "Quando uma equipa assumir ou resolver uma ocorrencia.", def: true, icon: CheckCircle2 },
                  { id: "n3", title: "Alertas SNC-AP", desc: "Erros de sincronizacao com o sistema financeiro.", def: false, icon: FileBarChart },
                ].map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                     <div className="flex gap-3">
                       <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                         <item.icon size={14} className="text-muted-foreground" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-card-foreground">{item.title}</p>
                         <p className="text-xs text-muted-foreground">{item.desc}</p>
                       </div>
                     </div>
                     {/* Toggle */}
                     <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked={item.def} />
                        <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-card after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2"></div>
                     </label>
                  </div>
                ))}
              </div>

               <div className="mt-8">
                 <p className="mb-4 text-sm font-semibold text-card-foreground">Canais de Notificacao</p>
                 <div className="flex gap-4">
                   <label className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted/50 cursor-pointer">
                     <input type="checkbox" className="accent-secondary" defaultChecked />
                     <Mail size={16} className="text-muted-foreground" /> Email
                   </label>
                   <label className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted/50 cursor-pointer">
                     <input type="checkbox" className="accent-secondary" defaultChecked />
                     <Smartphone size={16} className="text-muted-foreground" /> App Mobile
                   </label>
                 </div>
               </div>
            </div>
          )}

          {/* SISTEMA (Placeholder) */}
          {activeTab === "sistema" && (
            <div className="space-y-6 animate-fadeIn">
               <div>
                <h2 className="text-lg font-semibold text-card-foreground">Parametros do Sistema</h2>
                <p className="text-sm text-muted-foreground">Configuracoes gerais de operacao e integracoes.</p>
              </div>
              <div className="h-px w-full bg-muted" />

              <div className="rounded-xl border border-warning/30 bg-warning-light/50 px-6 py-4">
                <div className="flex gap-3">
                  <AlertTriangle size={20} className="text-warning shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">Modo de Manutencao Agendado</p>
                    <p className="mt-1 text-xs text-muted-foreground">O sistema estara indisponivel entre as 02:00 e as 04:00 da proxima terca-feira para uma atualizacao da base de dados geografica.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Frequencia de Auto-Refresh</label>
                  <select className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option>10 segundos</option>
                    <option selected>30 segundos</option>
                    <option>1 minuto</option>
                    <option>5 minutos</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Lingua do Interface</label>
                  <select className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option selected>Portugues (Portugal)</option>
                    <option>Ingles (UK)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SEGURANCA */}
          {activeTab === "seguranca" && (
             <div className="space-y-8 animate-fadeIn">
                <div>
                <h2 className="text-lg font-semibold text-card-foreground">Seguranca e Sessao</h2>
                <p className="text-sm text-muted-foreground">Gira a sua palavra-passe e dispositivos ativos.</p>
              </div>
              <div className="h-px w-full bg-muted" />

              <div className="space-y-4 max-w-md">
                 <p className="text-sm font-semibold text-card-foreground">Alterar Palavra-Passe</p>
                 <div className="space-y-3">
                    <div className="relative">
                      <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="password" placeholder="Palavra-passe Atual" className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="relative">
                      <GlobeLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="password" placeholder="Nova Palavra-passe" className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="relative">
                      <GlobeLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="password" placeholder="Confirmar Nova Palavra-passe" className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                 </div>
                  <button type="button" className="mt-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary-light transition-colors">
                    Atualizar Palavra-Passe
                  </button>
              </div>

               <div className="mt-8">
                 <p className="mb-4 text-sm font-semibold text-card-foreground">Sessoes Ativas</p>
                 <div className="rounded-xl border border-border">
                    <div className="flex items-center justify-between p-4 border-b border-muted">
                        <div className="flex gap-3 items-center">
                          <Laptop size={18} className="text-secondary" />
                          <div>
                            <p className="text-sm font-medium text-card-foreground">Windows 11 · Chrome</p>
                            <p className="text-[11px] text-muted-foreground">Lisboa, PT (Estado: Ativo agora)</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-success-light px-2 py-0.5 text-[10px] font-bold text-success">Atual</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex gap-3 items-center">
                          <Smartphone size={18} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-card-foreground">iOS 17.1 · Safari</p>
                            <p className="text-[11px] text-muted-foreground">Porto, PT (Ultimo acesso: ontem)</p>
                          </div>
                        </div>
                        <button type="button" className="text-[11px] font-medium text-destructive hover:underline">
                          Terminar
                        </button>
                    </div>
                 </div>
               </div>

             </div>
          )}

        </div>
      </div>
    </div>
  );
}
