// Constante com a URL do seu App (atualize após o primeiro deploy)
const APP_URL = ScriptApp.getService().getUrl();

function doGet(e) {
  // Roteamento simples: se o parâmetro 'page' for 'app', carrega o dashboard, senão, o login.
  if (e.parameter.page === 'app') {
    return HtmlService.createTemplateFromFile('Leiseca').evaluate()
      .setTitle('Dashboard | Lei Seca')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  return HtmlService.createTemplateFromFile('Login').evaluate()
    .setTitle('Login | Lei Seca')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Função auxiliar para incluir CSS e JS nos arquivos HTML
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

// --- LÓGICA DE NEGÓCIO ---

function autenticarUsuario(email, senha) {
  // Mock de autenticação para fins de demonstração
  if (email === "estudante@leiseca.com" && senha === "aprovado123") {
    return { success: true, token: "mock_token_123" };
  }
  return { success: false, message: "Credenciais inválidas. Use estudante@leiseca.com / aprovado123" };
}

function getArtigos() {
  // Banco de dados em memória (Mock) baseado na hierarquia solicitada
  return [
    {
      id: 1,
      materia: "Direito Penal",
      topico: "Crimes contra o patrimônio",
      artigo: "Art. 155",
      titulo: "Furto",
      texto: "Subtrair, para si ou para outrem, coisa alheia móvel:",
      pena: "Reclusão, de um a quatro anos, e multa.",
      explicacao: "O crime de furto exige a subtração do bem sem o uso de violência ou grave ameaça à pessoa. O termo 'coisa alheia móvel' abrange inclusive energia elétrica (Art. 155, § 3º).",
      status: "revisar" // 'lido', 'revisar', 'novo'
    },
    {
      id: 2,
      materia: "Direito Penal",
      topico: "Crimes contra o patrimônio",
      artigo: "Art. 157",
      titulo: "Roubo",
      texto: "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa, ou depois de havê-la, por qualquer meio, reduzido à impossibilidade de resistência:",
      pena: "Reclusão, de quatro a dez anos, e multa.",
      explicacao: "Diferente do furto, o roubo é classificado como crime complexo, pois atinge dois bens jurídicos: o patrimônio e a integridade física/liberdade da vítima.",
      status: "novo"
    }
  ];
}
