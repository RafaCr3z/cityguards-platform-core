"use client";

import React, { Component } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "@/app/types";

/**
 * ErrorBoundary genérico para secções críticas do dashboard.
 *
 * Quando um componente filho lança um erro de rendering, esta boundary
 * captura-o e apresenta uma mensagem de fallback elegante em vez de
 * rebentar toda a aplicação.
 *
 * Uso:
 *   <ErrorBoundary fallbackMessage="Não foi possível carregar o mapa.">
 *     <CityMap />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Em produção, isto seria enviado para um serviço de telemetria (ex: Sentry)
    console.error("[CityGuards ErrorBoundary]", error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      const message =
        this.props.fallbackMessage ??
        "Ocorreu um erro inesperado. Por favor, tente novamente.";

      return (
        <div
          role="alert"
          className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive-light">
            <AlertCircle
              size={24}
              className="text-destructive"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-card-foreground">
              {message}
            </p>
            {this.state.error && (
              <p className="mt-1 text-xs text-muted-foreground">
                Detalhes: {this.state.error.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Tentar novamente"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
