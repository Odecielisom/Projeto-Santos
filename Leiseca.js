"use strict";

/*
  ==========================================================
  CONFIGURAÇÃO DO SUPABASE
  ==========================================================

  Troque:
  COLE_SUA_CHAVE_ANON_AQUI

  pela chave pública do seu Supabase.

  Não use a chave service_role.
*/

const SUPABASE_URL =
  "https://gmhkrdtbsxniazoiqczx.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_bOgU7q2HkDFXxX6230cUEg_RNrkhBn0";

/*
  Verifica se você já colocou a chave.
*/

const supabaseConfigurado =
  !SUPABASE_ANON_KEY.includes("COLE_");

/*
  Cria a conexão com o Supabase.
*/

const supabaseCliente = supabaseConfigurado
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
  : null;

/*
  Estes são artigos de demonstração.

  Eles aparecem quando o Supabase ainda não foi configurado.
*/

const artigosDemonstracao = [
  {
    id: "exemplo-1",
    materia: "Direito Penal",
    assunto: "Crimes contra o patrimônio",
    numero_artigo: "Art. 155",
    titulo: "Furto",
    texto_lei:
      "Subtrair, para si ou para outrem, coisa alheia móvel:\n\nPena – reclusão, de 1 (um) a 4 (quatro) anos, e multa.",
    explicacao:
      "É um crime contra o patrimônio. Ocorre quando alguém pega um bem móvel de outra pessoa sem violência ou ameaça.",
    pena: "Reclusão de 1 a 4 anos",
    multa: "Sim",
    ordem: 1
  },
  {
    id: "exemplo-2",
    materia: "Direito Penal",
    assunto: "Crimes contra o patrimônio",
    numero_artigo: "Art. 157",
    titulo: "Roubo",
    texto_lei:
      "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa.",
    explicacao:
      "No roubo existe violência ou grave ameaça contra a vítima.",
    pena: "Reclusão de 4 a 10 anos",
    multa: "Sim",
    ordem: 2
  },
  {
    id: "exemplo-3",
    materia: "Direito Penal",
    assunto: "Crimes contra o patrimônio",
    numero_artigo: "Art. 180",
    titulo: "Receptação",
    texto_lei:
      "Adquirir, receber, transportar, conduzir ou ocultar coisa que sabe ser produto de crime.",
    explicacao:
      "O agente sabe que o objeto veio de um crime.",
    pena: "Reclusão de 1 a 4 anos",
    multa: "Sim",
    ordem: 3
  }
];

/*
  Esta caixa guarda informações temporárias da página.
*/

const estado = {
  artigos: [],
  artigosFiltrados: [],
  artigoAtual: 0,
  artigoSendoEditado: null,
  segundosEstudo: 0
};

/*
  Aqui pegamos os elementos do HTML.
*/

const menuPrincipal =
  document.getElementById("menuPrincipal");

const fundoMenu =
  document.getElementById("fundoMenu");

const botaoAbrirMenu =
  document.getElementById("botaoAbrirMenu");

const botaoGerenciar =
  document.getElementById("botaoGerenciar");

const botaoCriarPrimeiro =
  document.getElementById("botaoCriarPrimeiro");

const janelaGerenciar =
  document.getElementById("janelaGerenciar");

const botaoFecharGerenciar =
  document.getElementById("botaoFecharGerenciar");

const botaoSair =
  document.getElementById("botaoSair");

const nomeUsuario =
  document.getElementById("nomeUsuario");

const emailUsuario =
  document.getElementById("emailUsuario");

const letraUsuario =
  document.getElementById("letraUsuario");

const botaoNovoEstudo =
  document.getElementById("botaoNovoEstudo");

const cronometro =
  document.getElementById("cronometro");

const campoPesquisa =
  document.getElementById("campoPesquisa");

const arvoreArtigos =
  document.getElementById("arvoreArtigos");

const caminho =
  document.getElementById("caminho");

const contadorArtigos =
  document.getElementById("contadorArtigos");

const estadoVazio =
  document.getElementById("estadoVazio");

const visualizacaoArtigo =
  document.getElementById("visualizacaoArtigo");

const tituloArtigo =
  document.getElementById("tituloArtigo");

const textoLei =
  document.getElementById("textoLei");

const caixaExplicacao =
  document.getElementById("caixaExplicacao");

const textoExplicacao =
  document.getElementById("textoExplicacao");

const cartaoDetalhes =
  document.getElementById("cartaoDetalhes");

const textoPena =
  document.getElementById("textoPena");

const textoMulta =
  document.getElementById("textoMulta");

const botaoAnterior =
  document.getElementById("botaoAnterior");

const botaoProximo =
  document.getElementById("botaoProximo");

const progressoArtigo =
  document.getElementById("progressoArtigo");

const formularioArtigo =
  document.getElementById("formularioArtigo");

const campoMateria =
  document.getElementById("campoMateria");

const campoAssunto =
  document.getElementById("campoAssunto");

const campoNumero =
  document.getElementById("campoNumero");

const campoTitulo =
  document.getElementById("campoTitulo");

const campoTextoLei =
  document.getElementById("campoTextoLei");

const campoExplicacao =
  document.getElementById("campoExplicacao");

const campoPena =
  document.getElementById("campoPena");

const campoMulta =
  document.getElementById("campoMulta");

const campoOrdem =
  document.getElementById("campoOrdem");

const tituloFormulario =
  document.getElementById("tituloFormulario");

const botaoSalvarArtigo =
  document.getElementById("botaoSalvarArtigo");

const botaoCancelarEdicao =
  document.getElementById("botaoCancelarEdicao");

const mensagemFormulario =
  document.getElementById("mensagemFormulario");

const listaArtigosSalvos =
  document.getElementById("listaArtigosSalvos");

const quantidadeSalva =
  document.getElementById("quantidadeSalva");

const aviso =
  document.getElementById("aviso");

/*
  Quando a página terminar de abrir,
  esta função será executada.
*/

iniciarSistema();

async function iniciarSistema() {
  configurarBotoes();
  iniciarCronometro();

  if (supabaseConfigurado) {
    const resultado =
      await supabaseCliente.auth.getSession();

    if (!resultado.data.session) {
      window.location.href = "index.html";
      return;
    }

    mostrarUsuario(resultado.data.session.user);
  } else {
    mostrarUsuario(null);

    mostrarAviso(
      "Modo demonstração: os artigos estão sendo salvos somente neste navegador."
    );
  }

  await carregarArtigos();
}

/*
  Liga cada botão a uma função.
*/

function configurarBotoes() {
  botaoAbrirMenu.addEventListener(
    "click",
    abrirMenuCelular
  );

  fundoMenu.addEventListener(
    "click",
    fecharMenuCelular
  );

  botaoGerenciar.addEventListener(
    "click",
    abrirGerenciador
  );

  botaoCriarPrimeiro.addEventListener(
    "click",
    abrirGerenciador
  );

  botaoFecharGerenciar.addEventListener(
    "click",
    function () {
      janelaGerenciar.close();
    }
  );

  botaoSair.addEventListener(
    "click",
    sairDoSistema
  );

  botaoNovoEstudo.addEventListener(
    "click",
    iniciarNovoEstudo
  );

  campoPesquisa.addEventListener(
    "input",
    pesquisarArtigos
  );

  botaoAnterior.addEventListener(
    "click",
    function () {
      selecionarArtigo(estado.artigoAtual - 1);
    }
  );

  botaoProximo.addEventListener(
    "click",
    function () {
      selecionarArtigo(estado.artigoAtual + 1);
    }
  );

  formularioArtigo.addEventListener(
    "submit",
    salvarArtigo
  );

  botaoCancelarEdicao.addEventListener(
    "click",
    limparFormulario
  );
}

/*
  Mostra o nome e o e-mail do usuário.
*/

function mostrarUsuario(usuario) {
  let nome = "Usuário";
  let email = "Modo demonstração";

  if (usuario) {
    email = usuario.email;
    nome = usuario.email.split("@")[0];
  }

  nomeUsuario.textContent = nome;
  emailUsuario.textContent = email;
  letraUsuario.textContent =
    nome.charAt(0).toUpperCase();
}

/*
  Busca os artigos no Supabase.

  Se o Supabase não estiver configurado,
  busca os artigos guardados no navegador.
*/

async function carregarArtigos(idPreferido = null) {
  let artigos = [];

  if (supabaseConfigurado) {
    const resultado = await supabaseCliente
      .from("artigos")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    if (resultado.error) {
      mostrarAviso(
        "Não foi possível carregar os artigos: " +
        resultado.error.message,
        true
      );

      artigos = [];
    } else {
      artigos = resultado.data || [];
    }
  } else {
    const artigosGuardados =
      localStorage.getItem("projeto-santos-artigos");

    if (artigosGuardados) {
      artigos = JSON.parse(artigosGuardados);
    } else {
      artigos = artigosDemonstracao;

      guardarArtigosNoNavegador(artigos);
    }
  }

  estado.artigos = ordenarArtigos(artigos);
  estado.artigosFiltrados = [...estado.artigos];

  if (idPreferido) {
    const posicao = estado.artigosFiltrados.findIndex(
      function (artigo) {
        return artigo.id === idPreferido;
      }
    );

    estado.artigoAtual =
      posicao >= 0 ? posicao : 0;
  } else {
    estado.artigoAtual = 0;
  }

  desenharTudo();
}

/*
  Organiza os artigos pela ordem escolhida.
*/

function ordenarArtigos(artigos) {
  return [...artigos].sort(
    function (primeiro, segundo) {
      return (
        Number(primeiro.ordem || 0) -
        Number(segundo.ordem || 0)
      );
    }
  );
}

/*
  Atualiza todas as partes da tela.
*/

function desenharTudo() {
  desenharMenuArtigos();
  mostrarArtigoAtual();
  desenharListaGerenciamento();
}

/*
  Monta o menu de matérias, assuntos e artigos.
*/

function desenharMenuArtigos() {
  arvoreArtigos.innerHTML = "";

  if (estado.artigosFiltrados.length === 0) {
    arvoreArtigos.innerHTML =
      '<p class="lista-vazia">Nenhum artigo encontrado.</p>';

    return;
  }

  const grupos = {};

  estado.artigosFiltrados.forEach(
    function (artigo) {
      if (!grupos[artigo.materia]) {
        grupos[artigo.materia] = {};
      }

      if (!grupos[artigo.materia][artigo.assunto]) {
        grupos[artigo.materia][artigo.assunto] = [];
      }

      grupos[artigo.materia][artigo.assunto]
        .push(artigo);
    }
  );

  Object.keys(grupos).forEach(
    function (materia) {
      const caixaMateria =
        document.createElement("section");

      const tituloMateria =
        document.createElement("button");

      tituloMateria.type = "button";
      tituloMateria.className = "titulo-materia";
      tituloMateria.textContent = "▾ " + materia;

      caixaMateria.appendChild(tituloMateria);

      Object.keys(grupos[materia]).forEach(
        function (assunto) {
          const tituloAssunto =
            document.createElement("button");

          tituloAssunto.type = "button";
          tituloAssunto.className = "titulo-assunto";
          tituloAssunto.textContent = "▾ " + assunto;

          caixaMateria.appendChild(tituloAssunto);

          grupos[materia][assunto].forEach(
            function (artigo) {
              const posicao =
                estado.artigosFiltrados.findIndex(
                  function (item) {
                    return item.id === artigo.id;
                  }
                );

              const botaoArtigo =
                document.createElement("button");

              botaoArtigo.type = "button";
              botaoArtigo.className = "botao-artigo";

              if (posicao === estado.artigoAtual) {
                botaoArtigo.classList.add("ativo");
              }

              botaoArtigo.textContent =
                artigo.numero_artigo +
                " - " +
                artigo.titulo;

              botaoArtigo.addEventListener(
                "click",
                function () {
                  selecionarArtigo(posicao);
                }
              );

              caixaMateria.appendChild(botaoArtigo);
            }
          );
        }
      );

      arvoreArtigos.appendChild(caixaMateria);
    }
  );
}

/*
  Mostra o artigo escolhido.
*/

function mostrarArtigoAtual() {
  const artigo =
    estado.artigosFiltrados[estado.artigoAtual];

  if (!artigo) {
    estadoVazio.hidden = false;
    visualizacaoArtigo.hidden = true;

    caminho.textContent =
      "Nenhum artigo selecionado";

    contadorArtigos.textContent = "0 de 0";

    return;
  }

  estadoVazio.hidden = true;
  visualizacaoArtigo.hidden = false;

  caminho.textContent =
    artigo.materia + " › " + artigo.assunto;

  contadorArtigos.textContent =
    estado.artigoAtual +
    1 +
    " de " +
    estado.artigosFiltrados.length;

  tituloArtigo.textContent =
    artigo.numero_artigo +
    " - " +
    artigo.titulo;

  textoLei.textContent = artigo.texto_lei;

  textoExplicacao.textContent =
    artigo.explicacao || "";

  caixaExplicacao.hidden =
    !artigo.explicacao;

  textoPena.textContent =
    artigo.pena || "Não informado";

  textoMulta.textContent =
    artigo.multa || "Não informado";

  cartaoDetalhes.hidden =
    !artigo.pena && !artigo.multa;

  botaoAnterior.disabled =
    estado.artigoAtual === 0;

  botaoProximo.disabled =
    estado.artigoAtual ===
    estado.artigosFiltrados.length - 1;

  progressoArtigo.textContent =
    "Artigo " +
    (estado.artigoAtual + 1) +
    " de " +
    estado.artigosFiltrados.length;
}

/*
  Troca de artigo.
*/

function selecionarArtigo(posicao) {
  if (
    posicao < 0 ||
    posicao >= estado.artigosFiltrados.length
  ) {
    return;
  }

  estado.artigoAtual = posicao;

  desenharMenuArtigos();
  mostrarArtigoAtual();

  if (window.innerWidth <= 850) {
    fecharMenuCelular();
  }
}

/*
  Pesquisa um artigo.
*/

function pesquisarArtigos() {
  const pesquisa =
    normalizarTexto(campoPesquisa.value);

  if (!pesquisa) {
    estado.artigosFiltrados =
      [...estado.artigos];
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

          return normalizarTexto(textoCompleto)
            .includes(pesquisa);
        }
      );
  }

  estado.artigoAtual = 0;

  desenharMenuArtigos();
  mostrarArtigoAtual();
}

/*
  Remove acentos e deixa tudo minúsculo.

  Assim "Constituição" pode ser encontrada
  mesmo que a pessoa escreva "constituicao".
*/

function normalizarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/*
  Abre a janela de cadastro.
*/

function abrirGerenciador() {
  fecharMenuCelular();
  desenharListaGerenciamento();
  janelaGerenciar.showModal();
}

/*
  Salva um novo artigo ou atualiza um artigo.
*/

async function salvarArtigo(evento) {
  evento.preventDefault();

  botaoSalvarArtigo.disabled = true;
  botaoSalvarArtigo.textContent = "Salvando...";
  mensagemFormulario.textContent = "";

  const dadosArtigo = {
    materia: campoMateria.value.trim(),
    assunto: campoAssunto.value.trim(),
    numero_artigo: campoNumero.value.trim(),
    titulo: campoTitulo.value.trim(),
    texto_lei: campoTextoLei.value.trim(),
    explicacao: campoExplicacao.value.trim(),
    pena: campoPena.value.trim(),
    multa: campoMulta.value.trim(),
    ordem: Number(campoOrdem.value) || 0,
    ativo: true
  };

  try {
    let idArtigoSalvo =
      estado.artigoSendoEditado;

    if (supabaseConfigurado) {
      let resultado;

      if (estado.artigoSendoEditado) {
        resultado = await supabaseCliente
          .from("artigos")
          .update(dadosArtigo)
          .eq("id", estado.artigoSendoEditado)
          .select()
          .single();
      } else {
        resultado = await supabaseCliente
          .from("artigos")
          .insert(dadosArtigo)
          .select()
          .single();
      }

      if (resultado.error) {
        throw resultado.error;
      }

      idArtigoSalvo = resultado.data.id;
    } else {
      if (estado.artigoSendoEditado) {
        const posicao =
          estado.artigos.findIndex(
            function (artigo) {
              return (
                artigo.id ===
                estado.artigoSendoEditado
              );
            }
          );

        estado.artigos[posicao] = {
          ...estado.artigos[posicao],
          ...dadosArtigo
        };
      } else {
        idArtigoSalvo =
          "artigo-" + Date.now();

        estado.artigos.push({
          id: idArtigoSalvo,
          ...dadosArtigo
        });
      }

      guardarArtigosNoNavegador(
        estado.artigos
      );
    }

    mostrarAviso(
      estado.artigoSendoEditado
        ? "Artigo atualizado com sucesso."
        : "Artigo criado com sucesso."
    );

    limparFormulario();

    await carregarArtigos(idArtigoSalvo);
  } catch (erro) {
    mensagemFormulario.textContent =
      "Não foi possível salvar: " +
      erro.message;
  } finally {
    botaoSalvarArtigo.disabled = false;
    botaoSalvarArtigo.textContent =
      estado.artigoSendoEditado
        ? "Atualizar artigo"
        : "Salvar artigo";
  }
}

/*
  Coloca os dados do artigo no formulário
  para que ele possa ser editado.
*/

function editarArtigo(id) {
  const artigo = estado.artigos.find(
    function (item) {
      return item.id === id;
    }
  );

  if (!artigo) {
    return;
  }

  estado.artigoSendoEditado = id;

  campoMateria.value = artigo.materia;
  campoAssunto.value = artigo.assunto;
  campoNumero.value = artigo.numero_artigo;
  campoTitulo.value = artigo.titulo;
  campoTextoLei.value = artigo.texto_lei;
  campoExplicacao.value =
    artigo.explicacao || "";
  campoPena.value = artigo.pena || "";
  campoMulta.value = artigo.multa || "";
  campoOrdem.value = artigo.ordem || 0;

  tituloFormulario.textContent =
    "Editar artigo";

  botaoSalvarArtigo.textContent =
    "Atualizar artigo";

  botaoCancelarEdicao.hidden = false;

  campoMateria.focus();
}

/*
  Exclui um artigo.
*/

async function excluirArtigo(id) {
  const artigo = estado.artigos.find(
    function (item) {
      return item.id === id;
    }
  );

  if (!artigo) {
    return;
  }

  const confirmou = window.confirm(
    "Você realmente deseja excluir " +
    artigo.numero_artigo +
    " - " +
    artigo.titulo +
    "?"
  );

  if (!confirmou) {
    return;
  }

  if (supabaseConfigurado) {
    const resultado = await supabaseCliente
      .from("artigos")
      .delete()
      .eq("id", id);

    if (resultado.error) {
      mostrarAviso(
        "Não foi possível excluir: " +
        resultado.error.message,
        true
      );

      return;
    }
  } else {
    estado.artigos = estado.artigos.filter(
      function (item) {
        return item.id !== id;
      }
    );

    guardarArtigosNoNavegador(
      estado.artigos
    );
  }

  if (estado.artigoSendoEditado === id) {
    limparFormulario();
  }

  mostrarAviso("Artigo excluído.");

  await carregarArtigos();
}

/*
  Monta a lista de artigos cadastrados.
*/

function desenharListaGerenciamento() {
  listaArtigosSalvos.innerHTML = "";

  quantidadeSalva.textContent =
    estado.artigos.length;

  if (estado.artigos.length === 0) {
    listaArtigosSalvos.innerHTML =
      '<p class="lista-vazia">Nenhum artigo cadastrado.</p>';

    return;
  }

  estado.artigos.forEach(
    function (artigo) {
      const caixa =
        document.createElement("article");

      caixa.className = "artigo-salvo";

      const local =
        document.createElement("small");

      local.textContent =
        artigo.materia +
        " › " +
        artigo.assunto;

      const titulo =
        document.createElement("strong");

      titulo.textContent =
        artigo.numero_artigo +
        " - " +
        artigo.titulo;

      const acoes =
        document.createElement("div");

      acoes.className = "acoes-artigo";

      const botaoEditar =
        document.createElement("button");

      botaoEditar.type = "button";
      botaoEditar.textContent = "Editar";

      botaoEditar.addEventListener(
        "click",
        function () {
          editarArtigo(artigo.id);
        }
      );

      const botaoExcluir =
        document.createElement("button");

      botaoExcluir.type = "button";
      botaoExcluir.textContent = "Excluir";
      botaoExcluir.className = "excluir";

      botaoExcluir.addEventListener(
        "click",
        function () {
          excluirArtigo(artigo.id);
        }
      );

      acoes.appendChild(botaoEditar);
      acoes.appendChild(botaoExcluir);

      caixa.appendChild(local);
      caixa.appendChild(titulo);
      caixa.appendChild(acoes);

      listaArtigosSalvos.appendChild(caixa);
    }
  );
}

/*
  Limpa o formulário.
*/

function limparFormulario() {
  estado.artigoSendoEditado = null;

  formularioArtigo.reset();

  campoOrdem.value = 0;

  tituloFormulario.textContent =
    "Novo artigo";

  botaoSalvarArtigo.textContent =
    "Salvar artigo";

  botaoCancelarEdicao.hidden = true;

  mensagemFormulario.textContent = "";
}

/*
  Salva os artigos no navegador
  durante o modo demonstração.
*/

function guardarArtigosNoNavegador(artigos) {
  localStorage.setItem(
    "projeto-santos-artigos",
    JSON.stringify(artigos)
  );
}

/*
  Sai da conta.
*/

async function sairDoSistema() {
  if (supabaseCliente) {
    await supabaseCliente.auth.signOut();
  }

  window.location.href = "index.html";
}

/*
  Abre e fecha o menu no celular.
*/

function abrirMenuCelular() {
  menuPrincipal.classList.add("aberto");
  fundoMenu.classList.add("visivel");
}

function fecharMenuCelular() {
  menuPrincipal.classList.remove("aberto");
  fundoMenu.classList.remove("visivel");
}

/*
  Cronômetro de estudo.
*/

function iniciarCronometro() {
  setInterval(
    function () {
      estado.segundosEstudo++;

      cronometro.textContent =
        transformarSegundosEmHorario(
          estado.segundosEstudo
        );
    },
    1000
  );
}

function transformarSegundosEmHorario(
  totalSegundos
) {
  const horas = String(
    Math.floor(totalSegundos / 3600)
  ).padStart(2, "0");

  const minutos = String(
    Math.floor(
      (totalSegundos % 3600) / 60
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

/*
  Reinicia o estudo.
*/

function iniciarNovoEstudo() {
  estado.segundosEstudo = 0;
  estado.artigoAtual = 0;

  campoPesquisa.value = "";

  estado.artigosFiltrados =
    [...estado.artigos];

  desenharMenuArtigos();
  mostrarArtigoAtual();

  mostrarAviso("Novo estudo iniciado.");
}

/*
  Mostra uma pequena mensagem no canto.
*/

let tempoAviso;

function mostrarAviso(
  mensagem,
  mensagemDeErro = false
) {
  clearTimeout(tempoAviso);

  aviso.textContent = mensagem;

  aviso.className =
    mensagemDeErro
      ? "aviso mostrar erro"
      : "aviso mostrar";

  tempoAviso = setTimeout(
    function () {
      aviso.classList.remove("mostrar");
    },
    3500
  );
}
