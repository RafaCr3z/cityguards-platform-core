module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request to calculate score.');

    const occurrence = req.body;

    if (!occurrence || !occurrence.id) {
        context.res = {
            status: 400,
            body: "Please pass an occurrence object in the request body"
        };
        return;
    }

    // Lógica para calcular a pontuação da participação cívica
    let score = 10; // Pontuação base por submeter a ocorrência

    // Bonificação de acordo com a qualidade da participação
    if (occurrence.hasPhoto) score += 20; // Bónus por foto em anexo
    if (occurrence.hasExactCoordinates) score += 20; // Bónus por GPS exato
    if (occurrence.category === "Infraestruturas Críticas") score += 50; // Prioridade alta

    // Em produção, esta função faria update ao CosmosDB com a pontuação do utilizador
    // Para agora, apenas retorna o cálculo.

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
            occurrenceId: occurrence.id,
            citizenId: occurrence.citizenId,
            pointsAwarded: score,
            message: `O cidadão recebeu ${score} pontos pela sua contribuição!`
        }
    };
}
