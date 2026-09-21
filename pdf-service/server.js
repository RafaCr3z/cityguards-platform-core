const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Rota de Health Check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "pdf-generator" });
});

// Rota para Geração de Relatório PDF
app.post("/generate-report", (req, res) => {
  const { municipio, ocorrencias } = req.body;

  if (!municipio || !ocorrencias) {
    return res.status(400).json({ error: "Faltam dados necessários (municipio, ocorrencias)" });
  }

  try {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Configurar cabeçalhos HTTP para descarregar o PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=relatorio-${municipio.toLowerCase()}.pdf`);

    // Ligar o stream do PDFKit diretamente à resposta Express
    doc.pipe(res);

    // ── Cabeçalho (Header) ──
    doc.rect(0, 0, 595.28, 120) // Retângulo superior colorido (azul escuro premium)
       .fill("#1e293b");

    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("CityGuards", 50, 40);

    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("#94a3b8")
       .text("Plataforma de Gestão e Triagem de Ocorrências Urbanas", 50, 68);

    doc.fontSize(12)
       .fillColor("#f1f5f9")
       .font("Helvetica-Bold")
       .text(`Município: ${municipio}`, 400, 50, { align: "right", width: 145 });

    // Data de extração
    const dataExtracao = new Date().toLocaleString("pt-PT");
    doc.fontSize(8)
       .fillColor("#cbd5e1")
       .font("Helvetica")
       .text(`Gerado em: ${dataExtracao}`, 400, 70, { align: "right", width: 145 });

    // Espaço abaixo do header
    doc.y = 150;

    // ── Título da Secção ──
    doc.fillColor("#0f172a")
       .fontSize(16)
       .font("Helvetica-Bold")
       .text("Relatório Geral de Ocorrências", 50, 150);

    doc.rect(50, 170, 495, 2)
       .fill("#cbd5e1");

    // Estatísticas Rápidas
    const totais = ocorrencias.length;
    const pendentes = ocorrencias.filter(o => o.status === "Pendente").length;
    const emResolucao = ocorrencias.filter(o => o.status === "Em Resolução").length;
    const resolvidas = ocorrencias.filter(o => o.status === "Resolvida").length;

    doc.y = 190;
    doc.fontSize(10)
       .fillColor("#334155")
       .font("Helvetica-Bold")
       .text(`Total de Registos: ${totais}   |   Pendentes: ${pendentes}   |   Em Resolução: ${emResolucao}   |   Resolvidas: ${resolvidas}`, 50, 190);

    // ── Tabela de Ocorrências ──
    const tableTop = 220;
    const itemHeight = 35;
    
    // Cabeçalhos da Tabela
    doc.rect(50, tableTop, 495, 22).fill("#334155");
    
    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(9);
    
    doc.text("ID", 55, tableTop + 6, { width: 80 });
    doc.text("Ocorrência", 140, tableTop + 6, { width: 150 });
    doc.text("Categoria", 300, tableTop + 6, { width: 90 });
    doc.text("Urgência", 400, tableTop + 6, { width: 60 });
    doc.text("Estado", 470, tableTop + 6, { width: 70 });

    let currentY = tableTop + 22;

    // Linhas da Tabela
    ocorrencias.forEach((occ, index) => {
      // Evitar transbordamento da página
      if (currentY > 730) {
        doc.addPage();
        currentY = 50; // Começar mais acima na nova página
      }

      // Fundo alternado
      if (index % 2 === 1) {
        doc.rect(50, currentY, 495, itemHeight).fill("#f8fafc");
      }

      doc.fillColor("#334155")
         .font("Helvetica");

      // ID curto
      const idCurto = occ.id ? (occ.id.substring(0, 8) + "...") : "N/A";
      doc.text(idCurto, 55, currentY + 12, { width: 80 });
      
      // Título
      doc.font("Helvetica-Bold").text(occ.title || "Sem título", 140, currentY + 12, { width: 150, height: 20, ellipsis: true });
      
      // Categoria
      doc.font("Helvetica").text(occ.category || "Outros", 300, currentY + 12, { width: 90 });
      
      // Urgência
      doc.text(occ.urgency || "baixa", 400, currentY + 12, { width: 60 });
      
      // Estado (com cor dependendo)
      let statusColor = "#eab308"; // amarelo
      if (occ.status === "Resolvida") statusColor = "#22c55e"; // verde
      if (occ.status === "Em Resolução") statusColor = "#3b82f6"; // azul

      doc.fillColor(statusColor)
         .font("Helvetica-Bold")
         .text(occ.status || "Pendente", 470, currentY + 12, { width: 70 });

      currentY += itemHeight;
    });

    // ── Rodapé (Footer) ──
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.rect(50, 790, 495, 1).fill("#e2e8f0");
      doc.fontSize(8)
         .fillColor("#64748b")
         .text(`CityGuards Software de Gestão Cívica Independente - Página ${i + 1} de ${pageCount}`, 50, 800, { align: "center", width: 495 });
    }

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).json({ error: "Falha interna ao desenhar o ficheiro PDF." });
  }
});

app.listen(PORT, () => {
  console.log(`Microsserviço de PDF a correr na porta ${PORT}`);
});
