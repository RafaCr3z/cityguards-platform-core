import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID de utilizador obrigatório" }, { status: 400 });
    }

    const userDoc = await db.collection("Cidadaos").doc(id).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const data = userDoc.data()!;

    return NextResponse.json({
      id: userDoc.id,
      nome: data.nome,
      email: data.email,
      municipio: data.municipio,
      tipoUtilizador: data.tipoUtilizador,
      pontosGamificacao: data.pontosGamificacao,
      dataRegisto: data.dataRegisto
    });
  } catch (error: any) {
    console.error("Erro ao obter dados do utilizador:", error);
    return NextResponse.json({ error: "Falha ao obter perfil" }, { status: 500 });
  }
}
