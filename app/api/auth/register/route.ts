import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nome, email, password, municipio, tipoUtilizador } = data;

    // Validação de campos obrigatórios
    if (!nome || !email || !password || !municipio || !tipoUtilizador) {
      return NextResponse.json(
        { error: "Faltam campos obrigatórios (nome, email, password, municipio, tipoUtilizador)" },
        { status: 400 }
      );
    }

    if (tipoUtilizador !== "Cidadao" && tipoUtilizador !== "Autarquia") {
      return NextResponse.json(
        { error: "tipoUtilizador deve ser 'Cidadao' ou 'Autarquia'" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const userSnapshot = await db
      .collection("Cidadaos")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      return NextResponse.json(
        { error: "Este email já está registado na plataforma." },
        { status: 409 }
      );
    }

    // Encriptar a palavra-passe usando SHA-256 nativo
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const novoUtilizador = {
      nome,
      email,
      passwordHash,
      municipio,
      tipoUtilizador,
      pontosGamificacao: tipoUtilizador === "Cidadao" ? 0 : null,
      dataRegisto: new Date().toISOString(),
    };

    const docRef = await db.collection("Cidadaos").add(novoUtilizador);

    return NextResponse.json(
      {
        id: docRef.id,
        nome: novoUtilizador.nome,
        email: novoUtilizador.email,
        municipio: novoUtilizador.municipio,
        tipoUtilizador: novoUtilizador.tipoUtilizador,
        pontosGamificacao: novoUtilizador.pontosGamificacao,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro no registo de utilizador:", error);
    return NextResponse.json(
      { error: "Falha ao registar o utilizador no Firestore" },
      { status: 500 }
    );
  }
}
