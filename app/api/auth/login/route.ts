import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios." },
        { status: 400 }
      );
    }

    // Procurar utilizador por email
    const userSnapshot = await db
      .collection("Cidadaos")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "Credenciais inválidas (utilizador não encontrado)." },
        { status: 401 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Validar password hash
    const inputHash = crypto.createHash("sha256").update(password).digest("hex");

    if (userData.passwordHash !== inputHash) {
      return NextResponse.json(
        { error: "Credenciais inválidas (palavra-passe incorreta)." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: userDoc.id,
      nome: userData.nome,
      email: userData.email,
      municipio: userData.municipio,
      tipoUtilizador: userData.tipoUtilizador,
      pontosGamificacao: userData.pontosGamificacao,
    });
  } catch (error: any) {
    console.error("Erro no login do utilizador:", error);
    return NextResponse.json(
      { error: "Falha ao processar o login no Firestore" },
      { status: 500 }
    );
  }
}
