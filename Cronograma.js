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
   ESTADO DO CRONOGRAMA
   ========================================================= */

const estado = {
  usuario: null,
  projetos: [],
  materias: [],
  itens: [],
  sessoes: [],
  projetoAtualId: null,
  projetoSendoEditado: null,
  abaAtual: "dashboard",
  cronometroAtivo: false,
  sessaoAtualId: null,
  materiaCronometroId: null,
  inicioCronometro: null,
  segundosCronometro: 0,
  intervaloCronometro: null,
  intervaloPersistencia: null
};

/* =========================================================
   ELEMENTOS DA TELA
   ========================================================= */

const elementos = {};

const idsElementos = [
  "fundoMenuCronograma",
  "menuCronograma",
  "botaoRecolherCronograma",
  "areaCronograma",
  "botaoAbrirMenuCronograma",
  "letraUsuarioCronograma",
  "nomeUsuarioCronograma",
  "emailUsuarioCronograma",
  "botaoSairCronograma",
  "selectProjetoTopo",
  "abaDashboardCronograma",
  "abaGerenciamentoCronograma",
  "painelDashboardCronograma",
  "painelGerenciamentoCronograma",
  "dashboardSemProjeto",
  "dashboardComProjeto",
  "botaoCriarPrimeiroProjeto",
  "tituloProjetoDashboard",
  "detalhesProjetoDashboard",
  "diasAteProva",
  "tempoTotalProjeto",
  "tempoHojeProjeto",
  "percentualEdital",
  "itensConcluidos",
  "situacaoCronometroProjeto",
  "selectMateriaCronometro",
  "cronometroProjeto",
  "botaoIniciarCronometroProjeto",
  "botaoPararCronometroProjeto",
  "dataPlanoHoje",
  "listaPlanoHoje",
  "progressoMaterias",
  "sessoesRecentes",
  "botaoNovoProjeto",
  "formularioProjetoCaixa",
  "tituloFormularioProjeto",
  "botaoFecharFormularioProjeto",
  "formularioProjeto",
  "idProjetoEdicao",
  "campoNomeProjeto",
  "campoOrgaoProjeto",
  "campoCargoProjeto",
  "campoDataProvaProjeto",
  "botaoCancelarProjeto",
  "botaoSalvarProjeto",
  "mensagemProjeto",
  "listaProjetos",
  "editorEdital",
  "nomeProjetoEditor",
  "resumoProjetoEditor",
  "botaoEditarProjeto",
  "botaoExcluirProjeto",
  "formularioMateriaCronograma",
  "campoNomeMateriaCronograma",
  "campoMetaMateriaCronograma",
  "campoCorMateriaCronograma",
  "mensagemMateriaCronograma",
  "listaMateriasEdital",
  "avisoCronograma"
];

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  iniciarCronograma
);

async function iniciarCronograma() {
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

  mostrarUsuario(
    data.session.user
  );

  await carregarDadosCronograma();

  /*
    O cronômetro sempre inicia parado.
    Ele só começa depois do clique do usuário.
  */

  estado.cronometroAtivo = false;
  estado.segundosCronometro = 0;

  atualizarCronometroNaTela();
  atualizarEstadoCronometro(false);
}

function guardarElementos() {
  idsElementos.forEach(
    function (id) {
      elementos[id] =
        document.getElementById(id);
    }
  );
}

/* =========================================================
   EVENTOS
   ========================================================= */

function configurarEventos() {
  elementos.botaoAbrirMenuCronograma
    .addEventListener(
      "click",
      abrirMenuCelular
    );

  elementos.fundoMenuCronograma
    .addEventListener(
      "click",
      fecharMenuCelular
    );

  elementos.botaoRecolherCronograma
    .addEventListener(
      "click",
      alternarMenuLateral
    );

  elementos.botaoSairCronograma
    .addEventListener(
      "click",
      sairDoSistema
    );

  elementos.abaDashboardCronograma
    .addEventListener(
      "click",
      function () {
        trocarAba(
          "dashboard"
        );
      }
    );

  elementos.abaGerenciamentoCronograma
    .addEventListener(
      "click",
      function () {
        trocarAba(
          "gerenciamento"
        );
      }
    );

  elementos.botaoCriarPrimeiroProjeto
    .addEventListener(
      "click",
      function () {
        trocarAba(
          "gerenciamento"
        );

        abrirFormularioProjeto();
      }
    );

  elementos.botaoNovoProjeto
    .addEventListener(
      "click",
      function () {
        abrirFormularioProjeto();
      }
    );

  elementos.botaoFecharFormularioProjeto
    .addEventListener(
      "click",
      fecharFormularioProjeto
    );

  elementos.botaoCancelarProjeto
    .addEventListener(
      "click",
      fecharFormularioProjeto
    );

  elementos.formularioProjeto
    .addEventListener(
      "submit",
      salvarProjeto
    );

  elementos.selectProjetoTopo
    .addEventListener(
      "change",
      function () {
        if (
          estado.cronometroAtivo
        ) {
          elementos.selectProjetoTopo
            .value =
              estado.projetoAtualId ||
              "";

          mostrarAviso(
            "Pare o cronômetro antes de trocar de projeto.",
            true
          );

          return;
        }

        selecionarProjeto(
          elementos
            .selectProjetoTopo
            .value
        );
      }
    );

  elementos.listaProjetos
    .addEventListener(
      "click",
      function (evento) {
        const botao =
          evento.target.closest(
            "[data-projeto-id]"
          );

        if (!botao) {
          return;
        }

        selecionarProjeto(
          botao.dataset.projetoId
        );
      }
    );

  elementos.botaoEditarProjeto
    .addEventListener(
      "click",
      editarProjetoAtual
    );

  elementos.botaoExcluirProjeto
    .addEventListener(
      "click",
      excluirProjetoAtual
    );

  elementos.formularioMateriaCronograma
    .addEventListener(
      "submit",
      salvarMateriaCronograma
    );

  elementos.listaMateriasEdital
    .addEventListener(
      "submit",
      tratarFormularioItemEdital
    );

  elementos.listaMateriasEdital
    .addEventListener(
      "change",
      tratarMudancaItemEdital
    );

  elementos.listaMateriasEdital
    .addEventListener(
      "click",
      tratarCliqueEditorEdital
    );

  elementos.botaoIniciarCronometroProjeto
    .addEventListener(
      "click",
      iniciarCronometroProjeto
    );

  elementos.botaoPararCronometroProjeto
    .addEventListener(
      "click",
      pararCronometroProjeto
    );

  /*
    Guarda uma cópia do tempo quando
    a página for colocada em segundo plano.
  */

  document.addEventListener(
    "visibilitychange",
    function () {
      if (
        document.visibilityState ===
          "hidden" &&
        estado.cronometroAtivo
      ) {
        persistirSessaoAtual(
          false
        );
      }
    }
  );
}

/* =========================================================
   USUÁRIO
   ========================================================= */

function mostrarUsuario(usuario) {
  const email =
    usuario.email ||
    "Usuário";

  const nome =
    usuario.user_metadata?.name ||
    email.split("@")[0];

  elementos.nomeUsuarioCronograma
    .textContent =
      nome;

  elementos.emailUsuarioCronograma
    .textContent =
      email;

  elementos.letraUsuarioCronograma
    .textContent =
      nome
        .charAt(0)
        .toUpperCase();
}

async function sairDoSistema() {
  if (
    estado.cronometroAtivo
  ) {
    await pararCronometroProjeto(
      false
    );
  }

  await supabaseCliente
    .auth
    .signOut();

  window.location.replace(
    "index.html"
  );
}

/* =========================================================
   MENU LATERAL
   ========================================================= */

function alternarMenuLateral() {
  const recolhido =
    elementos.menuCronograma
      .classList
      .toggle(
        "recolhido"
      );

  elementos.areaCronograma
    .classList
    .toggle(
      "menu-recolhido",
      recolhido
    );

  elementos.botaoRecolherCronograma
    .textContent =
      recolhido
        ? "›"
        : "‹";

  localStorage.setItem(
    "projeto-santos-cronograma-menu-recolhido",
    String(recolhido)
  );
}

function restaurarEstadoMenu() {
  const recolhido =
    localStorage.getItem(
      "projeto-santos-cronograma-menu-recolhido"
    ) === "true";

  elementos.menuCronograma
    .classList
    .toggle(
      "recolhido",
      recolhido
    );

  elementos.areaCronograma
    .classList
    .toggle(
      "menu-recolhido",
      recolhido
    );

  elementos.botaoRecolherCronograma
    .textContent =
      recolhido
        ? "›"
        : "‹";
}

function abrirMenuCelular() {
  elementos.menuCronograma
    .classList
    .add(
      "aberto"
    );

  elementos.fundoMenuCronograma
    .classList
    .add(
      "visivel"
    );
}

function fecharMenuCelular() {
  elementos.menuCronograma
    .classList
    .remove(
      "aberto"
    );

  elementos.fundoMenuCronograma
    .classList
    .remove(
      "visivel"
    );
}

/* =========================================================
   ABAS
   ========================================================= */

function trocarAba(aba) {
  estado.abaAtual = aba;

  const dashboard =
    aba === "dashboard";

  elementos.painelDashboardCronograma
    .hidden =
      !dashboard;

  elementos.painelGerenciamentoCronograma
    .hidden =
      dashboard;

  elementos.abaDashboardCronograma
    .classList
    .toggle(
      "ativa",
      dashboard
    );

  elementos.abaGerenciamentoCronograma
    .classList
    .toggle(
      "ativa",
      !dashboard
    );

  fecharMenuCelular();
}

/* =========================================================
   CARREGAMENTO DOS DADOS
   ========================================================= */

async function carregarDadosCronograma() {
  const [
    resultadoProjetos,
    resultadoMaterias,
    resultadoItens,
    resultadoSessoes
  ] =
    await Promise.all([
      supabaseCliente
        .from(
          "cronograma_projetos"
        )
        .select("*")
        .order(
          "criado_em",
          {
            ascending: true
          }
        ),

      supabaseCliente
        .from(
          "cronograma_materias"
        )
        .select("*")
        .order(
          "ordem",
          {
            ascending: true
          }
        )
        .order(
          "nome",
          {
            ascending: true
          }
        ),

      supabaseCliente
        .from(
          "cronograma_itens_edital"
        )
        .select("*")
        .order(
          "ordem",
          {
            ascending: true
          }
        )
        .order(
          "criado_em",
          {
            ascending: true
          }
        ),

      supabaseCliente
        .from(
          "cronograma_sessoes"
        )
        .select("*")
        .order(
          "iniciado_em",
          {
            ascending: false
          }
        )
    ]);

  const erros = [
    resultadoProjetos.error,
    resultadoMaterias.error,
    resultadoItens.error,
    resultadoSessoes.error
  ].filter(Boolean);

  if (
    erros.length > 0
  ) {
    console.error(
      "Erro ao carregar o Cronograma:",
      erros
    );

    mostrarAviso(
      "Não foi possível carregar o Cronograma. Confira se o SQL foi executado no Supabase.",
      true
    );
  }

  estado.projetos =
    resultadoProjetos.data ||
    [];

  estado.materias =
    resultadoMaterias.data ||
    [];

  estado.itens =
    resultadoItens.data ||
    [];

  estado.sessoes =
    resultadoSessoes.data ||
    [];

  ajustarProjetoAtual();
  desenharTudo();
}

function ajustarProjetoAtual() {
  const projetoSalvo =
    localStorage.getItem(
      "projeto-santos-cronograma-projeto-atual"
    );

  const projetoAtualExiste =
    estado.projetos.some(
      function (projeto) {
        return (
          projeto.id ===
          estado.projetoAtualId
        );
      }
    );

  const projetoSalvoExiste =
    estado.projetos.some(
      function (projeto) {
        return (
          projeto.id ===
          projetoSalvo
        );
      }
    );

  if (
    projetoAtualExiste
  ) {
    return;
  }

  estado.projetoAtualId =
    projetoSalvoExiste
      ? projetoSalvo
      : estado.projetos[0]
          ?.id || null;
}

function selecionarProjeto(
  projetoId
) {
  if (
    estado.cronometroAtivo &&
    projetoId !==
      estado.projetoAtualId
  ) {
    mostrarAviso(
      "Pare o cronômetro antes de trocar de projeto.",
      true
    );

    desenharSeletorProjetos();

    return;
  }

  const existe =
    estado.projetos.some(
      function (projeto) {
        return (
          projeto.id ===
          projetoId
        );
      }
    );

  estado.projetoAtualId =
    existe
      ? projetoId
      : null;

  if (
    estado.projetoAtualId
  ) {
    localStorage.setItem(
      "projeto-santos-cronograma-projeto-atual",
      estado.projetoAtualId
    );
  } else {
    localStorage.removeItem(
      "projeto-santos-cronograma-projeto-atual"
    );
  }

  desenharTudo();
}

/* =========================================================
   DESENHO GERAL
   ========================================================= */

function desenharTudo() {
  desenharSeletorProjetos();
  desenharDashboard();
  desenharGerenciamento();
}

function desenharSeletorProjetos() {
  elementos.selectProjetoTopo
    .replaceChildren();

  if (
    estado.projetos.length ===
    0
  ) {
    const opcao =
      document.createElement(
        "option"
      );

    opcao.value = "";

    opcao.textContent =
      "Nenhum projeto criado";

    elementos.selectProjetoTopo
      .appendChild(
        opcao
      );

    elementos.selectProjetoTopo
      .disabled =
        true;

    return;
  }

  estado.projetos.forEach(
    function (projeto) {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        projeto.id;

      opcao.textContent =
        projeto.nome;

      elementos.selectProjetoTopo
        .appendChild(
          opcao
        );
    }
  );

  elementos.selectProjetoTopo
    .disabled =
      estado.cronometroAtivo;

  elementos.selectProjetoTopo
    .value =
      estado.projetoAtualId ||
      "";
}

/* =========================================================
   FUNÇÕES DE CONSULTA DO ESTADO
   ========================================================= */

function obterProjetoAtual() {
  return (
    estado.projetos.find(
      function (projeto) {
        return (
          projeto.id ===
          estado.projetoAtualId
        );
      }
    ) || null
  );
}

function obterMateriasProjeto() {
  return estado.materias.filter(
    function (materia) {
      return (
        materia.projeto_id ===
        estado.projetoAtualId
      );
    }
  );
}

function obterItensMateria(
  materiaId
) {
  return estado.itens.filter(
    function (item) {
      return (
        item.materia_id ===
        materiaId
      );
    }
  );
}

function obterSessoesProjeto() {
  return estado.sessoes.filter(
    function (sessao) {
      return (
        sessao.projeto_id ===
        estado.projetoAtualId
      );
    }
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function desenharDashboard() {
  const projeto =
    obterProjetoAtual();

  elementos.dashboardSemProjeto
    .hidden =
      Boolean(projeto);

  elementos.dashboardComProjeto
    .hidden =
      !projeto;

  if (!projeto) {
    return;
  }

  const materias =
    obterMateriasProjeto();

  const itens =
    materias.flatMap(
      function (materia) {
        return obterItensMateria(
          materia.id
        );
      }
    );

  const concluidos =
    itens.filter(
      function (item) {
        return item.concluido;
      }
    ).length;

  const percentual =
    itens.length
      ? Math.round(
          (
            concluidos /
            itens.length
          ) * 100
        )
      : 0;

  const sessoes =
    obterSessoesProjeto();

  const tempoTotal =
    sessoes.reduce(
      function (
        total,
        sessao
      ) {
        return (
          total +
          Number(
            sessao
              .duracao_segundos ||
              0
          )
        );
      },
      0
    );

  const tempoHoje =
    sessoes
      .filter(
        function (sessao) {
          return ehHoje(
            sessao.iniciado_em
          );
        }
      )
      .reduce(
        function (
          total,
          sessao
        ) {
          return (
            total +
            Number(
              sessao
                .duracao_segundos ||
                0
            )
          );
        },
        0
      );

  elementos.tituloProjetoDashboard
    .textContent =
      projeto.nome;

  elementos.detalhesProjetoDashboard
    .textContent =
      montarResumoProjeto(
        projeto
      );

  elementos.tempoTotalProjeto
    .textContent =
      transformarSegundosEmTexto(
        tempoTotal
      );

  elementos.tempoHojeProjeto
    .textContent =
      transformarSegundosEmTexto(
        tempoHoje
      );

  elementos.percentualEdital
    .textContent =
      percentual + "%";

  elementos.itensConcluidos
    .textContent =
      concluidos +
      " de " +
      itens.length;

  desenharDiasAteProva(
    projeto
  );

  preencherMateriasCronometro(
    materias
  );

  desenharPlanoHoje(
    materias,
    sessoes
  );

  desenharProgressoMaterias(
    materias
  );

  desenharSessoesRecentes(
    sessoes
  );
}

function desenharDiasAteProva(
  projeto
) {
  if (
    !projeto.data_prova
  ) {
    elementos.diasAteProva
      .hidden =
        true;

    return;
  }

  const hoje =
    inicioDoDia(
      new Date()
    );

  const prova =
    dataLocalDeIso(
      projeto.data_prova
    );

  const diferenca =
    Math.ceil(
      (
        prova -
        hoje
      ) /
      86400000
    );

  elementos.diasAteProva
    .hidden =
      false;

  if (
    diferenca > 1
  ) {
    elementos.diasAteProva
      .textContent =
        diferenca +
        " dias até a prova";
  } else if (
    diferenca === 1
  ) {
    elementos.diasAteProva
      .textContent =
        "1 dia até a prova";
  } else if (
    diferenca === 0
  ) {
    elementos.diasAteProva
      .textContent =
        "A prova é hoje";
  } else {
    elementos.diasAteProva
      .textContent =
        "Prova realizada";
  }
}

/* =========================================================
   MATÉRIAS DO CRONÔMETRO
   ========================================================= */

function preencherMateriasCronometro(
  materias
) {
  const valorAtual =
    estado.materiaCronometroId ||
    elementos
      .selectMateriaCronometro
      .value;

  elementos.selectMateriaCronometro
    .replaceChildren();

  const inicial =
    document.createElement(
      "option"
    );

  inicial.value = "";

  inicial.textContent =
    materias.length
      ? "Selecione a matéria"
      : "Cadastre uma matéria no edital";

  elementos.selectMateriaCronometro
    .appendChild(
      inicial
    );

  materias.forEach(
    function (materia) {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        materia.id;

      opcao.textContent =
        materia.nome;

      elementos
        .selectMateriaCronometro
        .appendChild(
          opcao
        );
    }
  );

  if (
    materias.some(
      function (materia) {
        return (
          materia.id ===
          valorAtual
        );
      }
    )
  ) {
    elementos
      .selectMateriaCronometro
      .value =
        valorAtual;
  }

  elementos
    .selectMateriaCronometro
    .disabled =
      estado.cronometroAtivo ||
      materias.length === 0;

  elementos
    .botaoIniciarCronometroProjeto
    .disabled =
      estado.cronometroAtivo ||
      materias.length === 0;
}

/* =========================================================
   PLANO DO DIA
   ========================================================= */

function desenharPlanoHoje(
  materias,
  sessoes
) {
  elementos.dataPlanoHoje
    .textContent =
      new Date()
        .toLocaleDateString(
          "pt-BR",
          {
            weekday:
              "long",
            day:
              "2-digit",
            month:
              "short"
          }
        );

  elementos.listaPlanoHoje
    .replaceChildren();

  const diaAtual =
    new Date().getDay();

  const materiasHoje =
    materias.filter(
      function (materia) {
        return (
          Array.isArray(
            materia.dias_semana
          ) &&
          materia.dias_semana
            .includes(
              diaAtual
            )
        );
      }
    );

  if (
    materiasHoje.length ===
    0
  ) {
    adicionarMensagemVazia(
      elementos.listaPlanoHoje,
      "Nenhuma matéria programada para hoje."
    );

    return;
  }

  materiasHoje.forEach(
    function (materia) {
      const segundosHoje =
        sessoes
          .filter(
            function (sessao) {
              return (
                sessao.materia_id ===
                  materia.id &&
                ehHoje(
                  sessao.iniciado_em
                )
              );
            }
          )
          .reduce(
            function (
              total,
              sessao
            ) {
              return (
                total +
                Number(
                  sessao
                    .duracao_segundos ||
                    0
                )
              );
            },
            0
          );

      const minutosHoje =
        Math.floor(
          segundosHoje /
          60
        );

      const percentual =
        Math.min(
          100,
          Math.round(
            (
              minutosHoje /
              materia.meta_minutos
            ) * 100
          )
        );

      const item =
        document.createElement(
          "article"
        );

      item.className =
        "item-plano";

      item.innerHTML = `
        <div class="nome-com-cor">
          <span
            class="ponto-cor"
            style="background:${corSegura(
              materia.cor
            )}"
          ></span>

          <div>
            <strong>
              ${escaparHtml(
                materia.nome
              )}
            </strong>

            <small>
              ${minutosHoje} de
              ${materia.meta_minutos}
              minutos estudados
            </small>
          </div>
        </div>

        <strong>
          ${percentual}%
        </strong>
      `;

      elementos.listaPlanoHoje
        .appendChild(
          item
        );
    }
  );
}

/* =========================================================
   PROGRESSO DAS MATÉRIAS
   ========================================================= */

function desenharProgressoMaterias(
  materias
) {
  elementos.progressoMaterias
    .replaceChildren();

  if (
    materias.length === 0
  ) {
    adicionarMensagemVazia(
      elementos.progressoMaterias,
      "Adicione matérias ao edital para acompanhar o progresso."
    );

    return;
  }

  materias.forEach(
    function (materia) {
      const itens =
        obterItensMateria(
          materia.id
        );

      const concluidos =
        itens.filter(
          function (item) {
            return (
              item.concluido
            );
          }
        ).length;

      const percentual =
        itens.length
          ? Math.round(
              (
                concluidos /
                itens.length
              ) * 100
            )
          : 0;

      const linha =
        document.createElement(
          "div"
        );

      linha.className =
        "linha-progresso";

      linha.innerHTML = `
        <div class="nome-com-cor">
          <span
            class="ponto-cor"
            style="background:${corSegura(
              materia.cor
            )}"
          ></span>

          <strong>
            ${escaparHtml(
              materia.nome
            )}
          </strong>
        </div>

        <div class="barra-progresso">
          <span
            style="
              width:${percentual}%;
              background:${corSegura(
                materia.cor
              )}
            "
          ></span>
        </div>

        <span>
          ${percentual}%
        </span>
      `;

      elementos
        .progressoMaterias
        .appendChild(
          linha
        );
    }
  );
}

/* =========================================================
   SESSÕES RECENTES
   ========================================================= */

function desenharSessoesRecentes(
  sessoes
) {
  elementos.sessoesRecentes
    .replaceChildren();

  const recentes =
    sessoes.slice(
      0,
      8
    );

  if (
    recentes.length === 0
  ) {
    adicionarMensagemVazia(
      elementos.sessoesRecentes,
      "Nenhuma sessão registrada neste projeto."
    );

    return;
  }

  recentes.forEach(
    function (sessao) {
      const materia =
        estado.materias.find(
          function (item) {
            return (
              item.id ===
              sessao.materia_id
            );
          }
        );

      const item =
        document.createElement(
          "article"
        );

      item.className =
        "item-sessao";

      item.innerHTML = `
        <div class="nome-com-cor">
          <span
            class="ponto-cor"
            style="background:${corSegura(
              materia?.cor
            )}"
          ></span>

          <div>
            <strong>
              ${escaparHtml(
                materia?.nome ||
                "Matéria removida"
              )}
            </strong>

            <small>
              ${formatarDataHora(
                sessao.iniciado_em
              )}
            </small>
          </div>
        </div>

        <strong>
          ${transformarSegundosEmHorario(
            Number(
              sessao
                .duracao_segundos ||
                0
            )
          )}
        </strong>
      `;

      elementos.sessoesRecentes
        .appendChild(
          item
        );
    }
  );
}

/* =========================================================
   GERENCIAMENTO
   ========================================================= */

function desenharGerenciamento() {
  desenharListaProjetos();

  const projeto =
    obterProjetoAtual();

  elementos.editorEdital
    .hidden =
      !projeto;

  if (!projeto) {
    return;
  }

  elementos.nomeProjetoEditor
    .textContent =
      projeto.nome;

  elementos.resumoProjetoEditor
    .textContent =
      montarResumoProjeto(
        projeto
      );

  desenharMateriasEdital();
}

/* =========================================================
   LISTA DE PROJETOS
   ========================================================= */

function desenharListaProjetos() {
  elementos.listaProjetos
    .replaceChildren();

  if (
    estado.projetos.length ===
    0
  ) {
    adicionarMensagemVazia(
      elementos.listaProjetos,
      "Nenhum projeto criado. Clique em “Novo projeto” para começar."
    );

    return;
  }

  estado.projetos.forEach(
    function (projeto) {
      const materias =
        estado.materias.filter(
          function (materia) {
            return (
              materia.projeto_id ===
              projeto.id
            );
          }
        );

      const itens =
        materias.flatMap(
          function (materia) {
            return obterItensMateria(
              materia.id
            );
          }
        );

      const concluidos =
        itens.filter(
          function (item) {
            return (
              item.concluido
            );
          }
        ).length;

      const percentual =
        itens.length
          ? Math.round(
              (
                concluidos /
                itens.length
              ) * 100
            )
          : 0;

      const botao =
        document.createElement(
          "button"
        );

      botao.type =
        "button";

      botao.className =
        "cartao-projeto";

      botao.dataset.projetoId =
        projeto.id;

      if (
        projeto.id ===
        estado.projetoAtualId
      ) {
        botao.classList.add(
          "selecionado"
        );
      }

      const quantidadeMaterias =
        materias.length === 1
          ? "1 matéria"
          : materias.length +
            " matérias";

      botao.innerHTML = `
        <small>
          ${quantidadeMaterias}
        </small>

        <h3>
          ${escaparHtml(
            projeto.nome
          )}
        </h3>

        <p>
          ${escaparHtml(
            projeto.cargo ||
            projeto.orgao ||
            "Projeto de edital"
          )}
        </p>

        <div
          class="barra-progresso"
          style="margin-top:12px"
        >
          <span
            style="
              width:${percentual}%;
              background:var(--laranja)
            "
          ></span>
        </div>

        <small
          style="margin-top:6px"
        >
          ${percentual}% concluído
        </small>
      `;

      elementos.listaProjetos
        .appendChild(
          botao
        );
    }
  );
}

/* =========================================================
   MATÉRIAS E ITENS DO EDITAL
   ========================================================= */

function desenharMateriasEdital() {
  elementos.listaMateriasEdital
    .replaceChildren();

  const materias =
    obterMateriasProjeto();

  if (
    materias.length === 0
  ) {
    adicionarMensagemVazia(
      elementos.listaMateriasEdital,
      "O projeto ainda não possui matérias. Adicione a primeira acima."
    );

    return;
  }

  materias.forEach(
    function (materia) {
      const itens =
        obterItensMateria(
          materia.id
        );

      const concluidos =
        itens.filter(
          function (item) {
            return (
              item.concluido
            );
          }
        ).length;

      const percentual =
        itens.length
          ? Math.round(
              (
                concluidos /
                itens.length
              ) * 100
            )
          : 0;

      const artigo =
        document.createElement(
          "article"
        );

      artigo.className =
        "materia-edital";

      artigo.style.setProperty(
        "--cor-materia",
        corSegura(
          materia.cor
        )
      );

      const dias =
        formatarDiasSemana(
          materia.dias_semana ||
          []
        );

      artigo.innerHTML = `
        <div
          class="cabecalho-materia-edital"
        >
          <div>
            <h3>
              ${escaparHtml(
                materia.nome
              )}
            </h3>

            <p>
              ${dias}
              · meta de
              ${materia.meta_minutos}
              min
              · ${concluidos}/${itens.length}
              itens concluídos
            </p>
          </div>

          <button
            class="botao-perigo-texto"
            type="button"
            data-acao="excluir-materia"
            data-id="${materia.id}"
          >
            Excluir
          </button>
        </div>

        <div
          class="conteudo-materia-edital"
        >
          <div
            class="barra-progresso"
          >
            <span
              style="
                width:${percentual}%;
                background:${corSegura(
                  materia.cor
                )}
              "
            ></span>
          </div>

          <form
            class="formulario-item"
            data-materia-id="${materia.id}"
          >
            <input
              name="descricaoItem"
              type="text"
              maxlength="500"
              placeholder="Ex.: Princípios fundamentais"
              required
            >

            <button
              class="botao-secundario"
              type="submit"
            >
              ＋ Adicionar item
            </button>
          </form>

          <div
            class="lista-itens-edital"
          >
            ${montarHtmlItensEdital(
              itens
            )}
          </div>
        </div>
      `;

      elementos.listaMateriasEdital
        .appendChild(
          artigo
        );
    }
  );
}

function montarHtmlItensEdital(
  itens
) {
  if (
    itens.length === 0
  ) {
    return `
      <p class="lista-vazia">
        Nenhum item cadastrado
        nesta matéria.
      </p>
    `;
  }

  return itens.map(
    function (item) {
      return `
        <label
          class="
            item-edital
            ${
              item.concluido
                ? "concluido"
                : ""
            }
          "
        >
          <input
            type="checkbox"
            data-acao="alternar-item"
            data-id="${item.id}"
            ${
              item.concluido
                ? "checked"
                : ""
            }
          >

          <span>
            ${escaparHtml(
              item.descricao
            )}
          </span>

          <button
            class="excluir-pequeno"
            type="button"
            data-acao="excluir-item"
            data-id="${item.id}"
          >
            Excluir
          </button>
        </label>
      `;
    }
  ).join("");
}

/* =========================================================
   FORMULÁRIO DO PROJETO
   ========================================================= */

function abrirFormularioProjeto(
  projeto = null
) {
  estado.projetoSendoEditado =
    projeto?.id ||
    null;

  elementos.formularioProjeto
    .reset();

  elementos.idProjetoEdicao
    .value =
      projeto?.id ||
      "";

  elementos.campoNomeProjeto
    .value =
      projeto?.nome ||
      "";

  elementos.campoOrgaoProjeto
    .value =
      projeto?.orgao ||
      "";

  elementos.campoCargoProjeto
    .value =
      projeto?.cargo ||
      "";

  elementos.campoDataProvaProjeto
    .value =
      projeto?.data_prova ||
      "";

  elementos.tituloFormularioProjeto
    .textContent =
      projeto
        ? "Editar projeto"
        : "Novo projeto";

  elementos.botaoSalvarProjeto
    .textContent =
      projeto
        ? "Atualizar projeto"
        : "Salvar projeto";

  elementos.mensagemProjeto
    .textContent =
      "";

  elementos.formularioProjetoCaixa
    .hidden =
      false;

  elementos.campoNomeProjeto
    .focus();
}

function fecharFormularioProjeto() {
  estado.projetoSendoEditado =
    null;

  elementos.formularioProjeto
    .reset();

  elementos.idProjetoEdicao
    .value =
      "";

  elementos.mensagemProjeto
    .textContent =
      "";

  elementos.formularioProjetoCaixa
    .hidden =
      true;
}

async function salvarProjeto(
  evento
) {
  evento.preventDefault();

  const dados = {
    nome:
      elementos.campoNomeProjeto
        .value
        .trim(),

    orgao:
      elementos.campoOrgaoProjeto
        .value
        .trim() ||
      null,

    cargo:
      elementos.campoCargoProjeto
        .value
        .trim() ||
      null,

    data_prova:
      elementos.campoDataProvaProjeto
        .value ||
      null,

    atualizado_em:
      new Date()
        .toISOString()
  };

  elementos.botaoSalvarProjeto
    .disabled =
      true;

  elementos.mensagemProjeto
    .textContent =
      "";

  let resultado;

  if (
    estado.projetoSendoEditado
  ) {
    resultado =
      await supabaseCliente
        .from(
          "cronograma_projetos"
        )
        .update(
          dados
        )
        .eq(
          "id",
          estado.projetoSendoEditado
        )
        .select()
        .single();
  } else {
    resultado =
      await supabaseCliente
        .from(
          "cronograma_projetos"
        )
        .insert({
          ...dados,

          usuario_id:
            estado.usuario.id
        })
        .select()
        .single();
  }

  elementos.botaoSalvarProjeto
    .disabled =
      false;

  if (
    resultado.error
  ) {
    elementos.mensagemProjeto
      .textContent =
        resultado.error.code ===
          "23505"
          ? "Já existe um projeto com esse nome."
          : "Não foi possível salvar: " +
            resultado.error.message;

    return;
  }

  estado.projetoAtualId =
    resultado.data.id;

  localStorage.setItem(
    "projeto-santos-cronograma-projeto-atual",
    resultado.data.id
  );

  mostrarAviso(
    estado.projetoSendoEditado
      ? "Projeto atualizado."
      : "Projeto criado com sucesso."
  );

  fecharFormularioProjeto();

  await carregarDadosCronograma();
}

function editarProjetoAtual() {
  const projeto =
    obterProjetoAtual();

  if (!projeto) {
    return;
  }

  abrirFormularioProjeto(
    projeto
  );

  elementos.formularioProjetoCaixa
    .scrollIntoView({
      behavior:
        "smooth",

      block:
        "start"
    });
}

async function excluirProjetoAtual() {
  const projeto =
    obterProjetoAtual();

  if (!projeto) {
    return;
  }

  if (
    estado.cronometroAtivo
  ) {
    mostrarAviso(
      "Pare o cronômetro antes de excluir o projeto.",
      true
    );

    return;
  }

  const confirmou =
    window.confirm(
      "Excluir o projeto “" +
      projeto.nome +
      "” e todas as matérias, itens e sessões dele?"
    );

  if (!confirmou) {
    return;
  }

  const { error } =
    await supabaseCliente
      .from(
        "cronograma_projetos"
      )
      .delete()
      .eq(
        "id",
        projeto.id
      );

  if (error) {
    mostrarAviso(
      "Não foi possível excluir: " +
      error.message,
      true
    );

    return;
  }

  estado.projetoAtualId =
    null;

  localStorage.removeItem(
    "projeto-santos-cronograma-projeto-atual"
  );

  mostrarAviso(
    "Projeto excluído."
  );

  await carregarDadosCronograma();
}

/* =========================================================
   SALVAR MATÉRIA
   ========================================================= */

async function salvarMateriaCronograma(
  evento
) {
  evento.preventDefault();

  const projeto =
    obterProjetoAtual();

  if (!projeto) {
    return;
  }

  const dias =
    Array.from(
      elementos
        .formularioMateriaCronograma
        .querySelectorAll(
          'input[name="diaMateria"]:checked'
        )
    ).map(
      function (input) {
        return Number(
          input.value
        );
      }
    );

  if (
    dias.length === 0
  ) {
    elementos.mensagemMateriaCronograma
      .textContent =
        "Selecione pelo menos um dia de estudo.";

    return;
  }

  const { error } =
    await supabaseCliente
      .from(
        "cronograma_materias"
      )
      .insert({
        usuario_id:
          estado.usuario.id,

        projeto_id:
          projeto.id,

        nome:
          elementos
            .campoNomeMateriaCronograma
            .value
            .trim(),

        meta_minutos:
          Number(
            elementos
              .campoMetaMateriaCronograma
              .value
          ),

        cor:
          elementos
            .campoCorMateriaCronograma
            .value,

        dias_semana:
          dias
      });

  if (error) {
    elementos.mensagemMateriaCronograma
      .textContent =
        error.code ===
          "23505"
          ? "Essa matéria já existe neste projeto."
          : "Não foi possível adicionar: " +
            error.message;

    return;
  }

  elementos.formularioMateriaCronograma
    .reset();

  elementos.campoMetaMateriaCronograma
    .value =
      60;

  elementos.campoCorMateriaCronograma
    .value =
      "#ff6b00";

  elementos.mensagemMateriaCronograma
    .textContent =
      "";

  mostrarAviso(
    "Matéria adicionada ao edital."
  );

  await carregarDadosCronograma();
}

/* =========================================================
   ITENS DO EDITAL
   ========================================================= */

async function tratarFormularioItemEdital(
  evento
) {
  const formulario =
    evento.target.closest(
      ".formulario-item"
    );

  if (!formulario) {
    return;
  }

  evento.preventDefault();

  const campo =
    formulario.elements
      .descricaoItem;

  const descricao =
    campo.value.trim();

  if (!descricao) {
    return;
  }

  const { error } =
    await supabaseCliente
      .from(
        "cronograma_itens_edital"
      )
      .insert({
        usuario_id:
          estado.usuario.id,

        materia_id:
          formulario.dataset
            .materiaId,

        descricao:
          descricao
      });

  if (error) {
    mostrarAviso(
      "Não foi possível adicionar o item: " +
      error.message,
      true
    );

    return;
  }

  campo.value = "";

  mostrarAviso(
    "Item adicionado ao edital."
  );

  await carregarDadosCronograma();
}

async function tratarMudancaItemEdital(
  evento
) {
  const campo =
    evento.target.closest(
      '[data-acao="alternar-item"]'
    );

  if (!campo) {
    return;
  }

  const { error } =
    await supabaseCliente
      .from(
        "cronograma_itens_edital"
      )
      .update({
        concluido:
          campo.checked,

        atualizado_em:
          new Date()
            .toISOString()
      })
      .eq(
        "id",
        campo.dataset.id
      );

  if (error) {
    campo.checked =
      !campo.checked;

    mostrarAviso(
      "Não foi possível atualizar o item: " +
      error.message,
      true
    );

    return;
  }

  await carregarDadosCronograma();
}

async function tratarCliqueEditorEdital(
  evento
) {
  const botao =
    evento.target.closest(
      "[data-acao]"
    );

  if (!botao) {
    return;
  }

  if (
    botao.dataset.acao ===
    "excluir-item"
  ) {
    await excluirItemEdital(
      botao.dataset.id
    );
  }

  if (
    botao.dataset.acao ===
    "excluir-materia"
  ) {
    await excluirMateriaCronograma(
      botao.dataset.id
    );
  }
}

async function excluirItemEdital(
  id
) {
  const confirmou =
    window.confirm(
      "Excluir este item do edital?"
    );

  if (!confirmou) {
    return;
  }

  const { error } =
    await supabaseCliente
      .from(
        "cronograma_itens_edital"
      )
      .delete()
      .eq(
        "id",
        id
      );

  if (error) {
    mostrarAviso(
      "Não foi possível excluir o item: " +
      error.message,
      true
    );

    return;
  }

  await carregarDadosCronograma();
}

async function excluirMateriaCronograma(
  id
) {
  if (
    estado.cronometroAtivo &&
    estado.materiaCronometroId ===
      id
  ) {
    mostrarAviso(
      "Pare o cronômetro antes de excluir esta matéria.",
      true
    );

    return;
  }

  const materia =
    estado.materias.find(
      function (item) {
        return (
          item.id === id
        );
      }
    );

  const confirmou =
    window.confirm(
      "Excluir “" +
      (
        materia?.nome ||
        "esta matéria"
      ) +
      "” e todos os seus itens?"
    );

  if (!confirmou) {
    return;
  }

  const { error } =
    await supabaseCliente
      .from(
        "cronograma_materias"
      )
      .delete()
      .eq(
        "id",
        id
      );

  if (error) {
    mostrarAviso(
      "Não foi possível excluir a matéria: " +
      error.message,
      true
    );

    return;
  }

  mostrarAviso(
    "Matéria excluída."
  );

  await carregarDadosCronograma();
}

/* =========================================================
   CRONÔMETRO
   ========================================================= */

async function iniciarCronometroProjeto() {
  if (
    estado.cronometroAtivo
  ) {
    return;
  }

  const projeto =
    obterProjetoAtual();

  const materiaId =
    elementos
      .selectMateriaCronometro
      .value;

  const materiaValida =
    estado.materias.some(
      function (materia) {
        return (
          materia.id ===
            materiaId &&
          materia.projeto_id ===
            projeto?.id
        );
      }
    );

  if (
    !projeto ||
    !materiaValida
  ) {
    mostrarAviso(
      "Selecione a matéria que será estudada.",
      true
    );

    return;
  }

  elementos
    .botaoIniciarCronometroProjeto
    .disabled =
      true;

  const agora =
    new Date()
      .toISOString();

  const { data, error } =
    await supabaseCliente
      .from(
        "cronograma_sessoes"
      )
      .insert({
        usuario_id:
          estado.usuario.id,

        projeto_id:
          projeto.id,

        materia_id:
          materiaId,

        iniciado_em:
          agora,

        duracao_segundos:
          0
      })
      .select("id")
      .single();

  if (error) {
    elementos
      .botaoIniciarCronometroProjeto
      .disabled =
        false;

    mostrarAviso(
      "Não foi possível iniciar o estudo: " +
      error.message,
      true
    );

    return;
  }

  estado.cronometroAtivo =
    true;

  estado.sessaoAtualId =
    data.id;

  estado.materiaCronometroId =
    materiaId;

  estado.inicioCronometro =
    Date.now();

  estado.segundosCronometro =
    0;

  atualizarEstadoCronometro(
    true
  );

  atualizarCronometroNaTela();

  clearInterval(
    estado.intervaloCronometro
  );

  clearInterval(
    estado.intervaloPersistencia
  );

  /*
    Atualiza o cronômetro a cada segundo.
  */

  estado.intervaloCronometro =
    setInterval(
      function () {
        estado.segundosCronometro =
          Math.floor(
            (
              Date.now() -
              estado.inicioCronometro
            ) /
            1000
          );

        atualizarCronometroNaTela();
      },
      1000
    );

  /*
    Salva uma cópia do tempo no banco
    a cada 30 segundos.
  */

  estado.intervaloPersistencia =
    setInterval(
      function () {
        persistirSessaoAtual(
          false
        );
      },
      30000
    );

  mostrarAviso(
    "Sessão de estudo iniciada."
  );
}

async function pararCronometroProjeto(
  mostrarConfirmacao = true
) {
  if (
    !estado.cronometroAtivo
  ) {
    return;
  }

  estado.segundosCronometro =
    Math.floor(
      (
        Date.now() -
        estado.inicioCronometro
      ) /
      1000
    );

  clearInterval(
    estado.intervaloCronometro
  );

  clearInterval(
    estado.intervaloPersistencia
  );

  elementos
    .botaoPararCronometroProjeto
    .disabled =
      true;

  await persistirSessaoAtual(
    true
  );

  const tempoFinal =
    estado.segundosCronometro;

  estado.cronometroAtivo =
    false;

  estado.sessaoAtualId =
    null;

  estado.materiaCronometroId =
    null;

  estado.inicioCronometro =
    null;

  atualizarEstadoCronometro(
    false
  );

  if (
    mostrarConfirmacao
  ) {
    mostrarAviso(
      "Estudo encerrado e contabilizado: " +
      transformarSegundosEmHorario(
        tempoFinal
      )
    );
  }

  await carregarDadosCronograma();

  estado.segundosCronometro =
    0;

  atualizarCronometroNaTela();
}

async function persistirSessaoAtual(
  finalizar
) {
  if (
    !estado.sessaoAtualId
  ) {
    return;
  }

  estado.segundosCronometro =
    Math.floor(
      (
        Date.now() -
        estado.inicioCronometro
      ) /
      1000
    );

  const atualizacao = {
    duracao_segundos:
      estado.segundosCronometro
  };

  if (finalizar) {
    atualizacao.finalizado_em =
      new Date()
        .toISOString();
  }

  const { error } =
    await supabaseCliente
      .from(
        "cronograma_sessoes"
      )
      .update(
        atualizacao
      )
      .eq(
        "id",
        estado.sessaoAtualId
      );

  if (error) {
    console.error(
      "Erro ao salvar sessão do Cronograma:",
      error
    );

    if (finalizar) {
      mostrarAviso(
        "O cronômetro parou, mas o tempo não pôde ser salvo.",
        true
      );
    }
  }
}

function atualizarEstadoCronometro(
  ativo
) {
  elementos
    .situacaoCronometroProjeto
    .textContent =
      ativo
        ? "Em estudo"
        : "Parado";

  elementos
    .situacaoCronometroProjeto
    .className =
      ativo
        ? "status-ativo"
        : "status-parado";

  elementos
    .botaoIniciarCronometroProjeto
    .disabled =
      ativo ||
      obterMateriasProjeto()
        .length === 0;

  elementos
    .botaoPararCronometroProjeto
    .disabled =
      !ativo;

  elementos
    .selectMateriaCronometro
    .disabled =
      ativo;

  elementos
    .selectProjetoTopo
    .disabled =
      ativo ||
      estado.projetos.length ===
        0;
}

function atualizarCronometroNaTela() {
  elementos.cronometroProjeto
    .textContent =
      transformarSegundosEmHorario(
        estado.segundosCronometro
      );
}

/* =========================================================
   FORMATAÇÕES DO PROJETO
   ========================================================= */

function montarResumoProjeto(
  projeto
) {
  const partes = [
    projeto.orgao,
    projeto.cargo
  ].filter(Boolean);

  if (
    projeto.data_prova
  ) {
    partes.push(
      "prova em " +
      formatarData(
        projeto.data_prova
      )
    );
  }

  return partes.length
    ? partes.join(" · ")
    : "Projeto de edital verticalizado";
}

function formatarDiasSemana(
  dias
) {
  const nomes = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb"
  ];

  if (
    !dias.length
  ) {
    return (
      "Sem dias definidos"
    );
  }

  return [
    ...dias
  ]
    .sort(
      function (a, b) {
        const ordem = [
          1,
          2,
          3,
          4,
          5,
          6,
          0
        ];

        return (
          ordem.indexOf(a) -
          ordem.indexOf(b)
        );
      }
    )
    .map(
      function (dia) {
        return nomes[dia];
      }
    )
    .join(", ");
}

/* =========================================================
   DATAS
   ========================================================= */

function ehHoje(
  data
) {
  const recebida =
    new Date(data);

  const hoje =
    new Date();

  return (
    recebida.getFullYear() ===
      hoje.getFullYear() &&
    recebida.getMonth() ===
      hoje.getMonth() &&
    recebida.getDate() ===
      hoje.getDate()
  );
}

function inicioDoDia(
  data
) {
  const copia =
    new Date(data);

  copia.setHours(
    0,
    0,
    0,
    0
  );

  return copia;
}

function dataLocalDeIso(
  dataIso
) {
  const [
    ano,
    mes,
    dia
  ] =
    dataIso
      .split("-")
      .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );
}

function formatarData(
  data
) {
  if (!data) {
    return (
      "Não definida"
    );
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/
      .test(data)
  ) {
    return dataLocalDeIso(
      data
    ).toLocaleDateString(
      "pt-BR"
    );
  }

  return new Date(
    data
  ).toLocaleDateString(
    "pt-BR"
  );
}

function formatarDataHora(
  data
) {
  if (!data) {
    return (
      "Não definida"
    );
  }

  return new Date(
    data
  ).toLocaleString(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short"
    }
  );
}

/* =========================================================
   FORMATAÇÕES DE TEMPO
   ========================================================= */

function transformarSegundosEmHorario(
  totalSegundos
) {
  const total =
    Math.max(
      0,
      Math.floor(
        Number(
          totalSegundos
        ) ||
        0
      )
    );

  const horas =
    String(
      Math.floor(
        total /
        3600
      )
    ).padStart(
      2,
      "0"
    );

  const minutos =
    String(
      Math.floor(
        (
          total %
          3600
        ) /
        60
      )
    ).padStart(
      2,
      "0"
    );

  const segundos =
    String(
      total %
      60
    ).padStart(
      2,
      "0"
    );

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
  const total =
    Math.max(
      0,
      Math.floor(
        Number(
          totalSegundos
        ) ||
        0
      )
    );

  const horas =
    Math.floor(
      total /
      3600
    );

  const minutos =
    Math.floor(
      (
        total %
        3600
      ) /
      60
    );

  return (
    String(horas)
      .padStart(
        2,
        "0"
      ) +
    "h " +
    String(minutos)
      .padStart(
        2,
        "0"
      ) +
    "min"
  );
}

/* =========================================================
   AUXILIARES
   ========================================================= */

function adicionarMensagemVazia(
  container,
  texto
) {
  const vazio =
    document.createElement(
      "p"
    );

  vazio.className =
    "lista-vazia";

  vazio.textContent =
    texto;

  container.appendChild(
    vazio
  );
}

function escaparHtml(
  valor = ""
) {
  return String(valor)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function corSegura(
  cor
) {
  return (
    /^#[0-9a-f]{6}$/i
      .test(
        cor ||
        ""
      )
  )
    ? cor
    : "#ff6b00";
}

/* =========================================================
   AVISOS
   ========================================================= */

let tempoAviso;

function mostrarAviso(
  mensagem,
  erro = false
) {
  clearTimeout(
    tempoAviso
  );

  elementos.avisoCronograma
    .textContent =
      mensagem;

  elementos.avisoCronograma
    .className =
      erro
        ? "aviso mostrar erro"
        : "aviso mostrar";

  tempoAviso =
    setTimeout(
      function () {
        elementos
          .avisoCronograma
          .classList
          .remove(
            "mostrar"
          );
      },
      4200
    );
}
