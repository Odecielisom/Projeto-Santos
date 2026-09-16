/**
 * Função principal que inicializa o Web App.
 * Retorna o arquivo principal (Leiseca.html) que irá incorporar os demais.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Leiseca');
  return template.evaluate()
    .setTitle('Estudos Lei Seca - Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Função utilitária para incluir arquivos HTML/CSS/JS dentro de outros arquivos HTML.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Simula a autenticação de usuário.
 */
function authenticateUser(email, password) {
  // Em um ambiente real, você validaria com dados de uma planilha ou banco.
  if (email === "aluno@leiseca.com" && password === "123456") {
    return { success: true, name: "Estudante", token: Utilities.getUuid() };
  }
  return { success: false, message: "E-mail ou senha incorretos." };
}

/**
 * Retorna os dados estruturados da Lei Seca.
 */
function getStudyData() {
  return [
    {
      id: "dp",
      subject: "Direito Penal",
      topics: [
        {
          id: "t1",
          title: "Crimes contra o patrimônio",
          articles: [
            {
              id: "art155",
              number: "Art. 155",
              title: "Furto",
              text: "Subtrair, para si ou para outrem, coisa alheia móvel:",
              penalty: "Pena - reclusão, de um a quatro anos, e multa.",
              explanation: "O núcleo do tipo penal é 'subtrair' (tirar, apoderar-se). Exige o ânimo de assenhoramento definitivo (animus rem sibi habendi). Não há violência ou grave ameaça (diferença para o roubo).",
              status: "pending"
            },
            {
              id: "art157",
              number: "Art. 157",
              title: "Roubo",
              text: "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa, ou depois de havê-la, por qualquer meio, reduzido à impossibilidade de resistência:",
              penalty: "Pena - reclusão, de quatro a dez anos, e multa.",
              explanation: "O crime de roubo é complexo, tutelando o patrimônio e a integridade física/liberdade da vítima. A violência pode ser física (vis corporalis) ou moral (grave ameaça).",
              status: "pending"
            }
          ]
        },
        {
          id: "t2",
          title: "Crimes contra a pessoa",
          articles: [
            {
              id: "art121",
              number: "Art. 121",
              title: "Homicídio simples",
              text: "Matar alguem:",
              penalty: "Pena - reclusão, de seis a vinte anos.",
              explanation: "Proteção ao bem jurídico mais importante: a vida extrauterina. É um crime material que exige resultado naturalístico (morte).",
              status: "reviewed"
            }
          ]
        }
      ]
    }
  ];
}
