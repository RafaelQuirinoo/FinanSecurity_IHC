module.exports = function asyncRoute(handler) {
    return function (req, res) {
        Promise.resolve(handler(req, res)).catch((error) => {
            // Erros comuns do MySQL viram respostas claras em vez de 500 genérico.
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ erro: "Registro duplicado (e-mail ou revisão já cadastrados)." });
            }
            if (error.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(400).json({ erro: "Referência inválida: usuário, conta, categoria ou movimentação inexistente." });
            }
            console.error(error);
            res.status(500).json({ erro: "Erro interno do servidor." });
        });
    };
};
