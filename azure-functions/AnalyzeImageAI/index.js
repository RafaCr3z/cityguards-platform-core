const axios = require("axios");
const admin = require("firebase-admin");

// Inicializar o Firebase Admin SDK fora do handler para reutilização da ligação
if (admin.apps.length === 0) {
  // Numa função real, as credenciais estariam nas variáveis de ambiente em formato JSON
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      });
    } else {
      // Fallback para desenvolvimento local / default credential
      admin.initializeApp();
    }
  } catch (err) {
    console.error("Firebase admin init error inside function:", err);
  }
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

module.exports = async function (context, myBlob) {
  const blobName = context.bindingData.name;
  context.log(`Análise inteligente por IA ativada para o blob: ${blobName}`);

  // Extrair o ID da ocorrência (ex: "OC-4821.jpg" -> "OC-4821")
  const occurrenceId = blobName.split(".")[0];

  const visionEndpoint = process.env.AI_VISION_ENDPOINT;
  const visionKey = process.env.AI_VISION_KEY;

  if (!visionEndpoint || !visionKey) {
    context.log.warn("Serviço Azure AI Vision não configurado (AI_VISION_ENDPOINT/AI_VISION_KEY em falta).");
    return;
  }

  try {
    // 1. Chamar a API Azure AI Vision para analisar a imagem
    // Pedimos features de Tags (para categorizar) e Adult (para filtrar conteúdo impróprio)
    const visionUrl = `${visionEndpoint}/vision/v3.2/analyze?visualFeatures=Tags,Adult`;
    
    context.log("A enviar imagem para processamento no Azure AI Vision...");
    const response = await axios.post(visionUrl, myBlob, {
      headers: {
        "Ocp-Apim-Subscription-Key": visionKey,
        "Content-Type": "application/octet-stream",
      },
    });

    const analysis = response.data;
    context.log("Análise de imagem concluída. Dados obtidos:", JSON.stringify(analysis));

    const tags = analysis.tags || [];
    const adultInfo = analysis.adult || {};

    // 2. Determinar se a imagem é imprópria (Filtro de Moderação de Conteúdo)
    const isImproper = adultInfo.isAdultContent || adultInfo.isRacyContent || (adultInfo.adultScore > 0.85);

    // 3. Sugerir categoria inteligente baseada nas tags do Azure AI Vision
    let categoriaSugerida = "Outros";
    const tagNames = tags.map(t => t.name.toLowerCase());

    context.log("Tags detetadas pela IA:", tagNames.join(", "));

    if (tagNames.some(t => ["road", "street", "asphalt", "pavement", "crack", "pothole"].includes(t))) {
      categoriaSugerida = "Vias Públicas";
    } else if (tagNames.some(t => ["garbage", "trash", "waste", "litter", "rubbish", "plastic"].includes(t))) {
      categoriaSugerida = "Higiene Urbana";
    } else if (tagNames.some(t => ["light", "lighting", "lantern", "lamp", "pole", "street light"].includes(t))) {
      categoriaSugerida = "Iluminação Pública";
    } else if (tagNames.some(t => ["tree", "grass", "plant", "park", "garden", "bench"].includes(t))) {
      categoriaSugerida = "Espaços Verdes";
    }

    // 4. Gravar os resultados no Firestore
    if (db) {
      const docRef = db.collection("Ocorrencias").doc(occurrenceId);
      const doc = await docRef.get();

      if (doc.exists) {
        context.log(`A atualizar a ocorrência ${occurrenceId} no Firestore...`);
        
        await docRef.update({
          categoriaIA: categoriaSugerida,
          imagemModerada: true,
          imagemImpropria: isImproper,
          tagsIA: tagNames,
          // Se o cidadão não escolheu nenhuma categoria, aplicamos a que a IA sugeriu automaticamente
          categoria: doc.data().categoria === "Outros" || !doc.data().categoria ? categoriaSugerida : doc.data().categoria
        });

        context.log(`Ocorrência ${occurrenceId} atualizada com sucesso no Firestore.`);
      } else {
        context.log.warn(`Ocorrência ${occurrenceId} correspondente ao blob não foi encontrada no Firestore.`);
      }
    } else {
      context.log.warn("Firestore Database não instanciado. Não foi possível persistir a análise.");
    }

  } catch (error) {
    context.log.error(`Erro ao analisar a imagem do blob ${blobName}:`, error.message || error);
  }
};
