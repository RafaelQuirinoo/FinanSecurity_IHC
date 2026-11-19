const query = require("../utils/query");

exports.criar = async (req, res) => {
    const { movimentacao_id, usuario_id, motivo } = req.body;
    if (!movimentacao_id || !usuario_id || !motivo) {
        return res.status(400).json({ erro: "Informe movimentacao_id, usuario_id e motivo." });
    }
    const result = await query(
        "INSERT INTO revisoes (movimentacao_id, usuario_id, motivo) VALUES (?, ?, ?)",
        [movimentacao_id, usuario_id, motivo]
    );
    await query(
        "INSERT INTO notificacoes (usuario_id, mensagem) VALUES (?, ?)",
        [usuario_id, "Sua solicitação de revisão foi registrada e está pendente de análise."]
    );
    res.status(201).json({ id: result.insertId, status: "pendente" });
};

exports.listar = async (req, res) => {
    let sql = `SELECT r.*, m.descricao AS movimentacao
        FROM revisoes r JOIN movimentacoes m ON m.id = r.movimentacao_id`;
    const params = [];
    if (req.query.usuario_id) {
        sql += " WHERE r.usuario_id = ?";
        params.push(req.query.usuario_id);
    }
    sql += " ORDER BY r.criado_em DESC";
    res.json(await query(sql, params));
};