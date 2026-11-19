// Endereço da API e usuário (ainda sem login, então fica fixo)
const API = "http://localhost:3001/api";
const USUARIO_ID = 1;

// Converte valor do banco
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte data do banco
function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
}

// Faz a busca de dados na API e devolve o resultado já em JSON
function buscar(caminho, opcoes) {
    return fetch(API + caminho, opcoes).then(function (resposta) {
        if (!resposta.ok) {
            throw new Error("Falha na requisição");
        }
        return resposta.json();
    });
}

// Mostra o saldo, as entradas e as despesas
function mostrarResumo(resumo) {
    document.getElementById("saldo").textContent = formatarMoeda(resumo.saldo);
    document.getElementById("entradas").textContent = formatarMoeda(resumo.entradas);
    document.getElementById("despesas").textContent = formatarMoeda(resumo.despesas);
}

// Mostra a lista das últimas movimentações
function mostrarMovimentacoes(movimentacoes) {
    const lista = document.getElementById("movimentacoes");
    lista.innerHTML = "";

    if (movimentacoes.length === 0) {
        lista.innerHTML = '<li class="vazio">Nenhuma movimentação ainda.</li>';
        return;
    }

    // Mostra no máximo 8 movimentações
    for (let i = 0; i < movimentacoes.length && i < 8; i++) {
        const mov = movimentacoes[i];

        const titulo = document.createElement("span");
        titulo.className = "item-titulo";
        titulo.textContent = mov.descricao;

        const info = document.createElement("span");
        info.className = "item-info";
        info.textContent = (mov.categoria || "Sem categoria") + ", " + formatarData(mov.data_movimentacao);

        const texto = document.createElement("div");
        texto.className = "item-texto";
        texto.appendChild(titulo);
        texto.appendChild(info);

        const valor = document.createElement("span");
        if (mov.tipo === "entrada") {
            valor.className = "item-valor entrada";
            valor.textContent = "+ " + formatarMoeda(mov.valor);
        } else {
            valor.className = "item-valor despesa";
            valor.textContent = "- " + formatarMoeda(mov.valor);
        }

        const linha = document.createElement("div");
        linha.className = "item";
        linha.appendChild(texto);
        linha.appendChild(valor);

        const item = document.createElement("li");
        item.appendChild(linha);
        lista.appendChild(item);
    }
}

// Marca uma notificação como lida e carrega a lista de novo
function marcarComoLida(id) {
    buscar("/notificacoes/" + id + "/lida", { method: "PUT" }).then(carregarNotificacoes);
}

// Busca e mostra as notificações
function carregarNotificacoes() {
    buscar("/notificacoes?usuario_id=" + USUARIO_ID).then(function (notificacoes) {
        const lista = document.getElementById("notificacoes");
        lista.innerHTML = "";

        if (notificacoes.length === 0) {
            lista.innerHTML = '<li class="vazio">Você não tem notificações.</li>';
            return;
        }

        notificacoes.forEach(function (notificacao) {
            const titulo = document.createElement("span");
            titulo.className = "item-titulo";
            titulo.textContent = notificacao.mensagem;

            const info = document.createElement("span");
            info.className = "item-info";
            info.textContent = formatarData(notificacao.criado_em);

            const texto = document.createElement("div");
            texto.className = "item-texto";
            texto.appendChild(titulo);
            texto.appendChild(info);

            const item = document.createElement("li");
            item.className = "notificacao";
            item.appendChild(texto);

            if (notificacao.status === "lida") {
                item.className = "notificacao lida";
            } else {
                // Só notificações não lidas têm o botão
                const botao = document.createElement("button");
                botao.className = "botao";
                botao.textContent = "Marcar como lida";
                botao.onclick = function () {
                    marcarComoLida(notificacao.id);
                };
                item.appendChild(botao);
            }

            lista.appendChild(item);
        });
    });
}

// Mostra a mensagem de erro vermelha
function mostrarErro() {
    const erro = document.getElementById("erro");
    erro.textContent = "Não foi possível carregar os dados. Verifique se o servidor está rodando em " + API + ".";
    erro.hidden = false;
}

// Carrega a página inicial
buscar("/movimentacoes/resumo?usuario_id=" + USUARIO_ID)
    .then(function (resumo) {
        mostrarResumo(resumo);
        return buscar("/movimentacoes?usuario_id=" + USUARIO_ID);
    })
    .then(function (movimentacoes) {
        mostrarMovimentacoes(movimentacoes);
        carregarNotificacoes();
    })
    .catch(mostrarErro);