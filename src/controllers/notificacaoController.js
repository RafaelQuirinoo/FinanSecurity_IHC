const query = require("../utils/query");

exports.listar = async (req, res) => {
    if (!req.query.usuario_id) {
        return res.status(400).json({ erro: "Informe usuario_id na consulta." });
    }
    res.json(await query(
        "SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criado_em DESC",
        [req.query.usuario_id]
    ));
};

exports.marcarComoLida = async (req, res) => {
    const result = await query(
        "UPDATE notificacoes SET status = 'lida' WHERE id = ?",
        [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ erro: "Notificação não encontrada." });
    res.json({ mensagem: "Notificação marcada como lida." });
};