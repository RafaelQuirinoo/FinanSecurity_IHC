const query = require("../utils/query");

exports.criar = async (req, res) => {
    const { usuario_id, nome, saldo = 0 } = req.body;
    if (!usuario_id || !nome || Number(saldo) < 0 || !Number.isFinite(Number(saldo))) {
        return res.status(400).json({ erro: "Informe usuario_id, nome e um saldo válido." });
    }
    const result = await query(
        "INSERT INTO contas (usuario_id, nome, saldo) VALUES (?, ?, ?)",
        [usuario_id, nome, saldo]
    );
    res.status(201).json({ id: result.insertId, usuario_id, nome, saldo });
};

exports.listar = async (req, res) => {
    let sql = "SELECT c.*, u.nome AS usuario_nome FROM contas c JOIN usuarios u ON u.id = c.usuario_id";
    const params = [];
    if (req.query.usuario_id) {
        sql += " WHERE c.usuario_id = ?";
        params.push(req.query.usuario_id);
    }
    sql += " ORDER BY c.id DESC";
    res.json(await query(sql, params));
};