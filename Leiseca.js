"use strict";

const SUPABASE_URL =
  "https://gmhkrdtbsxniazoiqczx.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_PPzbVeZRWekWKpmoth7tGw_ZC_w99F1";

const supabaseCliente = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

const estado = {
  usuario: null,
  materias: [],
  assuntos: [],
  topicos: [],
  artigos: [],
  artigosFiltrados: [],
  historico: [],
  sessoes: [],
  artigoAtual: 0,
  artigoSendoEditado: null,
  materiaSendoEditada: null,
  assuntoSendoEditado: null,
  topicoSendoEditado: null,
  telaAtual: "lei-seca",
  cronometroAtivo: false,
  inicioSessao: null,
  sessaoAtualId: null,
  segundosSessao: 0,
  intervaloCronometro: null,
  intervaloPersistencia: null
};

const elementos = {};

const idsElementos = [
  "menuPrincipal",
  "areaAplicacao",
  "fundoMenu",
  "botaoAbrirMenu",
  "botaoRecolherMenu",
  "menuLeiSeca",
  "menuRevisoes",
  "menuInsights",
  "quantidadeRevisoesMenu",
  "tituloPagina",
  "telaLeiSeca",
  "telaRevisoes",
  "telaInsights",
  "botaoGerenciar",
  "botaoCriarPrimeiro",
  "janelaGerenciar",
  "botaoFecharGerenciar",
  "botaoSair",
  "nomeUsuario",
  "emailUsuario",
  "letraUsuario",
  "botaoNovoEstudo",
  "botaoPararEstudo",
  "cronometro",
  "controleCronometro",
  "textoSituacao",
  "pontoSituacao",
  "campoPesquisa",
  "arvoreArtigos",
  "caminho",
  "contadorArtigos",
  "estadoVazio",
  "visualizacaoArtigo",
  "tituloArtigo",
  "textoLei",
  "caixaExplicacao",
  "textoExplicacao",
  "cartaoDetalhes",
  "textoPena",
  "textoMulta",
  "statusRevisaoArtigo",
  "informacaoProximaRevisao",
  "botaoRegistrarEstudo",
  "botaoConcluirRevisao",
  "botaoAnterior",
  "botaoProximo",
  "progressoArtigo",
  "botaoAtualizarRevisoes",
  "contadorRevisao7",
  "contadorRevisao15",
  "contadorRevisao30",
  "totalBloco7",
  "totalBloco15",
  "totalBloco30",
  "listaRevisao7",
  "listaRevisao15",
  "listaRevisao30",
  "botaoAtualizarInsights",
  "tempoTotalEstudado",
  "totalCardsCriados",
  "totalCardsEstudados",
  "totalRevisoesPendentes",
  "graficoCardsCriados",
  "graficoCardsEstudados",
  "linhaTempoEstudos",
  "abaEstrutura",
  "abaCards",
  "painelEstrutura",
  "painelCards",
  "formularioMateria",
  "idMateriaEdicao",
  "campoNomeMateria",
  "campoOrdemMateria",
  "botaoSalvarMateria",
  "botaoCancelarMateria",
  "mensagemMateria",
  "formularioAssunto",
  "idAssuntoEdicao",
  "selectMateriaAssunto",
  "campoNomeAssunto",
  "campoOrdemAssunto",
  "botaoSalvarAssunto",
  "botaoCancelarAssunto",
  "mensagemAssunto",
  "formularioTopico",
  "idTopicoEdicao",
  "selectMateriaTopico",
  "selectAssuntoTopico",
  "campoNomeTopico",
  "campoOrdemTopico",
  "botaoSalvarTopico",
  "botaoCancelarTopico",
  "mensagemTopico",
  "quantidadeMaterias",
  "quantidadeAssuntos",
  "quantidadeTopicos",
  "listaEstrutura",
  "formularioArtigo",
  "idArtigo",
  "campoMateria",
  "campoAssunto",
  "campoTopico",
  "campoNumero",
  "campoTitulo",
  "campoTextoLei",
  "campoExplicacao",
  "campoPena",
  "campoMulta",
  "campoOrdem",
  "tituloFormulario",
  "botaoSalvarArtigo",
  "botaoCancelarEdicao",
  "mensagemFormulario",
  "listaArtigosSalvos",
  "quantidadeSalva",
  "aviso"
];

document.addEventListener(
  "DOMContentLoaded",
  iniciarSistema
);

async function iniciarSistema() {
  guardarElementos();
  configurarEventos();
  restaurarEstadoMenu();

  const { data, error } =
    await supabaseCliente.auth.getSession();

  if (error || !data.session) {
    window.location.replace("index.html");
    return;
  }

  estado.usuario = data.session.user;

  mostrarUsuario(estado.usuario);

  await carregarEstrutura();
  await carregarArtigos();
  await carregarDadosAnaliticos();

  atualizarQuantidadeRevisoes();
  desenharTudo();

  elementos.controleCronometro.checked = false;
  estado.segundosSessao = 0;

  atualizarTextoCronometro();
  atualizarSituacaoCronometro(false);
}

function guardarElementos() {
  idsElementos.forEach(function (id) {
    elementos[id] =
      document.getElementById(id);
  });
}

function configurarEventos() {
  elementos.botaoAbrirMenu.addEventListener(
    "click",
    abrirMenuCelular
  );

  elementos.fundoMenu.addEventListener(
    "click",
    fecharMenuCelular
  );

  elementos.botaoRecolherMenu.addEventListener(
    "click",
    alternarMenuLateral
  );

  elementos.menuLeiSeca.addEventListener(
    "click",
    function () {
      trocarTela("lei-seca");
    }
  );

  elementos.menuRevisoes.addEventListener(
    "click",
    function () {
      trocarTela("revisoes");
    }
  );

  elementos.menuInsights.addEventListener(
    "click",
    function () {
      trocarTela("insights");
    }
  );

  elementos.botaoGerenciar.addEventListener(
    "click",
    function () {
      abrirGerenciador("estrutura");
    }
  );

  elementos.botaoCriarPrimeiro.addEventListener(
    "click",
    function () {
      abrirGerenciador("cards");
    }
  );

  elementos.abaEstrutura.addEventListener(
    "click",
    function () {
      trocarAbaGerenciamento("estrutura");
    }
  );

  elementos.abaCards.addEventListener(
    "click",
    function () {
      trocarAbaGerenciamento("cards");
    }
  );

  elementos.formularioMateria.addEventListener(
    "submit",
    salvarMateria
  );

  elementos.formularioAssunto.addEventListener(
    "submit",
    salvarAssunto
  );

  elementos.formularioTopico.addEventListener(
    "submit",
    salvarTopico
  );

  elementos.botaoCancelarMateria.addEventListener(
    "click",
    limparFormularioMateria
  );

  elementos.botaoCancelarAssunto.addEventListener(
    "click",
    limparFormularioAssunto
  );

  elementos.botaoCancelarTopico.addEventListener(
    "click",
    limparFormularioTopico
  );

  elementos.selectMateriaTopico.addEventListener(
    "change",
    function () {
      preencherAssuntosDoTopico();
    }
  );

  elementos.campoMateria.addEventListener(
    "change",
    function () {
      preencherAssuntosDoCard();
    }
  );

  elementos.campoAssunto.addEventListener(
    "change",
    function () {
      preencherTopicosDoCard();
    }
  );

  elementos.botaoFecharGerenciar.addEventListener(
    "click",
    function () {
      elementos.janelaGerenciar.close();
    }
  );

  elementos.janelaGerenciar.addEventListener(
    "click",
    fecharDialogoAoClicarFora
  );

  elementos.botaoSair.addEventListener(
    "click",
    sairDoSistema
  );

  elementos.botaoNovoEstudo.addEventListener(
    "click",
    iniciarNovoEstudo
  );

  elementos.controleCronometro.addEventListener(
    "change",
    async function () {
      if (
        elementos.controleCronometro.checked
      ) {
        await iniciarCronometro();
      } else {
        await pararEstudo(false);
      }
    }
  );

  elementos.botaoPararEstudo.addEventListener(
    "click",
    async function () {
      await pararEstudo(true);
    }
  );

  elementos.campoPesquisa.addEventListener(
    "input",
    pesquisarArtigos
  );

  elementos.botaoAnterior.addEventListener(
    "click",
    function () {
      selecionarArtigo(
        estado.artigoAtual - 1
      );
    }
  );

  elementos.botaoProximo.addEventListener(
    "click",
    function () {
      selecionarArtigo(
        estado.artigoAtual + 1
      );
    }
  );

  elementos.botaoRegistrarEstudo.addEventListener(
    "click",
    registrarEstudoArtigoAtual
  );

  elementos.botaoConcluirRevisao.addEventListener(
    "click",
    concluirRevisaoArtigoAtual
  );

  elementos.botaoAtualizarRevisoes.addEventListener(
    "click",
    async function () {
      await carregarArtigos();
      desenharRevisoes();

      mostrarAviso(
        "Lista de revisões atualizada."
      );
    }
  );

  elementos.botaoAtualizarInsights.addEventListener(
    "click",
    async function () {
      await carregarDadosAnaliticos();
      desenharInsights();

      mostrarAviso(
        "Insights atualizados."
      );
    }
  );

  elementos.formularioArtigo.addEventListener(
    "submit",
    salvarArtigo
  );

  elementos.botaoCancelarEdicao.addEventListener(
    "click",
    limparFormulario
  );

  document.addEventListener(
    "visibilitychange",
    function () {
      if (
        document.visibilityState === "hidden" &&
        estado.cronometroAtivo
      ) {
        atualizarSessaoNoBanco(false);
      }
    }
  );
}

async function trocarTela(tela) {
  estado.telaAtual = tela;

  elementos.telaLeiSeca.hidden =
    tela !== "lei-seca";

  elementos.telaRevisoes.hidden =
    tela !== "revisoes";

  elementos.telaInsights.hidden =
    tela !== "insights";

  elementos.menuLeiSeca.classList.toggle(
    "ativo",
    tela === "lei-seca"
  );

  elementos.menuRevisoes.classList.toggle(
    "ativo",
    tela === "revisoes"
  );

  elementos.menuInsights.classList.toggle(
    "ativo",
    tela === "insights"
  );

  if (tela === "lei-seca") {
    elementos.tituloPagina.textContent =
      "Lei Seca";
  }

  if (tela === "revisoes") {
    elementos.tituloPagina.textContent =
      "Revisões";

    await carregarArtigos();
    desenharRevisoes();
  }

  if (tela === "insights") {
    elementos.tituloPagina.textContent =
      "Insights";

    await carregarDadosAnaliticos();
    desenharInsights();
  }

  fecharMenuCelular();
}

function alternarMenuLateral() {
  const recolhido =
    elementos.menuPrincipal.classList.toggle(
      "recolhido"
    );

  elementos.areaAplicacao.classList.toggle(
    "menu-recolhido",
    recolhido
  );

  elementos.botaoRecolherMenu.title =
    recolhido
      ? "Expandir menu"
      : "Recolher menu";

  localStorage.setItem(
    "projeto-santos-menu-recolhido",
    String(recolhido)
  );
}

function restaurarEstadoMenu() {
  const recolhido =
    localStorage.getItem(
      "projeto-santos-menu-recolhido"
    ) === "true";

  elementos.menuPrincipal.classList.toggle(
    "recolhido",
    recolhido
  );

  elementos.areaAplicacao.classList.toggle(
    "menu-recolhido",
    recolhido
  );
}

function abrirMenuCelular() {
  elementos.menuPrincipal.classList.add(
    "aberto"
  );

  elementos.fundoMenu.classList.add(
    "visivel"
  );
}

function fecharMenuCelular() {
  elementos.menuPrincipal.classList.remove(
    "aberto"
  );

  elementos.fundoMenu.classList.remove(
    "visivel"
  );
}

function mostrarUsuario(usuario) {
  const email =
    usuario.email || "Usuário";

  const nome =
    usuario.user_metadata?.name ||
    email.split("@")[0];

  elementos.nomeUsuario.textContent = nome;
  elementos.emailUsuario.textContent = email;

  elementos.letraUsuario.textContent =
    nome.charAt(0).toUpperCase();
}

async function sairDoSistema() {
  await finalizarSessaoCronometro();
  await supabaseCliente.auth.signOut();

  window.location.replace("index.html");
}

async function iniciarCronometro() {
  if (estado.cronometroAtivo) {
    return;
  }

  elementos.controleCronometro.checked = true;

  estado.cronometroAtivo = true;
  estado.segundosSessao = 0;
  estado.inicioSessao = Date.now();

  atualizarSituacaoCronometro(true);
  atualizarTextoCronometro();

  const { data, error } =
    await supabaseCliente
      .from("sessoes_estudo")
      .insert({
        usuario_id: estado.usuario.id,
        iniciado_em:
          new Date().toISOString(),
        duracao_segundos: 0
      })
      .select("id")
      .single();

  if (error) {
    console.error(
      "Erro ao criar sessão:",
      error
    );

    mostrarAviso(
      "O cronômetro iniciou, mas a sessão não pôde ser registrada.",
      true
    );
  } else {
    estado.sessaoAtualId = data.id;
  }

  clearInterval(
    estado.intervaloCronometro
  );

  clearInterval(
    estado.intervaloPersistencia
  );

  estado.intervaloCronometro =
    setInterval(
      function () {
        estado.segundosSessao =
          Math.floor(
            (
              Date.now() -
              estado.inicioSessao
            ) / 1000
          );

        atualizarTextoCronometro();
      },
      1000
    );

  estado.intervaloPersistencia =
    setInterval(
      function () {
        atualizarSessaoNoBanco(false);
      },
      30000
    );
}

async function pausarCronometro() {
  await pararEstudo(false);
}

async function pararEstudo(
  mostrarConfirmacao = true
) {
  elementos.controleCronometro.checked =
    false;

  if (!estado.cronometroAtivo) {
    atualizarSituacaoCronometro(false);
    return;
  }

  elementos.botaoPararEstudo.disabled =
    true;

  await finalizarSessaoCronometro();

  atualizarSituacaoCronometro(false);

  await carregarDadosAnaliticos();

  if (estado.telaAtual === "insights") {
    desenharInsights();
  }

  if (mostrarConfirmacao) {
    mostrarAviso(
      "Estudo encerrado e contabilizado: " +
        transformarSegundosEmHorario(
          estado.segundosSessao
        )
    );
  }
}

async function finalizarSessaoCronometro() {
  if (!estado.cronometroAtivo) {
    return;
  }

  estado.segundosSessao =
    Math.floor(
      (
        Date.now() -
        estado.inicioSessao
      ) / 1000
    );

  clearInterval(
    estado.intervaloCronometro
  );

  clearInterval(
    estado.intervaloPersistencia
  );

  await atualizarSessaoNoBanco(true);

  estado.cronometroAtivo = false;
  estado.sessaoAtualId = null;
  estado.inicioSessao = null;
}

async function atualizarSessaoNoBanco(
  finalizar
) {
  if (!estado.sessaoAtualId) {
    return;
  }

  const atualizacao = {
    duracao_segundos:
      estado.segundosSessao
  };

  if (finalizar) {
    atualizacao.finalizado_em =
      new Date().toISOString();
  }

  const { error } =
    await supabaseCliente
      .from("sessoes_estudo")
      .update(atualizacao)
      .eq(
        "id",
        estado.sessaoAtualId
      );

  if (error) {
    console.error(
      "Erro ao atualizar sessão:",
      error
    );
  }
}

function atualizarSituacaoCronometro(
  ativo
) {
  const situacao =
    elementos.textoSituacao.parentElement;

  elementos.textoSituacao.textContent =
    ativo
      ? "Em estudo"
      : "Estudo parado";

  situacao.classList.toggle(
    "pausado",
    !ativo
  );

  elementos.botaoPararEstudo.disabled =
    !ativo;

  elementos.botaoPararEstudo.setAttribute(
    "aria-disabled",
    String(!ativo)
  );
}

function atualizarTextoCronometro() {
  elementos.cronometro.textContent =
    transformarSegundosEmHorario(
      estado.segundosSessao
    );
}

async function iniciarNovoEstudo() {
  if (estado.cronometroAtivo) {
    await pararEstudo(false);
  }

  estado.segundosSessao = 0;

  atualizarTextoCronometro();

  elementos.controleCronometro.checked =
    false;

  atualizarSituacaoCronometro(false);

  estado.artigoAtual = 0;
  elementos.campoPesquisa.value = "";

  estado.artigosFiltrados = [
    ...estado.artigos
  ];

  desenharMenuArtigos();
  mostrarArtigoAtual();

  mostrarAviso(
    "Novo estudo preparado. Ligue a chave para começar."
  );
}

function transformarSegundosEmHorario(
  totalSegundos
) {
  const horas = String(
    Math.floor(
      totalSegundos / 3600
    )
  ).padStart(2, "0");

  const minutos = String(
    Math.floor(
      (
        totalSegundos % 3600
      ) / 60
    )
  ).padStart(2, "0");

  const segundos = String(
    totalSegundos % 60
  ).padStart(2, "0");

  return (
    horas +
    ":" +
    minutos +
    ":" +
    segundos
  );
}

function transformarSegundosEmTexto(
  totalSegundos
) {
  const horas =
    Math.floor(
      totalSegundos / 3600
    );

  const minutos =
    Math.floor(
      (
        totalSegundos % 3600
      ) / 60
    );

  return (
    String(horas).padStart(2, "0") +
    "h " +
    String(minutos).padStart(2, "0") +
    "min"
  );
}

async function carregarEstrutura() {
  const [
    resultadoMaterias,
    resultadoAssuntos,
    resultadoTopicos
  ] = await Promise.all([
    supabaseCliente
      .from("materias")
      .select("*")
      .order(
        "ordem",
        { ascending: true }
      )
      .order(
        "nome",
        { ascending: true }
      ),

    supabaseCliente
      .from("assuntos")
      .select("*")
      .order(
        "ordem",
        { ascending: true }
      )
      .order(
        "nome",
        { ascending: true }
      ),

    supabaseCliente
      .from("topicos")
      .select("*")
      .order(
        "ordem",
        { ascending: true }
      )
      .order(
        "nome",
        { ascending: true }
      )
  ]);

  if (resultadoMaterias.error) {
    console.error(
      "Erro ao carregar matérias:",
      resultadoMaterias.error
    );

    estado.materias = [];
  } else {
    estado.materias =
      resultadoMaterias.data || [];
  }

  if (resultadoAssuntos.error) {
    console.error(
      "Erro ao carregar assuntos:",
      resultadoAssuntos.error
    );

    estado.assuntos = [];
  } else {
    estado.assuntos =
      resultadoAssuntos.data || [];
  }

  if (resultadoTopicos.error) {
    console.error(
      "Erro ao carregar tópicos:",
      resultadoTopicos.error
    );

    estado.topicos = [];
  } else {
    estado.topicos =
      resultadoTopicos.data || [];
  }

  preencherSeletoresEstrutura();
  desenharEstruturaCadastrada();
}

function preencherSelect(
  select,
  itens,
  textoInicial,
  valorSelecionado = ""
) {
  select.replaceChildren();

  const opcaoInicial =
    document.createElement("option");

  opcaoInicial.value = "";
  opcaoInicial.textContent =
    textoInicial;

  select.appendChild(opcaoInicial);

  itens.forEach(function (item) {
    const opcao =
      document.createElement("option");

    opcao.value = item.id;
    opcao.textContent = item.nome;

    select.appendChild(opcao);
  });

  select.disabled =
    itens.length === 0;

  if (
    valorSelecionado &&
    itens.some(
      item =>
        item.id === valorSelecionado
    )
  ) {
    select.value = valorSelecionado;
  }
}

function preencherSeletoresEstrutura() {
  const materiaAssuntoAtual =
    elementos.selectMateriaAssunto.value;

  const materiaTopicoAtual =
    elementos.selectMateriaTopico.value;

  const materiaCardAtual =
    elementos.campoMateria.value;

  const assuntoCardAtual =
    elementos.campoAssunto.value;

  const topicoCardAtual =
    elementos.campoTopico.value;

  preencherSelect(
    elementos.selectMateriaAssunto,
    estado.materias,
    "Selecione uma matéria",
    materiaAssuntoAtual
  );

  preencherSelect(
    elementos.selectMateriaTopico,
    estado.materias,
    "Selecione uma matéria",
    materiaTopicoAtual
  );

  preencherSelect(
    elementos.campoMateria,
    estado.materias,
    "Selecione uma matéria",
    materiaCardAtual
  );

  preencherAssuntosDoTopico();

  preencherAssuntosDoCard(
    assuntoCardAtual,
    topicoCardAtual
  );
}

function preencherAssuntosDoTopico(
  valorSelecionado = ""
) {
  const materiaId =
    elementos.selectMateriaTopico.value;

  const assuntos =
    estado.assuntos.filter(
      assunto =>
        assunto.materia_id ===
        materiaId
    );

  preencherSelect(
    elementos.selectAssuntoTopico,
    assuntos,
    materiaId
      ? "Selecione um assunto"
      : "Primeiro selecione uma matéria",
    valorSelecionado
  );
}

function preencherAssuntosDoCard(
  valorAssunto = "",
  valorTopico = ""
) {
  const materiaId =
    elementos.campoMateria.value;

  const assuntos =
    estado.assuntos.filter(
      assunto =>
        assunto.materia_id ===
        materiaId
    );

  preencherSelect(
    elementos.campoAssunto,
    assuntos,
    materiaId
      ? "Selecione um assunto"
      : "Primeiro selecione uma matéria",
    valorAssunto
  );

  preencherTopicosDoCard(
    valorTopico
  );
}

function preencherTopicosDoCard(
  valorSelecionado = ""
) {
  const assuntoId =
    elementos.campoAssunto.value;

  const topicos =
    estado.topicos.filter(
      topico =>
        topico.assunto_id ===
        assuntoId
    );

  preencherSelect(
    elementos.campoTopico,
    topicos,
    assuntoId
      ? "Selecione um tópico"
      : "Primeiro selecione um assunto",
    valorSelecionado
  );
}

function trocarAbaGerenciamento(aba) {
  const mostrarEstrutura =
    aba === "estrutura";

  elementos.painelEstrutura.hidden =
    !mostrarEstrutura;

  elementos.painelCards.hidden =
    mostrarEstrutura;

  elementos.abaEstrutura.classList.toggle(
    "ativa",
    mostrarEstrutura
  );

  elementos.abaCards.classList.toggle(
    "ativa",
    !mostrarEstrutura
  );
}

async function salvarMateria(evento) {
  evento.preventDefault();

  const nome =
    elementos.campoNomeMateria
      .value.trim();

  const ordem =
    Number(
      elementos.campoOrdemMateria.value
    ) || 0;

  elementos.botaoSalvarMateria.disabled =
    true;

  elementos.mensagemMateria.textContent =
    "";

  const dados = {
    nome,
    ordem,
    atualizado_em:
      new Date().toISOString()
  };

  const resultado =
    estado.materiaSendoEditada
      ? await supabaseCliente
          .from("materias")
          .update(dados)
          .eq(
            "id",
            estado.materiaSendoEditada
          )
      : await supabaseCliente
          .from("materias")
          .insert({
            ...dados,
            usuario_id:
              estado.usuario.id
          });

  elementos.botaoSalvarMateria.disabled =
    false;

  if (resultado.error) {
    elementos.mensagemMateria.textContent =
      resultado.error.code === "23505"
        ? "Essa matéria já está cadastrada."
        : "Não foi possível salvar: " +
          resultado.error.message;

    return;
  }

  mostrarAviso(
    estado.materiaSendoEditada
      ? "Matéria atualizada."
      : "Matéria criada."
  );

  limparFormularioMateria();

  await carregarEstrutura();
  await carregarArtigos();
}

async function salvarAssunto(evento) {
  evento.preventDefault();

  const materiaId =
    elementos.selectMateriaAssunto.value;

  const nome =
    elementos.campoNomeAssunto
      .value.trim();

  const ordem =
    Number(
      elementos.campoOrdemAssunto.value
    ) || 0;

  elementos.botaoSalvarAssunto.disabled =
    true;

  elementos.mensagemAssunto.textContent =
    "";

  const dados = {
    materia_id: materiaId,
    nome,
    ordem,
    atualizado_em:
      new Date().toISOString()
  };

  const resultado =
    estado.assuntoSendoEditado
      ? await supabaseCliente
          .from("assuntos")
          .update(dados)
          .eq(
            "id",
            estado.assuntoSendoEditado
          )
      : await supabaseCliente
         
