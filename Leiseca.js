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
      if (elementos.controleCronometro.checked) {
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
  const horas =
    String(
      Math.floor(
        totalSegundos / 3600
      )
    ).padStart(2, "0");

  const minutos =
    String(
      Math.floor(
        (
          totalSegundos % 3600
        ) / 60
      )
    ).padStart(2, "0");

  const segundos =
    String(
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

  select.appendChild(
    opcaoInicial
  );

  itens.forEach(
    function (item) {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value = item.id;
      opcao.textContent = item.nome;

      select.appendChild(opcao);
    }
  );

  select.disabled =
    itens.length === 0;

  if (
    valorSelecionado &&
    itens.some(
      item =>
        item.id === valorSelecionado
    )
  ) {
    select.value =
      valorSelecionado;
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

  elementos.abaEstrutura
    .classList.toggle(
      "ativa",
      mostrarEstrutura
    );

  elementos.abaCards
    .classList.toggle(
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
      elementos.campoOrdemMateria
        .value
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
    elementos.selectMateriaAssunto
      .value;

  const nome =
    elementos.campoNomeAssunto
      .value.trim();

  const ordem =
    Number(
      elementos.campoOrdemAssunto
        .value
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
          .from("assuntos")
          .insert({
            ...dados,
            usuario_id:
              estado.usuario.id
          });

  elementos.botaoSalvarAssunto.disabled =
    false;

  if (resultado.error) {
    elementos.mensagemAssunto.textContent =
      resultado.error.code === "23505"
        ? "Esse assunto já existe nesta matéria."
        : "Não foi possível salvar: " +
          resultado.error.message;

    return;
  }

  mostrarAviso(
    estado.assuntoSendoEditado
      ? "Assunto atualizado."
      : "Assunto criado."
  );

  limparFormularioAssunto();

  await carregarEstrutura();
  await carregarArtigos();
}

async function salvarTopico(evento) {
  evento.preventDefault();

  const assuntoId =
    elementos.selectAssuntoTopico
      .value;

  const nome =
    elementos.campoNomeTopico
      .value.trim();

  const ordem =
    Number(
      elementos.campoOrdemTopico
        .value
    ) || 0;

  elementos.botaoSalvarTopico.disabled =
    true;

  elementos.mensagemTopico.textContent =
    "";

  const dados = {
    assunto_id: assuntoId,
    nome,
    ordem,
    atualizado_em:
      new Date().toISOString()
  };

  const resultado =
    estado.topicoSendoEditado
      ? await supabaseCliente
          .from("topicos")
          .update(dados)
          .eq(
            "id",
            estado.topicoSendoEditado
          )
      : await supabaseCliente
          .from("topicos")
          .insert({
            ...dados,
            usuario_id:
              estado.usuario.id
          });

  elementos.botaoSalvarTopico.disabled =
    false;

  if (resultado.error) {
    elementos.mensagemTopico.textContent =
      resultado.error.code === "23505"
        ? "Esse tópico já existe neste assunto."
        : "Não foi possível salvar: " +
          resultado.error.message;

    return;
  }

  mostrarAviso(
    estado.topicoSendoEditado
      ? "Tópico atualizado."
      : "Tópico criado."
  );

  limparFormularioTopico();

  await carregarEstrutura();
  await carregarArtigos();
}

function limparFormularioMateria() {
  estado.materiaSendoEditada = null;

  elementos.formularioMateria.reset();
  elementos.idMateriaEdicao.value = "";
  elementos.campoOrdemMateria.value = 0;

  elementos.botaoSalvarMateria
    .textContent =
      "Salvar matéria";

  elementos.botaoCancelarMateria.hidden =
    true;

  elementos.mensagemMateria.textContent =
    "";
}

function limparFormularioAssunto() {
  estado.assuntoSendoEditado = null;

  elementos.formularioAssunto.reset();
  elementos.idAssuntoEdicao.value = "";
  elementos.campoOrdemAssunto.value = 0;

  elementos.botaoSalvarAssunto
    .textContent =
      "Salvar assunto";

  elementos.botaoCancelarAssunto.hidden =
    true;

  elementos.mensagemAssunto.textContent =
    "";
}

function limparFormularioTopico() {
  estado.topicoSendoEditado = null;

  elementos.formularioTopico.reset();
  elementos.idTopicoEdicao.value = "";
  elementos.campoOrdemTopico.value = 0;

  elementos.botaoSalvarTopico
    .textContent =
      "Salvar tópico";

  elementos.botaoCancelarTopico.hidden =
    true;

  elementos.mensagemTopico.textContent =
    "";

  preencherAssuntosDoTopico();
}

function editarMateria(id) {
  const materia =
    estado.materias.find(
      item => item.id === id
    );

  if (!materia) {
    return;
  }

  estado.materiaSendoEditada = id;

  elementos.idMateriaEdicao.value = id;
  elementos.campoNomeMateria.value =
    materia.nome;

  elementos.campoOrdemMateria.value =
    materia.ordem || 0;

  elementos.botaoSalvarMateria
    .textContent =
      "Atualizar matéria";

  elementos.botaoCancelarMateria.hidden =
    false;

  elementos.campoNomeMateria.focus();
}

function editarAssunto(id) {
  const assunto =
    estado.assuntos.find(
      item => item.id === id
    );

  if (!assunto) {
    return;
  }

  estado.assuntoSendoEditado = id;

  elementos.idAssuntoEdicao.value = id;

  elementos.selectMateriaAssunto.value =
    assunto.materia_id;

  elementos.campoNomeAssunto.value =
    assunto.nome;

  elementos.campoOrdemAssunto.value =
    assunto.ordem || 0;

  elementos.botaoSalvarAssunto
    .textContent =
      "Atualizar assunto";

  elementos.botaoCancelarAssunto.hidden =
    false;

  elementos.campoNomeAssunto.focus();
}

function editarTopico(id) {
  const topico =
    estado.topicos.find(
      item => item.id === id
    );

  if (!topico) {
    return;
  }

  const assunto =
    estado.assuntos.find(
      item =>
        item.id ===
        topico.assunto_id
    );

  if (!assunto) {
    return;
  }

  estado.topicoSendoEditado = id;

  elementos.idTopicoEdicao.value = id;

  elementos.selectMateriaTopico.value =
    assunto.materia_id;

  preencherAssuntosDoTopico(
    topico.assunto_id
  );

  elementos.campoNomeTopico.value =
    topico.nome;

  elementos.campoOrdemTopico.value =
    topico.ordem || 0;

  elementos.botaoSalvarTopico
    .textContent =
      "Atualizar tópico";

  elementos.botaoCancelarTopico.hidden =
    false;

  elementos.campoNomeTopico.focus();
}

async function excluirItemEstrutura(
  tabela,
  id,
  nome
) {
  const confirmou =
    window.confirm(
      "Excluir “" +
      nome +
      "”? Isso só será permitido se não houver cards vinculados."
    );

  if (!confirmou) {
    return;
  }

  const { error } =
    await supabaseCliente
      .from(tabela)
      .delete()
      .eq("id", id);

  if (error) {
    mostrarAviso(
      error.code === "23503"
        ? "Não é possível excluir porque existem cards dentro dessa estrutura."
        : "Não foi possível excluir: " +
          error.message,
      true
    );

    return;
  }

  mostrarAviso(
    "Item da estrutura excluído."
  );

  await carregarEstrutura();
  await carregarArtigos();
}

function criarAcoesEstrutura(
  tipo,
  item
) {
  const acoes =
    document.createElement("div");

  acoes.className =
    "acoes-item-estrutura";

  const editar =
    document.createElement("button");

  editar.type = "button";
  editar.textContent = "Editar";

  editar.addEventListener(
    "click",
    function () {
      if (tipo === "materia") {
        editarMateria(item.id);
      }

      if (tipo === "assunto") {
        editarAssunto(item.id);
      }

      if (tipo === "topico") {
        editarTopico(item.id);
      }
    }
  );

  const excluir =
    document.createElement("button");

  excluir.type = "button";
  excluir.className = "excluir";
  excluir.textContent = "Excluir";

  excluir.addEventListener(
    "click",
    function () {
      const tabela =
        tipo === "materia"
          ? "materias"
          : tipo === "assunto"
            ? "assuntos"
            : "topicos";

      excluirItemEstrutura(
        tabela,
        item.id,
        item.nome
      );
    }
  );

  acoes.append(
    editar,
    excluir
  );

  return acoes;
}

function criarNomeEstrutura(
  icone,
  nome
) {
  const caixa =
    document.createElement("div");

  caixa.className =
    "nome-item-estrutura";

  const simbolo =
    document.createElement("span");

  simbolo.textContent = icone;

  const texto =
    document.createElement("strong");

  texto.textContent = nome;

  caixa.append(
    simbolo,
    texto
  );

  return caixa;
}

function desenharEstruturaCadastrada() {
  elementos.quantidadeMaterias.textContent =
    estado.materias.length;

  elementos.quantidadeAssuntos.textContent =
    estado.assuntos.length;

  elementos.quantidadeTopicos.textContent =
    estado.topicos.length;

  elementos.listaEstrutura
    .replaceChildren();

  if (estado.materias.length === 0) {
    const vazio =
      document.createElement("p");

    vazio.className =
      "lista-vazia-estrutura";

    vazio.textContent =
      "Nenhuma estrutura cadastrada.";

    elementos.listaEstrutura
      .appendChild(vazio);

    return;
  }

  estado.materias.forEach(
    function (materia) {
      const caixaMateria =
        document.createElement(
          "article"
        );

      caixaMateria.className =
        "item-materia-estrutura";

      const cabecalhoMateria =
        document.createElement("div");

      cabecalhoMateria.className =
        "cabecalho-item-estrutura";

      cabecalhoMateria.append(
        criarNomeEstrutura(
          "M",
          materia.nome
        ),
        criarAcoesEstrutura(
          "materia",
          materia
        )
      );

      const listaAssuntos =
        document.createElement("div");

      listaAssuntos.className =
        "lista-assuntos-estrutura";

      const assuntos =
        estado.assuntos.filter(
          assunto =>
            assunto.materia_id ===
            materia.id
        );

      if (assuntos.length === 0) {
        const vazio =
          document.createElement("p");

        vazio.className =
          "lista-vazia";

        vazio.textContent =
          "Nenhum assunto nesta matéria.";

        listaAssuntos.appendChild(vazio);
      }

      assuntos.forEach(
        function (assunto) {
          const caixaAssunto =
            document.createElement(
              "section"
            );

          caixaAssunto.className =
            "item-assunto-estrutura";

          const cabecalhoAssunto =
            document.createElement("div");

          cabecalhoAssunto.className =
            "cabecalho-item-estrutura";

          cabecalhoAssunto.append(
            criarNomeEstrutura(
              "A",
              assunto.nome
            ),
            criarAcoesEstrutura(
              "assunto",
              assunto
            )
          );

          const listaTopicos =
            document.createElement("div");

          listaTopicos.className =
            "lista-topicos-estrutura";

          const topicos =
            estado.topicos.filter(
              topico =>
                topico.assunto_id ===
                assunto.id
            );

          if (topicos.length === 0) {
            const vazio =
              document.createElement("p");

            vazio.className =
              "lista-vazia";

            vazio.textContent =
              "Nenhum tópico neste assunto.";

            listaTopicos.appendChild(
              vazio
            );
          }

          topicos.forEach(
            function (topico) {
              const caixaTopico =
                document.createElement(
                  "div"
                );

              caixaTopico.className =
                "item-topico-estrutura";

              caixaTopico.append(
                criarNomeEstrutura(
                  "T",
                  topico.nome
                ),
                criarAcoesEstrutura(
                  "topico",
                  topico
                )
              );

              listaTopicos.appendChild(
                caixaTopico
              );
            }
          );

          caixaAssunto.append(
            cabecalhoAssunto,
            listaTopicos
          );

          listaAssuntos.appendChild(
            caixaAssunto
          );
        }
      );

      caixaMateria.append(
        cabecalhoMateria,
        listaAssuntos
      );

      elementos.listaEstrutura
        .appendChild(
          caixaMateria
        );
    }
  );
}

async function carregarArtigos(
  idPreferido = null
) {
  const { data, error } =
    await supabaseCliente
      .from("artigos")
      .select("*")
      .eq("ativo", true)
      .order(
        "ordem",
        { ascending: true }
      )
      .order(
        "criado_em",
        { ascending: true }
      );

  if (error) {
    console.error(
      "Erro ao carregar artigos:",
      error
    );

    estado.artigos = [];
    estado.artigosFiltrados = [];

    mostrarAviso(
      "Não foi possível carregar os artigos: " +
      error.message,
      true
    );
  } else {
    estado.artigos =
      (data || []).map(
        function (artigo) {
          const materia =
            estado.materias.find(
              item =>
                item.id ===
                artigo.materia_id
            );

          const assunto =
            estado.assuntos.find(
              item =>
                item.id ===
                artigo.assunto_id
            );

          const topico =
            estado.topicos.find(
              item =>
                item.id ===
                artigo.topico_id
            );

          return {
            ...artigo,

            materia:
              materia?.nome ||
              artigo.materia ||
              "Sem matéria",

            assunto:
              assunto?.nome ||
              artigo.assunto ||
              "Sem assunto",

            topico:
              topico?.nome ||
              "Geral"
          };
        }
      );

    estado.artigosFiltrados = [
      ...estado.artigos
    ];
  }

  if (idPreferido) {
    const posicao =
      estado.artigosFiltrados.findIndex(
        function (artigo) {
          return (
            artigo.id ===
            idPreferido
          );
        }
      );

    estado.artigoAtual =
      posicao >= 0
        ? posicao
        : 0;
  } else if (
    estado.artigoAtual >=
    estado.artigosFiltrados.length
  ) {
    estado.artigoAtual = 0;
  }

  atualizarQuantidadeRevisoes();
  desenharTudo();
}

function desenharTudo() {
  desenharMenuArtigos();
  mostrarArtigoAtual();
  desenharListaGerenciamento();
  desenharRevisoes();
}

function desenharMenuArtigos() {
  elementos.arvoreArtigos
    .replaceChildren();

  if (
    estado.artigosFiltrados.length === 0
  ) {
    const vazio =
      document.createElement("p");

    vazio.className =
      "lista-vazia";

    vazio.textContent =
      "Nenhum artigo encontrado.";

    elementos.arvoreArtigos
      .appendChild(vazio);

    return;
  }

  const grupos =
    agruparArtigos(
      estado.artigosFiltrados
    );

  Object.keys(grupos).forEach(
    function (materia) {
      const caixaMateria =
        document.createElement(
          "section"
        );

      const tituloMateria =
        document.createElement(
          "button"
        );

      tituloMateria.type =
        "button";

      tituloMateria.className =
        "titulo-materia";

      tituloMateria.textContent =
        "▾ " + materia;

      caixaMateria.appendChild(
        tituloMateria
      );

      const conteudoMateria =
        document.createElement("div");

      Object.keys(
        grupos[materia]
      ).forEach(
        function (assunto) {
          const tituloAssunto =
            document.createElement(
              "button"
            );

          tituloAssunto.type =
            "button";

          tituloAssunto.className =
            "titulo-assunto";

          tituloAssunto.textContent =
            "▾ " + assunto;

          conteudoMateria.appendChild(
            tituloAssunto
          );

          const conteudoAssunto =
            document.createElement(
              "div"
            );

          Object.keys(
            grupos[materia][assunto]
          ).forEach(
            function (topico) {
              const tituloTopico =
                document.createElement(
                  "button"
                );

              tituloTopico.type =
                "button";

              tituloTopico.className =
                "titulo-assunto titulo-topico";

              tituloTopico.textContent =
                "▾ " + topico;

              conteudoAssunto
                .appendChild(
                  tituloTopico
                );

              const conteudoTopico =
                document.createElement(
                  "div"
                );

              grupos[materia][assunto][
                topico
              ].forEach(
                function (artigo) {
                  const posicao =
                    estado.artigosFiltrados
                      .findIndex(
                        item =>
                          item.id ===
                          artigo.id
                      );

                  const botao =
                    document.createElement(
                      "button"
                    );

                  botao.type =
                    "button";

                  botao.className =
                    "botao-artigo";

                  botao.textContent =
                    artigo.numero_artigo +
                    " - " +
                    artigo.titulo;

                  if (
                    posicao ===
                    estado.artigoAtual
                  ) {
                    botao.classList.add(
                      "ativo"
                    );
                  }

                  botao.addEventListener(
                    "click",
                    function () {
                      selecionarArtigo(
                        posicao
                      );
                    }
                  );

                  conteudoTopico
                    .appendChild(
                      botao
                    );
                }
              );

              tituloTopico.addEventListener(
                "click",
                function () {
                  alternarGrupo(
                    tituloTopico,
                    conteudoTopico
                  );
                }
              );

              conteudoAssunto
                .appendChild(
                  conteudoTopico
                );
            }
          );

          tituloAssunto.addEventListener(
            "click",
            function () {
              alternarGrupo(
                tituloAssunto,
                conteudoAssunto
              );
            }
          );

          conteudoMateria.appendChild(
            conteudoAssunto
          );
        }
      );

      tituloMateria.addEventListener(
        "click",
        function () {
          alternarGrupo(
            tituloMateria,
            conteudoMateria
          );
        }
      );

      caixaMateria.appendChild(
        conteudoMateria
      );

      elementos.arvoreArtigos
        .appendChild(
          caixaMateria
        );
    }
  );
}

function agruparArtigos(artigos) {
  const grupos = {};

  artigos.forEach(
    function (artigo) {
      if (!grupos[artigo.materia]) {
        grupos[artigo.materia] = {};
      }

      if (
        !grupos[artigo.materia][
          artigo.assunto
        ]
      ) {
        grupos[artigo.materia][
          artigo.assunto
        ] = {};
      }

      if (
        !grupos[artigo.materia][
          artigo.assunto
        ][artigo.topico]
      ) {
        grupos[artigo.materia][
          artigo.assunto
        ][artigo.topico] = [];
      }

      grupos[artigo.materia][
        artigo.assunto
      ][artigo.topico].push(
        artigo
      );
    }
  );

  return grupos;
}

function alternarGrupo(
  botao,
  conteudo
) {
  const esconder =
    !conteudo.hidden;

  conteudo.hidden =
    esconder;

  botao.textContent =
    botao.textContent.replace(
      esconder ? "▾" : "▸",
      esconder ? "▸" : "▾"
    );
}

function mostrarArtigoAtual() {
  const artigo =
    estado.artigosFiltrados[
      estado.artigoAtual
    ];

  if (!artigo) {
    elementos.estadoVazio.hidden =
      false;

    elementos.visualizacaoArtigo.hidden =
      true;

    elementos.caminho.textContent =
      "Nenhum artigo selecionado";

    elementos.contadorArtigos.textContent =
      "0 de 0";

    return;
  }

  elementos.estadoVazio.hidden =
    true;

  elementos.visualizacaoArtigo.hidden =
    false;

  elementos.caminho.textContent =
    artigo.materia +
    " › " +
    artigo.assunto +
    " › " +
    artigo.topico;

  elementos.contadorArtigos.textContent =
    (
      estado.artigoAtual + 1
    ) +
    " de " +
    estado.artigosFiltrados.length;

  elementos.tituloArtigo.textContent =
    artigo.numero_artigo +
    " - " +
    artigo.titulo;

  elementos.textoLei.textContent =
    artigo.texto_lei;

  elementos.textoExplicacao.textContent =
    artigo.explicacao || "";

  elementos.caixaExplicacao.hidden =
    !artigo.explicacao;

  elementos.textoPena.textContent =
    artigo.pena ||
    "Não informado";

  elementos.textoMulta.textContent =
    artigo.multa ||
    "Não informado";

  elementos.cartaoDetalhes.hidden =
    !artigo.pena &&
    !artigo.multa;

  elementos.botaoAnterior.disabled =
    estado.artigoAtual === 0;

  elementos.botaoProximo.disabled =
    estado.artigoAtual ===
    estado.artigosFiltrados.length - 1;

  elementos.progressoArtigo.textContent =
    "Artigo " +
    (
      estado.artigoAtual + 1
    ) +
    " de " +
    estado.artigosFiltrados.length;

  atualizarEstadoRevisaoArtigo(
    artigo
  );
}

function atualizarEstadoRevisaoArtigo(
  artigo
) {
  const proximaRevisao =
    new Date(
      artigo.proxima_revisao
    );

  const agora =
    new Date();

  const disponivel =
    proximaRevisao <= agora;

  const etapa =
    artigo.etapa_revisao || 7;

  elementos.statusRevisaoArtigo
    .className =
      "status-revisao";

  if (disponivel) {
    elementos.statusRevisaoArtigo
      .textContent =
        "Revisão de " +
        etapa +
        " dias disponível";

    elementos.statusRevisaoArtigo
      .classList.add(
        "disponivel"
      );

    elementos.informacaoProximaRevisao
      .textContent =
        etapa === 30
          ? "Conclua a revisão e reinicie o ciclo em 7 dias."
          : "Este card está disponível para a revisão de " +
            etapa +
            " dias.";

    elementos.botaoConcluirRevisao.hidden =
      false;

    elementos.botaoConcluirRevisao
      .textContent =
        etapa === 30
          ? "↻ Repetir ciclo"
          : "Concluir revisão de " +
            etapa +
            " dias";
  } else {
    elementos.statusRevisaoArtigo
      .textContent =
        "Próxima revisão: " +
        formatarData(
          proximaRevisao
        );

    elementos.informacaoProximaRevisao
      .textContent =
        "Revisão de " +
        etapa +
        " dias marcada para " +
        formatarDataHora(
          proximaRevisao
        ) +
        ".";

    elementos.botaoConcluirRevisao.hidden =
      true;
  }
}

function selecionarArtigo(
  posicao
) {
  if (
    posicao < 0 ||
    posicao >=
      estado.artigosFiltrados.length
  ) {
    return;
  }

  estado.artigoAtual =
    posicao;

  desenharMenuArtigos();
  mostrarArtigoAtual();

  if (
    window.innerWidth <= 880
  ) {
    fecharMenuCelular();
  }
}

function pesquisarArtigos() {
  const pesquisa =
    normalizarTexto(
      elementos.campoPesquisa.value
    );

  if (!pesquisa) {
    estado.artigosFiltrados = [
      ...estado.artigos
    ];
  } else {
    estado.artigosFiltrados =
      estado.artigos.filter(
        function (artigo) {
          const textoCompleto = [
            artigo.materia,
            artigo.assunto,
            artigo.topico,
            artigo.numero_artigo,
            artigo.titulo,
            artigo.texto_lei,
            artigo.explicacao
          ].join(" ");

          return normalizarTexto(
            textoCompleto
          ).includes(pesquisa);
        }
      );
  }

  estado.artigoAtual = 0;

  desenharMenuArtigos();
  mostrarArtigoAtual();
}

function normalizarTexto(
  texto = ""
) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

async function registrarEstudoArtigoAtual() {
  const artigo =
    estado.artigosFiltrados[
      estado.artigoAtual
    ];

  if (!artigo) {
    return;
  }

  elementos.botaoRegistrarEstudo.disabled =
    true;

  elementos.botaoRegistrarEstudo.textContent =
    "Registrando...";

  const { error } =
    await supabaseCliente.rpc(
      "registrar_estudo",
      {
        p_artigo_id:
          artigo.id
      }
    );

  elementos.botaoRegistrarEstudo.disabled =
    false;

  elementos.botaoRegistrarEstudo.textContent =
    "✓ Marcar como estudado";

  if (error) {
    console.error(
      "Erro ao registrar estudo:",
      error
    );

    mostrarAviso(
      "Não foi possível registrar o estudo: " +
      error.message,
      true
    );

    return;
  }

  mostrarAviso(
    "Card registrado como estudado."
  );

  await carregarArtigos(
    artigo.id
  );

  await carregarDadosAnaliticos();
}

async function concluirRevisaoArtigoAtual() {
  const artigo =
    estado.artigosFiltrados[
      estado.artigoAtual
    ];

  if (!artigo) {
    return;
  }

  const etapaAnterior =
    artigo.etapa_revisao;

  elementos.botaoConcluirRevisao.disabled =
    true;

  elementos.botaoConcluirRevisao.textContent =
    "Concluindo...";

  const { error } =
    await supabaseCliente.rpc(
      "concluir_revisao",
      {
        p_artigo_id:
          artigo.id
      }
    );

  elementos.botaoConcluirRevisao.disabled =
    false;

  if (error) {
    console.error(
      "Erro ao concluir revisão:",
      error
    );

    mostrarAviso(
      "Não foi possível concluir a revisão: " +
      error.message,
      true
    );

    mostrarArtigoAtual();
    return;
  }

  const mensagem =
    etapaAnterior === 30
      ? "Ciclo concluído e reiniciado em 7 dias."
      : "Revisão de " +
        etapaAnterior +
        " dias concluída.";

  mostrarAviso(mensagem);

  await carregarArtigos(
    artigo.id
  );

  await carregarDadosAnaliticos();

  desenharRevisoes();
}

function artigosDisponiveisParaRevisao() {
  const agora =
    new Date();

  return estado.artigos.filter(
    function (artigo) {
      return (
        new Date(
          artigo.proxima_revisao
        ) <= agora
      );
    }
  );
}

function atualizarQuantidadeRevisoes() {
  const quantidade =
    artigosDisponiveisParaRevisao()
      .length;

  elementos.quantidadeRevisoesMenu
    .textContent =
      quantidade;

  elementos.quantidadeRevisoesMenu.hidden =
    quantidade === 0;
}

function desenharRevisoes() {
  const disponiveis =
    artigosDisponiveisParaRevisao();

  const grupos = {
    7: disponiveis.filter(
      artigo =>
        artigo.etapa_revisao === 7
    ),

    15: disponiveis.filter(
      artigo =>
        artigo.etapa_revisao === 15
    ),

    30: disponiveis.filter(
      artigo =>
        artigo.etapa_revisao === 30
    )
  };

  elementos.contadorRevisao7
    .textContent =
      grupos[7].length;

  elementos.contadorRevisao15
    .textContent =
      grupos[15].length;

  elementos.contadorRevisao30
    .textContent =
      grupos[30].length;

  elementos.totalBloco7.textContent =
    textoQuantidadeCards(
      grupos[7].length
    );

  elementos.totalBloco15.textContent =
    textoQuantidadeCards(
      grupos[15].length
    );

  elementos.totalBloco30.textContent =
    textoQuantidadeCards(
      grupos[30].length
    );

  desenharListaRevisao(
    elementos.listaRevisao7,
    grupos[7]
  );

  desenharListaRevisao(
    elementos.listaRevisao15,
    grupos[15]
  );

  desenharListaRevisao(
    elementos.listaRevisao30,
    grupos[30]
  );

  atualizarQuantidadeRevisoes();
}

function desenharListaRevisao(
  container,
  artigos
) {
  container.replaceChildren();

  if (artigos.length === 0) {
    const vazio =
      document.createElement("p");

    vazio.className =
      "revisao-vazia";

    vazio.textContent =
      "Nenhum card disponível neste bloco.";

    container.appendChild(vazio);
    return;
  }

  artigos.forEach(
    function (artigo) {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "card-revisao";

      const conteudo =
        document.createElement(
          "div"
        );

      const local =
        document.createElement(
          "small"
        );

      local.textContent =
        artigo.materia +
        " › " +
        artigo.assunto +
        " › " +
        artigo.topico;

      const titulo =
        document.createElement(
          "h4"
        );

      titulo.textContent =
        artigo.numero_artigo +
        " - " +
        artigo.titulo;

      const data =
        document.createElement(
          "p"
        );

      data.textContent =
        "Disponível desde " +
        formatarDataHora(
          artigo.proxima_revisao
        );

      conteudo.append(
        local,
        titulo,
        data
      );

      const acoes =
        document.createElement(
          "div"
        );

      acoes.className =
        "card-revisao-acoes";

      const botao =
        document.createElement(
          "button"
        );

      botao.type =
        "button";

      botao.className =
        "botao-principal";

      botao.textContent =
        artigo.etapa_revisao === 30
          ? "Revisar e repetir ciclo"
          : "Revisar agora";

      botao.addEventListener(
        "click",
        function () {
          abrirArtigoPelaId(
            artigo.id
          );
        }
      );

      acoes.appendChild(botao);

      card.append(
        conteudo,
        acoes
      );

      container.appendChild(card);
    }
  );
}

function abrirArtigoPelaId(
  idArtigo
) {
  estado.artigosFiltrados = [
    ...estado.artigos
  ];

  const posicao =
    estado.artigosFiltrados
      .findIndex(
        artigo =>
          artigo.id === idArtigo
      );

  estado.artigoAtual =
    posicao >= 0
      ? posicao
      : 0;

  elementos.campoPesquisa.value =
    "";

  trocarTela("lei-seca");

  desenharMenuArtigos();
  mostrarArtigoAtual();
}

function textoQuantidadeCards(
  quantidade
) {
  return quantidade === 1
    ? "1 card"
    : quantidade + " cards";
}

async function carregarDadosAnaliticos() {
  const [
    resultadoHistorico,
    resultadoSessoes
  ] = await Promise.all([
    supabaseCliente
      .from("historico_estudos")
      .select("*")
      .order(
        "estudado_em",
        { ascending: false }
      ),

    supabaseCliente
      .from("sessoes_estudo")
      .select("*")
      .order(
        "iniciado_em",
        { ascending: false }
      )
  ]);

  if (resultadoHistorico.error) {
    console.error(
      "Erro ao carregar histórico:",
      resultadoHistorico.error
    );

    estado.historico = [];
  } else {
    estado.historico =
      resultadoHistorico.data || [];
  }

  if (resultadoSessoes.error) {
    console.error(
      "Erro ao carregar sessões:",
      resultadoSessoes.error
    );

    estado.sessoes = [];
  } else {
    estado.sessoes =
      resultadoSessoes.data || [];
  }
}

function desenharInsights() {
  const sessoesFinalizadas =
    estado.sessoes.filter(
      sessao =>
        sessao.id !==
        estado.sessaoAtualId
    );

  const tempoRegistrado =
    sessoesFinalizadas.reduce(
      function (
        total,
        sessao
      ) {
        return (
          total +
          Number(
            sessao.duracao_segundos ||
            0
          )
        );
      },
      0
    );

  const tempoAtual =
    estado.cronometroAtivo
      ? estado.segundosSessao
      : 0;

  elementos.tempoTotalEstudado
    .textContent =
      transformarSegundosEmTexto(
        tempoRegistrado +
        tempoAtual
      );

  elementos.totalCardsCriados
    .textContent =
      estado.artigos.length;

  elementos.totalCardsEstudados
    .textContent =
      estado.historico.length;

  elementos.totalRevisoesPendentes
    .textContent =
      artigosDisponiveisParaRevisao()
        .length;

  const dias =
    obterUltimosSeteDias();

  const cardsCriados =
    contarPorDia(
      estado.artigos,
      "criado_em",
      dias
    );

  const cardsEstudados =
    contarPorDia(
      estado.historico,
      "estudado_em",
      dias
    );

  desenharGrafico(
    elementos.graficoCardsCriados,
    dias,
    cardsCriados,
    false
  );

  desenharGrafico(
    elementos.graficoCardsEstudados,
    dias,
    cardsEstudados,
    true
  );

  desenharLinhaTempo();
}

function obterUltimosSeteDias() {
  const dias = [];

  for (
    let diferenca = 6;
    diferenca >= 0;
    diferenca--
  ) {
    const data =
      new Date();

    data.setHours(
      0,
      0,
      0,
      0
    );

    data.setDate(
      data.getDate() -
      diferenca
    );

    dias.push(data);
  }

  return dias;
}

function contarPorDia(
  lista,
  campoData,
  dias
) {
  const contagem = {};

  dias.forEach(
    function (dia) {
      contagem[
        chaveLocalData(dia)
      ] = 0;
    }
  );

  lista.forEach(
    function (item) {
      if (!item[campoData]) {
        return;
      }

      const chave =
        chaveLocalData(
          new Date(
            item[campoData]
          )
        );

      if (
        Object.hasOwn(
          contagem,
          chave
        )
      ) {
        contagem[chave] += 1;
      }
    }
  );

  return contagem;
}

function desenharGrafico(
  container,
  dias,
  contagem,
  estudados
) {
  container.replaceChildren();

  container.classList.toggle(
    "grafico-estudados",
    estudados
  );

  const valores =
    Object.values(contagem);

  const maiorValor =
    Math.max(
      1,
      ...valores
    );

  dias.forEach(
    function (dia) {
      const chave =
        chaveLocalData(dia);

      const valor =
        contagem[chave] || 0;

      const coluna =
        document.createElement(
          "div"
        );

      coluna.className =
        "coluna-grafico";

      const numero =
        document.createElement(
          "span"
        );

      numero.className =
        "valor-barra";

      numero.textContent =
        valor;

      const barra =
        document.createElement(
          "div"
        );

      barra.className =
        "barra-grafico";

      const altura =
        valor === 0
          ? 5
          : Math.max(
              16,
              (
                valor /
                maiorValor
              ) * 145
            );

      barra.style.height =
        altura + "px";

      const rotulo =
        document.createElement(
          "span"
        );

      rotulo.className =
        "rotulo-barra";

      rotulo.textContent =
        dia
          .toLocaleDateString(
            "pt-BR",
            {
              weekday: "short"
            }
          )
          .replace(".", "");

      coluna.append(
        numero,
        barra,
        rotulo
      );

      container.appendChild(
        coluna
      );
    }
  );
}

function desenharLinhaTempo() {
  elementos.linhaTempoEstudos
    .replaceChildren();

  const eventos =
    estado.historico.slice(
      0,
      20
    );

  if (eventos.length === 0) {
    const vazio =
      document.createElement("p");

    vazio.className =
      "linha-tempo-vazia";

    vazio.textContent =
      "Nenhum estudo registrado até o momento.";

    elementos.linhaTempoEstudos
      .appendChild(vazio);

    return;
  }

  eventos.forEach(
    function (evento) {
      const artigo =
        estado.artigos.find(
          item =>
            item.id ===
            evento.artigo_id
        );

      const caixa =
        document.createElement(
          "article"
        );

      caixa.className =
        "evento-linha-tempo";

      if (
        evento.tipo ===
        "revisao"
      ) {
        caixa.classList.add(
          "revisao"
        );
      }

      const ponto =
        document.createElement(
          "span"
        );

      ponto.className =
        "ponto-linha-tempo";

      const conteudo =
        document.createElement(
          "div"
        );

      conteudo.className =
        "conteudo-evento";

      const titulo =
        document.createElement(
          "strong"
        );

      titulo.textContent =
        evento.tipo === "revisao"
          ? "Revisão de " +
            evento.etapa_revisao +
            " dias concluída"
          : "Card estudado";

      const descricao =
        document.createElement(
          "p"
        );

      descricao.textContent =
        artigo
          ? artigo.numero_artigo +
            " - " +
            artigo.titulo
          : "Card removido ou indisponível";

      const data =
        document.createElement(
          "time"
        );

      data.textContent =
        formatarDataHora(
          evento.estudado_em
        );

      conteudo.append(
        titulo,
        descricao,
        data
      );

      caixa.append(
        ponto,
        conteudo
      );

      elementos.linhaTempoEstudos
        .appendChild(
          caixa
        );
    }
  );
}

function chaveLocalData(data) {
  const ano =
    data.getFullYear();

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      data.getDate()
    ).padStart(2, "0");

  return (
    ano +
    "-" +
    mes +
    "-" +
    dia
  );
}

function abrirGerenciador(
  aba = "estrutura"
) {
  fecharMenuCelular();

  trocarAbaGerenciamento(aba);
  preencherSeletoresEstrutura();
  desenharEstruturaCadastrada();
  desenharListaGerenciamento();

  elementos.janelaGerenciar
    .showModal();
}

function fecharDialogoAoClicarFora(
  evento
) {
  if (
    evento.target !==
    elementos.janelaGerenciar
  ) {
    return;
  }

  const area =
    elementos.janelaGerenciar
      .getBoundingClientRect();

  const clicouDentro =
    evento.clientX >= area.left &&
    evento.clientX <= area.right &&
    evento.clientY >= area.top &&
    evento.clientY <= area.bottom;

  if (!clicouDentro) {
    elementos.janelaGerenciar
      .close();
  }
}

async function salvarArtigo(
  evento
) {
  evento.preventDefault();

  elementos.botaoSalvarArtigo.disabled =
    true;

  elementos.botaoSalvarArtigo.textContent =
    "Salvando...";

  elementos.mensagemFormulario.textContent =
    "";

  const materiaId =
    elementos.campoMateria.value;

  const assuntoId =
    elementos.campoAssunto.value;

  const topicoId =
    elementos.campoTopico.value;

  const materia =
    estado.materias.find(
      item =>
        item.id ===
        materiaId
    );

  const assunto =
    estado.assuntos.find(
      item =>
        item.id ===
        assuntoId
    );

  const topico =
    estado.topicos.find(
      item =>
        item.id ===
        topicoId
    );

  if (
    !materia ||
    !assunto ||
    !topico
  ) {
    elementos.botaoSalvarArtigo.disabled =
      false;

    elementos.botaoSalvarArtigo.textContent =
      "Salvar card";

    elementos.mensagemFormulario.textContent =
      "Selecione a matéria, o assunto e o tópico.";

    return;
  }

  const dadosArtigo = {
    materia_id:
      materia.id,

    assunto_id:
      assunto.id,

    topico_id:
      topico.id,

    materia:
      materia.nome,

    assunto:
      assunto.nome,

    numero_artigo:
      elementos.campoNumero
        .value.trim(),

    titulo:
      elementos.campoTitulo
        .value.trim(),

    texto_lei:
      elementos.campoTextoLei
        .value.trim(),

    explicacao:
      elementos.campoExplicacao
        .value.trim(),

    pena:
      elementos.campoPena
        .value.trim(),

    multa:
      elementos.campoMulta
        .value.trim(),

    ordem:
      Number(
        elementos.campoOrdem.value
      ) || 0,

    ativo: true
  };

  try {
    let idArtigoSalvo =
      estado.artigoSendoEditado;

    let resultado;

    if (
      estado.artigoSendoEditado
    ) {
      resultado =
        await supabaseCliente
          .from("artigos")
          .update(
            dadosArtigo
          )
          .eq(
            "id",
            estado.artigoSendoEditado
          )
          .select()
          .single();
    } else {
      resultado =
        await supabaseCliente
          .from("artigos")
          .insert({
            ...dadosArtigo,
            usuario_id:
              estado.usuario.id
          })
          .select()
          .single();
    }

    if (resultado.error) {
      throw resultado.error;
    }

    idArtigoSalvo =
      resultado.data.id;

    mostrarAviso(
      estado.artigoSendoEditado
        ? "Card atualizado com sucesso."
        : "Card criado. A primeira revisão será em 7 dias."
    );

    limparFormulario();

    await carregarArtigos(
      idArtigoSalvo
    );

    await carregarDadosAnaliticos();
  } catch (erro) {
    console.error(
      "Erro ao salvar card:",
      erro
    );

    elementos.mensagemFormulario
      .textContent =
        "Não foi possível salvar: " +
        erro.message;
  } finally {
    elementos.botaoSalvarArtigo.disabled =
      false;

    elementos.botaoSalvarArtigo.textContent =
      estado.artigoSendoEditado
        ? "Atualizar card"
        : "Salvar card";
  }
}

function editarArtigo(id) {
  const artigo =
    estado.artigos.find(
      item =>
        item.id === id
    );

  if (!artigo) {
    return;
  }

  estado.artigoSendoEditado =
    id;

  elementos.idArtigo.value =
    id;

  elementos.campoMateria.value =
    artigo.materia_id || "";

  preencherAssuntosDoCard(
    artigo.assunto_id || "",
    artigo.topico_id || ""
  );

  elementos.campoNumero.value =
    artigo.numero_artigo;

  elementos.campoTitulo.value =
    artigo.titulo;

  elementos.campoTextoLei.value =
    artigo.texto_lei;

  elementos.campoExplicacao.value =
    artigo.explicacao || "";

  elementos.campoPena.value =
    artigo.pena || "";

  elementos.campoMulta.value =
    artigo.multa || "";

  elementos.campoOrdem.value =
    artigo.ordem || 0;

  elementos.tituloFormulario.textContent =
    "Editar card";

  elementos.botaoSalvarArtigo.textContent =
    "Atualizar card";

  elementos.botaoCancelarEdicao.hidden =
    false;

  trocarAbaGerenciamento(
    "cards"
  );

  elementos.campoMateria.focus();
}

async function excluirArtigo(id) {
  const artigo =
    estado.artigos.find(
      item =>
        item.id === id
    );

  if (!artigo) {
    return;
  }

  const confirmou =
    window.confirm(
      "Excluir “" +
      artigo.numero_artigo +
      " - " +
      artigo.titulo +
      "”?"
    );

  if (!confirmou) {
    return;
  }

  const { error } =
    await supabaseCliente
      .from("artigos")
      .delete()
      .eq("id", id);

  if (error) {
    mostrarAviso(
      "Não foi possível excluir: " +
      error.message,
      true
    );

    return;
  }

  if (
    estado.artigoSendoEditado === id
  ) {
    limparFormulario();
  }

  mostrarAviso(
    "Card excluído."
  );

  await carregarArtigos();
  await carregarDadosAnaliticos();
}

function desenharListaGerenciamento() {
  elementos.listaArtigosSalvos
    .replaceChildren();

  elementos.quantidadeSalva.textContent =
    estado.artigos.length;

  if (
    estado.artigos.length === 0
  ) {
    const vazio =
      document.createElement("p");

    vazio.className =
      "lista-vazia";

    vazio.textContent =
      "Nenhum card cadastrado.";

    elementos.listaArtigosSalvos
      .appendChild(vazio);

    return;
  }

  estado.artigos.forEach(
    function (artigo) {
      const caixa =
        document.createElement(
          "article"
        );

      caixa.className =
        "artigo-salvo";

      const local =
        document.createElement(
          "small"
        );

      local.textContent =
        artigo.materia +
        " › " +
        artigo.assunto +
        " › " +
        artigo.topico;

      const titulo =
        document.createElement(
          "strong"
        );

      titulo.textContent =
        artigo.numero_artigo +
        " - " +
        artigo.titulo;

      const data =
        document.createElement(
          "span"
        );

      data.className =
        "data-criacao";

      data.textContent =
        "Criado em " +
        formatarDataHora(
          artigo.criado_em
        );

      const acoes =
        document.createElement(
          "div"
        );

      acoes.className =
        "acoes-artigo";

      const botaoEditar =
        document.createElement(
          "button"
        );

      botaoEditar.type =
        "button";

      botaoEditar.textContent =
        "Editar";

      botaoEditar.addEventListener(
        "click",
        function () {
          editarArtigo(
            artigo.id
          );
        }
      );

      const botaoExcluir =
        document.createElement(
          "button"
        );

      botaoExcluir.type =
        "button";

      botaoExcluir.className =
        "excluir";

      botaoExcluir.textContent =
        "Excluir";

      botaoExcluir.addEventListener(
        "click",
        function () {
          excluirArtigo(
            artigo.id
          );
        }
      );

      acoes.append(
        botaoEditar,
        botaoExcluir
      );

      caixa.append(
        local,
        titulo,
        data,
        acoes
      );

      elementos.listaArtigosSalvos
        .appendChild(
          caixa
        );
    }
  );
}

function limparFormulario() {
  estado.artigoSendoEditado =
    null;

  elementos.formularioArtigo
    .reset();

  elementos.idArtigo.value =
    "";

  elementos.campoOrdem.value =
    0;

  elementos.tituloFormulario.textContent =
    "Novo card";

  elementos.botaoSalvarArtigo.textContent =
    "Salvar card";

  elementos.botaoCancelarEdicao.hidden =
    true;

  elementos.mensagemFormulario.textContent =
    "";

  preencherAssuntosDoCard();
}

function formatarData(data) {
  if (!data) {
    return "Não definida";
  }

  return new Date(
    data
  ).toLocaleDateString(
    "pt-BR"
  );
}

function formatarDataHora(data) {
  if (!data) {
    return "Não definida";
  }

  return new Date(
    data
  ).toLocaleString(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );
}

let tempoAviso;

function mostrarAviso(
  mensagem,
  mensagemDeErro = false
) {
  clearTimeout(
    tempoAviso
  );

  elementos.aviso.textContent =
    mensagem;

  elementos.aviso.className =
    mensagemDeErro
      ? "aviso mostrar erro"
      : "aviso mostrar";

  tempoAviso =
    setTimeout(
      function () {
        elementos.aviso
          .classList.remove(
            "mostrar"
          );
      },
      4000
    );
}
