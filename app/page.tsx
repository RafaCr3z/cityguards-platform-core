import React from "react";
import Link from "next/link";
import { Shield, AlertTriangle, MapPin, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";

export default function CitizenPortal() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Public Navbar ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-accent shadow-sm">
              <Shield size={18} className="text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">CityGuards</span>
          </div>
          <div className="flex flex-1 justify-center hidden md:flex">
             <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
                <a href="#app" className="hover:text-foreground transition-colors">App Mobile</a>
                <a href="#contacto" className="hover:text-foreground transition-colors">Contacto Câmara</a>
             </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition-all hover:bg-muted hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entrar / Registar
            <ArrowRight size={14} className="text-muted-foreground" aria-hidden="true" />
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────── */}
      <main>
        <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
           {/* Background Decorations */}
           <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
           <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
             <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-secondary opacity-20" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
           </div>

           <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center animate-fadeInUp">
              <div className="mx-auto max-w-3xl">
                 <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl text-balance">
                    A sua cidade, nas suas mãos.
                 </h1>
                 <p className="mt-6 text-lg leading-8 text-muted-foreground text-balance">
                    O CityGuards liga os cidadãos diretamente às equipas operacionais da câmara municipal. Submeta ocorrências, acompanhe o progresso e contribua para um espaço público mais seguro e limpo.
                 </p>
                 <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link 
                      href="/login"
                      className="rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-105 active:scale-95 text-center"
                    >
                       Reportar Ocorrência Agora
                    </Link>
                    <a href="#app" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors flex items-center gap-1">
                       Descarregar App <span aria-hidden="true">→</span>
                    </a>
                 </div>
              </div>
           </div>
        </section>

        {/* ── Feature Grid ────────────────────────────────────────── */}
        <section id="como-funciona" className="py-24 sm:py-32 bg-secondary/5 border-y border-secondary/10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-secondary">Portal do Munícipe</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tudo o que precisa para fazer a diferença</p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
               <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  {[
                    { title: "Identifique o Problema", desc: "Encontrou um buraco, uma lâmpada fundida ou lixo amontoado? Tire uma foto e registe na hora.", icon: AlertTriangle, color: "text-warning bg-warning-light/50" },
                    { title: "Geolocalização Precisa", desc: "O sistema capta o local exato da ocorrência, garantindo que as equipas saibam onde intervir.", icon: MapPin, color: "text-secondary bg-secondary-light/30" },
                    { title: "Acompanhamento Real", desc: "Receba notificações automáticas quando a situação for resolvida pela equipa da câmara municipal.", icon: ShieldCheck, color: "text-success bg-success-light/50" },
                  ].map((feat) => (
                    <div key={feat.title} className="flex flex-col bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                       <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-card-foreground">
                         <div className={`mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-xl ${feat.color}`}>
                            <feat.icon size={20} aria-hidden="true" />
                         </div>
                         {feat.title}
                       </dt>
                       <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                         <p className="flex-auto">{feat.desc}</p>
                       </dd>
                       {/* Subtle hover decoration */}
                       <div className="absolute -bottom-1 -right-1 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-2xl group-hover:from-primary/10 transition-colors" />
                    </div>
                  ))}
               </dl>
            </div>
          </div>
        </section>

        {/* ── App Banner ────────────────────────────────────────── */}
        <section id="app" className="py-24 sm:py-32">
             <div className="mx-auto max-w-7xl px-6 lg:px-8">
                 <div className="relative isolate overflow-hidden bg-primary px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
                    <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0" aria-hidden="true">
                      <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.7" />
                      <defs>
                         <radialGradient id="gradient">
                            <stop stopColor="#ffffff" />
                            <stop offset="1" stopColor="#3b82f6" />
                         </radialGradient>
                      </defs>
                    </svg>
                    <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                       <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                         Resolva da palma da sua mão.
                       </h2>
                       <p className="mt-6 text-lg leading-8 text-primary-foreground/80 text-balance">
                         A app oficial do cidadão permite registar alertas em qualquer lugar, mesmo sem internet. 
                       </p>
                       <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                         <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-transform hover:-translate-y-1">
                           App Store
                         </button>
                         <button className="rounded-xl bg-primary-foreground/10 px-5 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/20 hover:bg-primary-foreground/20 transition-transform hover:-translate-y-1">
                           Google Play
                         </button>
                       </div>
                    </div>
                    <div className="relative mt-16 h-80 lg:mt-8 flex items-center justify-center mb-8 lg:mb-0">
                       <Smartphone size={200} className="text-white/20 drop-shadow-xl saturate-150 rotate-12" />
                    </div>
                 </div>
             </div>
        </section>

      </main>
      
      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8">
           <div className="flex items-center gap-2">
              <Shield size={16} className="text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-semibold text-card-foreground">CityGuards B2G</span>
           </div>
           <p className="text-center text-xs leading-5 text-muted-foreground">
             &copy; {new Date().getFullYear()} CityGuards. Sistema para Municípios Inovadores.
           </p>
        </div>
      </footer>
    </div>
  );
}
