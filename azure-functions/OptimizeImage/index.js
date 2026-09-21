const Jimp = require("jimp");

module.exports = async function (context, myBlob) {
  context.log(
    `Azure Function (OptimizeImage) processou o blob \n Nome: ${context.bindingData.name} \n Tamanho: ${myBlob.length} Bytes`
  );

  try {
    // 1. Ler o buffer do Blob original usando Jimp
    const image = await Jimp.read(myBlob);

    // 2. Otimizar a imagem: Redimensionar para 300px de largura e comprimir qualidade
    const optimizedBuffer = await image
      .resize(300, Jimp.AUTO) // Thumbnail com largura de 300px mantendo proporção
      .quality(75)            // Qualidade JPEG 75%
      .getBufferAsync(Jimp.MIME_JPEG);

    // 3. Atribuir o buffer comprimido à ligação de saída (outputBlob)
    context.bindings.outputBlob = optimizedBuffer;

    context.log(`Miniatura (thumbnail) criada com sucesso para ${context.bindingData.name}.`);
  } catch (error) {
    context.log.error(`Erro ao otimizar imagem ${context.bindingData.name}:`, error);
    // Não rebentamos a função para evitar execuções infinitas de retentativas automáticas no Azure
  }
};
