import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { occurrenceId, estado } = data;

    if (!occurrenceId || !estado) {
      return NextResponse.json(
        { error: "Faltam campos obrigatórios (occurrenceId, estado)" },
        { status: 400 }
      );
    }

    if (estado !== "Em Resolução" && estado !== "Resolvida") {
      return NextResponse.json(
        { error: "estado deve ser 'Em Resolução' ou 'Resolvida'" },
        { status: 400 }
      );
    }

    // 1. Obter a ocorrência atual
    const occRef = db.collection("Ocorrencias").doc(occurrenceId);
    const occDoc = await occRef.get();

    if (!occDoc.exists) {
      return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
    }

    const occurrence = occDoc.data()!;
    const anteriorEstado = occurrence.estado;

    // Se já estiver resolvida, não faz sentido resolver novamente
    if (anteriorEstado === "Resolvida" && estado === "Resolvida") {
      return NextResponse.json({ message: "A ocorrência já se encontrava Resolvida." });
    }

    // 2. Atualizar o estado da ocorrência
    await occRef.update({
      estado: estado,
      resolvidaEm: estado === "Resolvida" ? new Date().toISOString() : null,
    });

    let pontosAtribuidos = 0;
    let feedbackGamificacao = "";

    // 3. Se passou a "Resolvida", calcular e creditar os pontos ao cidadão
    if (estado === "Resolvida" && occurrence.cidadaoId && occurrence.cidadaoId !== "anonimo") {
      // Calcular pontuação de gamificação baseada na complexidade
      let score = 10; // Pontuação base
      
      if (occurrence.fotografiaUrl) score += 20; // Bónus por foto em anexo
      if (occurrence.localizacao && occurrence.localizacao.latitude && occurrence.localizacao.longitude) {
        score += 20; // Bónus por coordenadas GPS
      }
      if (occurrence.categoria === "Vias Públicas" || occurrence.categoria === "Iluminação Pública") {
        score += 20; // Categorias críticas dão bónus
      }

      pontosAtribuidos = score;

      // Incrementar os pontos do cidadão
      const cidadaoRef = db.collection("Cidadaos").doc(occurrence.cidadaoId);
      const cidadaoDoc = await cidadaoRef.get();

      if (cidadaoDoc.exists) {
        const cidadaoData = cidadaoDoc.data()!;
        const pontosAtuais = cidadaoData.pontosGamificacao || 0;
        const novosPontos = pontosAtuais + score;

        await cidadaoRef.update({
          pontosGamificacao: novosPontos,
        });

        feedbackGamificacao = `Creditados ${score} pontos ao cidadão ${cidadaoData.nome} (Total: ${novosPontos}).`;
      } else {
        feedbackGamificacao = `Cidadão associado (${occurrence.cidadaoId}) não foi encontrado no sistema. Nenhum ponto atribuído.`;
      }
    }

    return NextResponse.json({
      message: `Ocorrência atualizada com sucesso para '${estado}'.`,
      occurrenceId,
      estado,
      pontosAtribuidos,
      feedbackGamificacao,
    });
  } catch (error: any) {
    console.error("Erro ao resolver ocorrência:", error);
    return NextResponse.json({ error: "Falha ao atualizar o estado da ocorrência" }, { status: 500 });
  }
}
