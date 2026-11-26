// Endereço da API e dados da tela (o usuário é o último cadastrado, ainda sem login)
const API = "http://localhost:3001/api";

let usuario = null;
let contas = [];
let categorias = [];
let movimentacoes = [];
let notificacoes = [];

let movimentoAtual = null;
let filtroTipo = "";

function pegar(id) {
    return document.getElementById(id);
}

// Converte valor do banco
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte data do banco
function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
}

function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    elemento.className = classe;
    elemento.textContent = texto;
    return elemento;
}

function iniciais(texto) {
    return texto.substring(0, 2).toUpperCase();
}

function textoValor(mov) {
    if (mov.tipo === "entrada") {
        return "+ " + formatarMoeda(mov.valor);
    }
    return "- " + formatarMoeda(mov.valor);
}

// Faz a busca de dados na API e devolve o resultado já em JSON
function buscar(caminho, opcoes) {
    return fetch(API + caminho, opcoes).then(function (resposta) {
        return resposta.json().then(function (dados) {
            if (!resposta.ok) {
                throw new Error(dados.erro);
            }
            return dados;
        });
    });
}

function enviar(caminho, dados) {
    return buscar(caminho, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

// Mostra a mensagem de erro vermelha
function mostrarErro(erro) {
    pegar("erro").textContent = erro.message;
    pegar("erro").hidden = false;
}

function mostrarTela(nome) {
    document.querySelectorAll(".tela").forEach(function (tela) {
        tela.hidden = true;
    });
    pegar("tela-" + nome).hidden = false;
    pegar("erro").hidden = true;
}

function carregarDados() {
    return Promise.all([
        buscar("/contas?usuario_id=" + usuario.id),
        buscar("/categorias"),
        buscar("/movimentacoes?usuario_id=" + usuario.id),
        buscar("/notificacoes?usuario_id=" + usuario.id)
    ]).then(function (resultado) {
        contas = resultado[0];
        categorias = resultado[1];
        movimentacoes = resultado[2];
        notificacoes = resultado[3];
    });
}

function criarLinha(mov) {
    const texto = document.createElement("div");
    texto.className = "item-texto";
    texto.appendChild(criar("span", "item-titulo", mov.descricao));
    texto.appendChild(criar("span", "item-info", (mov.categoria || "Sem categoria") + ", " + formatarData(mov.data_movimentacao)));

    const linha = document.createElement("button");
    linha.className = "item";
    linha.onclick = function () {
        abrirDetalhe(mov);
    };
    linha.appendChild(criar("span", "avatar", iniciais(mov.descricao)));
    linha.appendChild(texto);
    linha.appendChild(criar("span", "item-valor valor " + mov.tipo, textoValor(mov)));

    const item = document.createElement("li");
    item.appendChild(linha);
    return item;
}

function abrirVisao() {
    mostrarTela("visao");
    const hoje = new Date();
    pegar("data-hoje").textContent = hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    pegar("ola").textContent = "Olá, " + usuario.nome.split(" ")[0];

    // Mostra o saldo, as entradas e as despesas
    let saldo = 0;
    contas.forEach(function (conta) {
        saldo += Number(conta.saldo);
    });
    pegar("saldo").textContent = formatarMoeda(saldo);

    let entradas = 0;
    let saidas = 0;
    let quantidade = 0;
    movimentacoes.forEach(function (mov) {
        const data = new Date(mov.data_movimentacao);
        if (data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear()) {
            quantidade++;
            if (mov.tipo === "entrada") {
                entradas += Number(mov.valor);
            } else {
                saidas += Number(mov.valor);
            }
        }
    });
    pegar("entradas-mes").textContent = formatarMoeda(entradas);
    pegar("saidas-mes").textContent = formatarMoeda(saidas);
    pegar("qtd-mes").textContent = quantidade;
    pegar("insight").textContent = "Você gastou " + formatarMoeda(saidas) + " neste mês.";

    const maior = Math.max(entradas, saidas, 1);
    pegar("barra-entradas").style.height = (entradas / maior * 100) + "%";
    pegar("barra-saidas").style.height = (saidas / maior * 100) + "%";

    // Mostra a lista das últimas movimentações
    const recentes = pegar("recentes");
    recentes.innerHTML = "";
    if (movimentacoes.length === 0) {
        recentes.innerHTML = '<li class="vazio">Nenhuma movimentação ainda.</li>';
    }
    // Mostra no máximo 3 movimentações
    for (let i = 0; i < movimentacoes.length && i < 3; i++) {
        recentes.appendChild(criarLinha(movimentacoes[i]));
    }

    mostrarNotificacoes();
}

// Mostra as notificações
function mostrarNotificacoes() {
    const lista = pegar("notificacoes");
    lista.innerHTML = "";

    if (notificacoes.length === 0) {
        lista.innerHTML = '<li class="vazio">Você não tem notificações.</li>';
        return;
    }

    notificacoes.forEach(function (notificacao) {
        const texto = document.createElement("div");
        texto.className = "item-texto";
        texto.appendChild(criar("span", "item-titulo", notificacao.mensagem));
        texto.appendChild(criar("span", "item-info", formatarData(notificacao.criado_em)));

        const item = document.createElement("li");
        item.className = "notificacao";
        item.appendChild(texto);

        if (notificacao.status === "lida") {
            item.className = "notificacao lida";
        } else {
            // Só notificações não lidas têm o botão
            const botao = criar("button", "botao", "Marcar como lida");
            botao.onclick = function () {
                marcarComoLida(notificacao.id);
            };
            item.appendChild(botao);
        }

        lista.appendChild(item);
    });
}

// Marca uma notificação como lida e carrega a lista de novo
function marcarComoLida(id) {
    buscar("/notificacoes/" + id + "/lida", { method: "PUT" })
        .then(carregarDados)
        .then(mostrarNotificacoes)
        .catch(mostrarErro);
}

function alternarValores() {
    document.body.classList.toggle("oculto");
}

function abrirMovimentacoes() {
    mostrarTela("movimentacoes");
    mostrarLista();
}

function mostrarLista() {
    const busca = pegar("busca").value.toLowerCase();
    const lista = pegar("lista-mov");
    lista.innerHTML = "";

    let entradas = 0;
    let saidas = 0;
    let exibidas = 0;

    movimentacoes.forEach(function (mov) {
        const texto = (mov.descricao + " " + (mov.categoria || "")).toLowerCase();
        if (filtroTipo !== "" && mov.tipo !== filtroTipo) {
            return;
        }
        if (!texto.includes(busca)) {
            return;
        }

        lista.appendChild(criarLinha(mov));
        exibidas++;
        if (mov.tipo === "entrada") {
            entradas += Number(mov.valor);
        } else {
            saidas += Number(mov.valor);
        }
    });

    if (exibidas === 0) {
        lista.innerHTML = '<li class="vazio">Nenhuma movimentação encontrada.</li>';
    }
    pegar("p-saldo").textContent = formatarMoeda(entradas - saidas);
    pegar("p-entradas").textContent = "+ " + formatarMoeda(entradas);
    pegar("p-saidas").textContent = "- " + formatarMoeda(saidas);
    pegar("rodape-lista").textContent = "Exibindo " + exibidas + " de " + movimentacoes.length + " movimentações";
}

function filtrar(tipo, botao) {
    filtroTipo = tipo;
    document.querySelectorAll(".chip").forEach(function (chip) {
        chip.classList.remove("ativo");
    });
    botao.classList.add("ativo");
    mostrarLista();
}

function abrirDetalhe(mov) {
    movimentoAtual = mov;
    mostrarTela("detalhe");

    const conta = contas.find(function (c) {
        return c.id === mov.conta_id;
    });

    pegar("d-avatar").textContent = iniciais(mov.descricao);
    pegar("d-nome").textContent = mov.descricao;
    pegar("d-sub").textContent = (mov.forma_pagamento || "Pagamento não informado") + ", " + (mov.categoria || "Sem categoria");
    pegar("d-valor").textContent = textoValor(mov);
    pegar("d-valor").className = "detalhe-valor valor " + mov.tipo;
    pegar("d-data").textContent = new Date(mov.data_movimentacao).toLocaleString("pt-BR");
    pegar("d-pagamento").textContent = mov.forma_pagamento || "Não informada";
    pegar("d-id").textContent = "#FS-" + mov.id;
    pegar("d-categoria").textContent = mov.categoria || "Sem categoria";
    pegar("d-conta").textContent = conta.nome;
}

function abrirRevisao() {
    mostrarTela("revisao");
    pegar("form-revisao").reset();
    pegar("contador").textContent = "0/240 caracteres";
    pegar("r-avatar").textContent = iniciais(movimentoAtual.descricao);
    pegar("r-nome").textContent = movimentoAtual.descricao;
    pegar("r-valor").textContent = textoValor(movimentoAtual);
}

function contarLetras(campo) {
    pegar("contador").textContent = campo.value.length + "/240 caracteres";
}

function enviarRevisao(evento) {
    evento.preventDefault();
    const form = pegar("form-revisao");

    let motivo = form.motivo.value;
    if (form.detalhes.value !== "") {
        motivo += ": " + form.detalhes.value;
    }

    enviar("/revisoes", {
        movimentacao_id: movimentoAtual.id,
        usuario_id: usuario.id,
        motivo: motivo
    }).then(function (revisao) {
        pegar("protocolo").textContent = "FS-" + revisao.id;
        pegar("hora-recebida").textContent = new Date().toLocaleString("pt-BR");
        pegar("copiar").textContent = "Copiar";
        mostrarTela("confirmacao");
        return carregarDados();
    }).catch(mostrarErro);
}

function copiarProtocolo() {
    navigator.clipboard.writeText(pegar("protocolo").textContent);
    pegar("copiar").textContent = "Copiado";
}

function preencherSelect(select, itens) {
    select.innerHTML = "";
    itens.forEach(function (item) {
        const opcao = criar("option", "", item.nome);
        opcao.value = item.id;
        select.appendChild(opcao);
    });
}

function abrirNova() {
    mostrarTela("nova");

    pegar("form-conta").hidden = contas.length > 0;
    pegar("form-mov").hidden = contas.length === 0;
    preencherSelect(pegar("form-mov").conta, contas);
    preencherSelect(pegar("form-mov").categoria, categorias);
}

function salvarConta(evento) {
    evento.preventDefault();
    const form = pegar("form-conta");

    enviar("/contas", {
        usuario_id: usuario.id,
        nome: form.nome.value,
        saldo: form.saldo.value || 0
    }).then(carregarDados).then(function () {
        form.reset();
        abrirNova();
    }).catch(mostrarErro);
}

function salvarMovimentacao(evento) {
    evento.preventDefault();
    const form = pegar("form-mov");

    enviar("/movimentacoes", {
        conta_id: form.conta.value,
        categoria_id: form.categoria.value,
        descricao: form.descricao.value,
        tipo: form.tipo.value,
        valor: form.valor.value,
        forma_pagamento: form.pagamento.value
    }).then(carregarDados).then(function () {
        form.reset();
        abrirMovimentacoes();
    }).catch(mostrarErro);
}

function salvarUsuario(evento) {
    evento.preventDefault();
    const form = pegar("form-usuario");

    enviar("/usuarios", {
        nome: form.nome.value,
        email: form.email.value,
        senha: form.senha.value
    }).then(function (novo) {
        entrar(novo);
        return carregarDados();
    }).then(abrirVisao).catch(mostrarErro);
}

function entrar(pessoa) {
    usuario = pessoa;
    pegar("usuario").textContent = usuario.nome;
    pegar("menu").hidden = false;
}

// Carrega a página inicial (sem usuários, abre o cadastro)
buscar("/usuarios")
    .then(function (usuarios) {
        if (usuarios.length === 0) {
            mostrarTela("cadastro");
            return;
        }

        entrar(usuarios[usuarios.length - 1]);
        return carregarDados().then(abrirVisao);
    })
    .catch(function () {
        mostrarErro(new Error("Não foi possível carregar os dados. Verifique se o servidor está rodando em " + API + "."));
    });
