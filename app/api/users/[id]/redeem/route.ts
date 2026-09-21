import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { recompensaNome, custoPontos } = await request.json();

    if (!id || !recompensaNome || custoPontos === undefined) {
      return NextResponse.json(
        { error: "Faltam dados necessários (recompensaNome, custoPontos)" },
        { status: 400 }
      );
    }

    const userRef = db.collection("Cidadaos").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const pontosAtuais = userData.pontosGamificacao || 0;

    if (pontosAtuais < custoPontos) {
      return NextResponse.json(
        { error: `Pontos insuficientes. Tem ${pontosAtuais} pontos, mas a recompensa custa ${custoPontos}.` },
        { status: 400 }
      );
    }

    const novosPontos = pontosAtuais - custoPontos;

    // Atualizar no Firestore
    await userRef.update({
      pontosGamificacao: novosPontos,
    });

    // Registar a transação na coleção "TrocasRecompensas" para auditabilidade
    await db.collection("TrocasRecompensas").add({
      cidadaoId: id,
      recompensaNome,
      custoPontos,
      dataTroca: new Date().toISOString(),
    });

    return NextResponse.json({
      message: `Troca efetuada com sucesso! Resgatou '${recompensaNome}'.`,
      novosPontos,
    });
  } catch (error: any) {
    console.error("Erro ao resgatar recompensa:", error);
    return NextResponse.json({ error: "Falha ao processar o resgate" }, { status: 500 });
  }
}
