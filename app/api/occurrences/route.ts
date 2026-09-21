import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const municipio = searchParams.get("municipio");
    const cidadaoId = searchParams.get("cidadaoId");

    let query: any = db.collection("Ocorrencias");

    // Filtrar por município, se fornecido
    if (municipio) {
      query = query.where("municipio", "==", municipio);
    }

    // Filtrar por cidadão, se fornecido
    if (cidadaoId) {
      query = query.where("cidadaoId", "==", cidadaoId);
    }

    // Obter as ocorrências
    const snapshot = await query.get();
    
    let items = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Ordenar manualmente por dataReporte decrescente (já que o Firestore necessita de índices compostos
    // para orderby com cláusulas where de campos diferentes)
    items.sort((a: any, b: any) => {
      const dateA = new Date(a.dataReporte || 0).getTime();
      const dateB = new Date(b.dataReporte || 0).getTime();
      return dateB - dateA;
    });
    
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Erro ao obter ocorrências:", error);
    return NextResponse.json({ error: "Falha ao obter as ocorrências" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { cidadaoId, descricao, municipio, localizacao, fotografiaUrl } = data;
    
    // Validação mínima dos campos requeridos
    if (!descricao || !municipio || !localizacao || !localizacao.latitude || !localizacao.longitude) {
      return NextResponse.json({ error: "Faltam campos obrigatórios (descricao, municipio, localizacao)" }, { status: 400 });
    }

    // Simulação da Inteligência Operacional (Azure AI Vision local / Regra de Negócio)
    // Se não for fornecida categoria, sugerimos automaticamente com base em palavras-chave do texto
    let categoriaSugerida = "Outros";
    const textoAnalise = (descricao + " " + (data.titulo || "")).toLowerCase();
    
    if (textoAnalise.includes("buraco") || textoAnalise.includes("estrada") || textoAnalise.includes("asfalto") || textoAnalise.includes("passeio") || textoAnalise.includes("via")) {
      categoriaSugerida = "Vias Públicas";
    } else if (textoAnalise.includes("lixo") || textoAnalise.includes("entulho") || textoAnalise.includes("acumulação") || textoAnalise.includes("sujo") || textoAnalise.includes("higiene")) {
      categoriaSugerida = "Higiene Urbana";
    } else if (textoAnalise.includes("iluminação") || textoAnalise.includes("luz") || textoAnalise.includes("lâmpada") || textoAnalise.includes("poste") || textoAnalise.includes("fundida")) {
      categoriaSugerida = "Iluminação Pública";
    } else if (textoAnalise.includes("jardim") || textoAnalise.includes("árvore") || textoAnalise.includes("parque") || textoAnalise.includes("banco")) {
      categoriaSugerida = "Espaços Verdes";
    }

    // Criar o objeto conforme o esquema em português do relatório
    const novaOcorrencia = {
      cidadaoId: cidadaoId || "anonimo",
      titulo: data.titulo || `Ocorrência - ${categoriaSugerida}`,
      descricao,
      municipio,
      categoria: data.categoria || categoriaSugerida,
      estado: "Pendente",
      localizacao: {
        latitude: Number(localizacao.latitude),
        longitude: Number(localizacao.longitude)
      },
      fotografiaUrl: fotografiaUrl || "",
      dataReporte: new Date().toISOString(),
      sugeridoPorIA: !data.categoria, // Flag indicando se a categoria foi definida pela IA simulada
    };

    const docRef = await db.collection("Ocorrencias").add(novaOcorrencia);
    
    return NextResponse.json({ id: docRef.id, ...novaOcorrencia }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar ocorrência:", error);
    return NextResponse.json({ error: "Falha ao registar a ocorrência" }, { status: 500 });
  }
}
