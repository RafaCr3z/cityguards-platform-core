"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  ArrowLeft, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Info
} from "lucide-react";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  municipio: string;
  tipoUtilizador: string;
}

export default function ReportOccurrence() {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Estados do Formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [categoria, setCategoria] = useState(""); // Deixar em branco para IA sugerir
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  
  // Imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fotografiaUrl, setFotografiaUrl] = useState("");

  // Controladores de Estado
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

    setUser(userData);
    setMunicipio(userData.municipio); // Município padrão do utilizador
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFotografiaUrl(""); // Reset se já houvesse uma URL carregada
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("A geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setIsLocating(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setIsLocating(false);
      },
      (error) => {
        console.error("Erro ao obter geolocalização:", error);
        setErrorMsg("Não foi possível obter a sua localização. Por favor, introduza manualmente.");
        setIsLocating(false);
        // Simular coordenadas aproximadas (ex: centro de Portugal) se falhar, para facilitar demonstrações
        setLatitude("40.2033");
        setLongitude("-8.4103");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const uploadPhoto = async (): Promise<string> => {
    if (!imageFile) return "";

    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Falha ao fazer upload da imagem.");
    }

    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!titulo || !descricao || !municipio || !latitude || !longitude) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios (marcardos com *).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Upload de Imagem se houver
      let uploadedUrl = fotografiaUrl;
      if (imageFile) {
        uploadedUrl = await uploadPhoto();
        setFotografiaUrl(uploadedUrl);
      }

      // 2. Submeter Ocorrência
      const occurrenceData = {
        cidadaoId: user.id,
        titulo,
        descricao,
        municipio,
        categoria: categoria || undefined, // Se vazia, a IA simulada no backend irá sugerir
        localizacao: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        fotografiaUrl: uploadedUrl,
      };

      const response = await fetch("/api/occurrences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(occurrenceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao submeter a ocorrência.");
      }

      setSuccessMsg("Ocorrência submetida com sucesso! A redirecionar para o painel...");
      
      // Redirecionar após 2s
      setTimeout(() => {
        window.location.href = "/cidadao";
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao guardar a ocorrência. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-accent shadow-sm">
              <Shield size={18} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">CityGuards</span>
          </div>

          <Link
            href="/cidadao"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar ao Painel
          </Link>
        </div>
      </nav>

      {/* ── Main Form ─────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-6 mt-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Reportar Ocorrência
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Descreva o problema que encontrou na via pública para que as equipas municipais possam atuar rapidamente.
          </p>
        </div>

        {/* Notificações de Feedback */}
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

        {/* Card do Formulário */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Título */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-card-foreground">
                Título do Alerta *
              </label>
              <input
                id="title"
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Buraco profundo no asfalto, Poste de luz apagado"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-card-foreground">
                Descrição Detalhada *
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Indique detalhes sobre a ocorrência para apoiar na triagem e resolução (ex: em frente ao número 24, perigo de queda)..."
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              />
            </div>

            {/* Categoria & Município Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Município */}
              <div className="space-y-2">
                <label htmlFor="municipality" className="text-sm font-semibold text-card-foreground">
                  Município Responsável *
                </label>
                <input
                  id="municipality"
                  type="text"
                  required
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  placeholder="Ex: Coimbra, Castelo Branco"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-semibold text-card-foreground">
                  Categoria
                </label>
                <select
                  id="category"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                >
                  <option value="">Auto-categorizar por IA (Recomendado)</option>
                  <option value="Vias Públicas">Vias Públicas</option>
                  <option value="Higiene Urbana">Higiene Urbana</option>
                  <option value="Iluminação Pública">Iluminação Pública</option>
                  <option value="Espaços Verdes">Espaços Verdes</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            {/* Informação sobre IA */}
            {!categoria && (
              <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-3 flex gap-2.5 text-xs text-muted-foreground">
                <Info size={16} className="text-secondary shrink-0 mt-0.5" />
                <span>
                  <strong>Classificação Inteligente:</strong> Ao deixar este campo vazio, a plataforma utilizará inteligência operacional para classificar automaticamente o tipo de problema com base na sua descrição.
                </span>
              </div>
            )}

            {/* Imagem */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-card-foreground block">
                Prova Fotográfica
              </span>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {imagePreview ? (
                  <div className="relative h-28 w-28 rounded-2xl overflow-hidden border border-border group shrink-0">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <label className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-input bg-background hover:bg-muted/30 cursor-pointer transition-colors group shrink-0">
                    <Camera size={24} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-[10px] text-muted-foreground mt-1.5 font-semibold">Anexar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="text-xs text-muted-foreground text-center sm:text-left">
                  <p className="font-semibold">Fotografe o local do incidente.</p>
                  <p className="mt-1">Uma prova fotográfica nítida permite acelerar a intervenção e concede um **bónus de 20 pontos** de cidadania.</p>
                </div>
              </div>
            </div>

            {/* Localização GPS */}
            <div className="space-y-2">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <label className="text-sm font-semibold text-card-foreground">
                  Coordenadas Geográficas (GPS) *
                </label>
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-secondary-light font-bold focus-visible:outline-none transition-colors"
                >
                  {isLocating ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      A detetar...
                    </>
                  ) : (
                    <>
                      <MapPin size={12} />
                      Capturar Localização Atual
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Latitude (ex: 40.2033)"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Longitude (ex: -8.4103)"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                A precisão GPS permite à equipa de manutenção localizar o problema. A introdução de coordenadas concede um **bónus de 20 pontos** de cidadania.
              </p>
            </div>

            {/* Submissão */}
            <div className="pt-4 flex gap-3">
              <Link
                href="/cidadao"
                className="flex-1 text-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-lg hover:bg-secondary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Enviar Ocorrência"
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
