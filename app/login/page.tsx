"use client";

import React, { useState } from "react";
import { Shield, ArrowRight, Lock, User, AlertCircle, MapPin } from "lucide-react";

type AuthMode = "login" | "register";
type UserType = "Cidadao" | "Autarquia";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [userType, setUserType] = useState<UserType>("Cidadao");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [municipio, setMunicipio] = useState("Castelo Branco");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (authMode === "login") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Credenciais inválidas. Tente novamente.");
        }

        // Salvar no localStorage
        localStorage.setItem("cityguards_user", JSON.stringify(data));

        // Redirecionamento com base no tipo de utilizador
        if (data.tipoUtilizador === "Autarquia") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/cidadao";
        }
      } else {
        // Modo Registo
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            email,
            password,
            municipio,
            tipoUtilizador: userType,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro no registo. Tente novamente.");
        }

        // Efetuar login imediato após registo
        localStorage.setItem("cityguards_user", JSON.stringify(data));

        if (data.tipoUtilizador === "Autarquia") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/cidadao";
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocorreu um erro no processamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left Side: Form ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[480px] lg:px-20 xl:px-24 bg-card text-card-foreground">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fadeIn">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary-light shadow-lg">
              <Shield size={24} className="text-secondary-foreground" />
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-foreground">
              {authMode === "login" ? "Entrar na plataforma" : "Criar uma conta cívica"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {authMode === "login"
                ? "Submeta problemas públicos e ganhe pontos de cidadania."
                : "Registe-se em segundos para ajudar a melhorar o seu concelho."}
            </p>
          </div>

          {/* Selector de Cidadão / Autarquia */}
          <div className="mt-6 flex rounded-xl bg-muted p-1" role="tablist">
            <button
              type="button"
              onClick={() => {
                setUserType("Cidadao");
                setErrorMessage("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold text-center transition-all ${
                userType === "Cidadao"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Cidadão
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType("Autarquia");
                setErrorMessage("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold text-center transition-all ${
                userType === "Autarquia"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Autarquia
            </button>
          </div>

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-sm font-medium leading-6 text-card-foreground">
                    Nome Completo / Designação
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User size={16} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder={userType === "Autarquia" ? "Câmara Municipal de..." : "O seu nome"}
                      className="block w-full rounded-xl border-0 py-2 pl-10 bg-background text-foreground shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium leading-6 text-card-foreground">
                  Email {userType === "Autarquia" && "Institucional"}
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={userType === "Autarquia" ? "obras@cm-cidade.pt" : "nome@exemplo.com"}
                    className="block w-full rounded-xl border-0 py-2 pl-10 bg-background text-foreground shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              </div>

              {authMode === "register" && (
                <div>
                  <label className="block text-sm font-medium leading-6 text-card-foreground">
                    Município / Região
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPin size={16} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      required
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      placeholder="Coimbra, Castelo Branco, etc."
                      className="block w-full rounded-xl border-0 py-2 pl-10 bg-background text-foreground shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium leading-6 text-card-foreground">
                  Palavra-passe
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border-0 py-2 pl-10 bg-background text-foreground shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              </div>

              {/* Erros */}
              {errorMessage && (
                <div className="rounded-lg bg-destructive-light/30 border border-destructive/20 p-3 flex gap-3 text-xs text-destructive">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold leading-6 text-secondary-foreground shadow-sm hover:bg-secondary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      {authMode === "login" ? "Entrar na Conta" : "Registar & Iniciar"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setErrorMessage("");
                }}
                className="font-semibold text-secondary hover:text-secondary-light transition-colors"
              >
                {authMode === "login"
                  ? "Ainda não tem conta? Registe-se aqui."
                  : "Já tem conta? Inicie sessão aqui."}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center text-xs font-medium text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              &larr; Voltar ao Portal Público
            </a>
            <span>Suporte Nível 1</span>
          </div>
        </div>
      </div>

      {/* ── Right Side: Graphic ─────────────────────────────────── */}
      <div className="hidden lg:relative lg:flex lg:flex-1 lg:items-center lg:justify-center bg-sidebar overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute inset-x-0 bottom-0 top-0 h-full w-full bg-gradient-to-t from-sidebar-accent via-sidebar to-sidebar opacity-90"></div>

        <div className="relative z-10 text-center text-sidebar-foreground px-12">
          <Shield size={120} className="mx-auto text-secondary/20 mb-8 blur-[2px]" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            CityGuards. <br />
            <span className="text-secondary-light">Gamificação Cívica.</span>
          </h1>
          <p className="text-lg text-sidebar-muted-foreground/80 max-w-lg mx-auto">
            Ganha recompensas ao ajudar o teu município a resolver buracos, falhas de iluminação ou acumulação de lixo!
          </p>
        </div>
      </div>
    </div>
  );
}
