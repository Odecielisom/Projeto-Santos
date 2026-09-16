"use strict";

/* =========================================================
   CONFIGURAÇÃO DO SUPABASE
   ========================================================= */

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

/* =========================================================
   ESTADO DO SISTEMA
   ========================================================= */

const estado = {
  usuario: null,
  artigos: [],
  artigosFiltrados: [],
  historico: [],
  sessoes: [],
  artigoAtual: 0,
  artigoSendoEditado: null,
  telaAtual: "lei-seca",
  cronometroAtivo: false,
  inicioSessao: null,
  sessaoAtualId: null,
  segundosSessao: 0,
  intervaloCronometro: null,
  intervaloPersistencia: null
};

/* =========================================================
   ELEMENTOS DA TELA
   ========================================================= */

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
  "formularioArtigo",
  "idArtigo",
  "campoMateria",
  "campoAssunto",
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

/* =========================================================
   INÍCIO DO SISTEMA
   ========================================================= */

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

  await carregarArtigos();
  await carregarDadosAnaliticos();

  atualizarQuantidadeRevisoes();
  desenharTudo();

  if (elementos.controleCronometro.checked) {
    await iniciarCronometro();
  } else {
    atualizarSituacaoCronometro(false);
  }
}

function guardarElementos() {
  idsElementos.forEach(function (id) {
    elementos[id] =
      document.getElementById(id);
  });
}

/* =========================================================
   EVENTOS DOS BOTÕES
   ========================================================= */

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
    abrirGerenciador
  );

  elementos.botaoCriarPrimeiro.addEventListener(
    "click",
    abrirGerenciador
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
        await pausarCronometro();
      }
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

/* =========================================================
   NAVEGAÇÃO ENTRE TELAS
   ========================================================= */

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

/* =========================================================
   MENU SANFONA
   ========================================================= */

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

/* =========================================================
   USUÁRIO
   ========================================================= */

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

/* =========================================================
   CRONÔMETRO E SESSÕES DE ESTUDO
   ========================================================= */

async function iniciarCronometro() {
  if (estado.cronometroAtivo) {
    return;
  }

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
  if (!estado.cronometroAtivo) {
    atualizarSituacaoCronometro(false);
    return;
  }

  await finalizarSessaoCronometro();
  atualizarSituacaoCronometro(false);
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
      : "Pausado";

  situacao.classList.toggle(
    "pausado",
    !ativo
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
    await finalizarSessaoCronometro();
  }

  estado.segundosSessao = 0;

  atualizarTextoCronometro();

  elementos.controleCronometro.checked =
    true;

  estado.artigoAtual = 0;

  elementos.campoPesquisa.value = "";

  estado.artigosFiltrados = [
    ...estado.artigos
  ];

  desenharMenuArtigos();
  mostrarArtigoAtual();

  await iniciarCronometro();

  mostrarAviso(
    "Novo estudo iniciado."
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

/* =========================================================
   CARREGAMENTO DOS ARTIGOS
   ========================================================= */

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
      data || [];

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

/* =========================================================
   MENU DE ARTIGOS
   ========================================================= */

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

          grupos[materia][assunto]
            .forEach(
              function (artigo) {
                const posicao =
                  estado.artigosFiltrados
                    .findIndex(
                      function (item) {
                        return (
                          item.id ===
                          artigo.id
                        );
                      }
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

                conteudoAssunto
                  .appendChild(botao);
              }
            );

          tituloAssunto
            .addEventListener(
              "click",
              function () {
                alternarGrupo(
                  tituloAssunto,
                  conteudoAssunto
                );
              }
            );

          conteudoMateria
            .appendChild(
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
        ] = [];
      }

      grupos[artigo.materia][
        artigo.assunto
      ].push(artigo);
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

/* =========================================================
   EXIBIÇÃO DO ARTIGO
   ========================================================= */

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
    artigo.assunto;

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

/* =========================================================
   REGISTRO DE ESTUDO
   ========================================================= */

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

/* =========================================================
   TELA DE REVISÕES
   ========================================================= */

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
      function (artigo) {
        return (
          artigo.etapa_revisao === 7
        );
      }
    ),

    15: disponiveis.filter(
      function (artigo) {
        return (
          artigo.etapa_revisao === 15
        );
      }
    ),

    30: disponiveis.filter(
      function (artigo) {
        return (
          artigo.etapa_revisao === 30
        );
      }
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

  elementos.totalBloco7
    .textContent =
      textoQuantidadeCards(
        grupos[7].length
      );

  elementos.totalBloco15
    .textContent =
      textoQuantidadeCards(
        grupos[15].length
      );

  elementos.totalBloco30
    .textContent =
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
        artigo.assunto;

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
        function (artigo) {
          return (
            artigo.id ===
            idArtigo
          );
        }
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

/* =========================================================
   DADOS DOS INSIGHTS
   ========================================================= */

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
      function (sessao) {
        return (
          sessao.id !==
          estado.sessaoAtualId
        );
      }
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

/* =========================================================
   LINHA DO TEMPO
   ========================================================= */

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
          function (item) {
            return (
              item.id ===
              evento.artigo_id
            );
          }
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
        .appendChild(caixa);
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

/* =========================================================
   GERENCIAMENTO DE CONTEÚDO
   ========================================================= */

function abrirGerenciador() {
  fecharMenuCelular();

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

  const dadosArtigo = {
    materia:
      elementos.campoMateria
        .value.trim(),

    assunto:
      elementos.campoAssunto
        .value.trim(),

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
        ? "Artigo atualizado com sucesso."
        : "Artigo criado. A primeira revisão será em 7 dias."
    );

    limparFormulario();

    await carregarArtigos(
      idArtigoSalvo
    );

    await carregarDadosAnaliticos();
  } catch (erro) {
    console.error(
      "Erro ao salvar artigo:",
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
        ? "Atualizar artigo"
        : "Salvar artigo";
  }
}

function editarArtigo(id) {
  const artigo =
    estado.artigos.find(
      function (item) {
        return item.id === id;
      }
    );

  if (!artigo) {
    return;
  }

  estado.artigoSendoEditado =
    id;

  elementos.idArtigo.value =
    id;

  elementos.campoMateria.value =
    artigo.materia;

  elementos.campoAssunto.value =
    artigo.assunto;

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
    "Editar artigo";

  elementos.botaoSalvarArtigo.textContent =
    "Atualizar artigo";

  elementos.botaoCancelarEdicao.hidden =
    false;

  elementos.campoMateria.focus();
}

async function excluirArtigo(id) {
  const artigo =
    estado.artigos.find(
      function (item) {
        return item.id === id;
      }
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
    "Artigo excluído."
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
      "Nenhum artigo cadastrado.";

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
        artigo.assunto;

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
        .appendChild(caixa);
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
    "Novo artigo";

  elementos.botaoSalvarArtigo.textContent =
    "Salvar artigo";

  elementos.botaoCancelarEdicao.hidden =
    true;

  elementos.mensagemFormulario.textContent =
    "";
}

/* =========================================================
   DATAS
   ========================================================= */

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

/* =========================================================
   AVISOS
   ========================================================= */

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
