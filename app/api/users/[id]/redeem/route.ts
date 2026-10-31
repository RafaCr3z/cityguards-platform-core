import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

class RedeemError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

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

    // Um custo negativo ou não numérico somaria pontos em vez de os descontar
    if (!Number.isInteger(custoPontos) || custoPontos <= 0) {
      return NextResponse.json(
        { error: "custoPontos deve ser um número inteiro positivo." },
        { status: 400 }
      );
    }

    const userRef = db.collection("Cidadaos").doc(id);

    // Transação: evita que dois resgates simultâneos gastem o mesmo saldo
    const novosPontos = await db.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) {
        throw new RedeemError("Utilizador não encontrado", 404);
      }

      const pontosAtuais = userDoc.data()!.pontosGamificacao || 0;

      if (pontosAtuais < custoPontos) {
        throw new RedeemError(
          `Pontos insuficientes. Tem ${pontosAtuais} pontos, mas a recompensa custa ${custoPontos}.`,
          400
        );
      }

      const saldo = pontosAtuais - custoPontos;

      tx.update(userRef, { pontosGamificacao: saldo });

      // Registar a transação na coleção "TrocasRecompensas" para auditabilidade
      tx.create(db.collection("TrocasRecompensas").doc(), {
        cidadaoId: id,
        recompensaNome,
        custoPontos,
        dataTroca: new Date().toISOString(),
      });

      return saldo;
    });

    return NextResponse.json({
      message: `Troca efetuada com sucesso! Resgatou '${recompensaNome}'.`,
      novosPontos,
    });
  } catch (error: any) {
    if (error instanceof RedeemError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Erro ao resgatar recompensa:", error);
    return NextResponse.json({ error: "Falha ao processar o resgate" }, { status: 500 });
  }
}
