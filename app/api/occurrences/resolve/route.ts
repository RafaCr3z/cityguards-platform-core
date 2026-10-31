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

    const occRef = db.collection("Ocorrencias").doc(occurrenceId);

    // Transação: ler o estado e creditar pontos de forma atómica, para que dois pedidos
    // simultâneos não creditem a mesma ocorrência duas vezes
    const result = await db.runTransaction(async (tx) => {
      // 1. Obter a ocorrência atual
      const occDoc = await tx.get(occRef);

      if (!occDoc.exists) {
        return { status: 404 as const, body: { error: "Ocorrência não encontrada." } };
      }

      const occurrence = occDoc.data()!;
      const anteriorEstado = occurrence.estado;

      // Uma ocorrência resolvida é final: reabri-la permitiria resolvê-la outra vez e duplicar os pontos
      if (anteriorEstado === "Resolvida") {
        return {
          status: estado === "Resolvida" ? (200 as const) : (409 as const),
          body:
            estado === "Resolvida"
              ? { message: "A ocorrência já se encontrava Resolvida." }
              : { error: "Não é possível reabrir uma ocorrência já Resolvida." },
        };
      }

      let pontosAtribuidos = 0;
      let feedbackGamificacao = "";

      // 2. Se passou a "Resolvida", calcular os pontos do cidadão
      // (leituras têm de vir antes de qualquer escrita numa transação Firestore)
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

        const cidadaoRef = db.collection("Cidadaos").doc(occurrence.cidadaoId);
        const cidadaoDoc = await tx.get(cidadaoRef);

        if (cidadaoDoc.exists) {
          const cidadaoData = cidadaoDoc.data()!;
          const novosPontos = (cidadaoData.pontosGamificacao || 0) + score;

          tx.update(cidadaoRef, { pontosGamificacao: novosPontos });

          pontosAtribuidos = score;
          feedbackGamificacao = `Creditados ${score} pontos ao cidadão ${cidadaoData.nome} (Total: ${novosPontos}).`;
        } else {
          feedbackGamificacao = `Cidadão associado (${occurrence.cidadaoId}) não foi encontrado no sistema. Nenhum ponto atribuído.`;
        }
      }

      // 3. Atualizar o estado da ocorrência
      tx.update(occRef, {
        estado: estado,
        resolvidaEm: estado === "Resolvida" ? new Date().toISOString() : null,
      });

      return {
        status: 200 as const,
        body: {
          message: `Ocorrência atualizada com sucesso para '${estado}'.`,
          occurrenceId,
          estado,
          pontosAtribuidos,
          feedbackGamificacao,
        },
      };
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error: any) {
    console.error("Erro ao resolver ocorrência:", error);
    return NextResponse.json({ error: "Falha ao atualizar o estado da ocorrência" }, { status: 500 });
  }
}
