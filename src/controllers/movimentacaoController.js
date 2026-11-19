const query = require("../utils/query");

exports.criar = async (req, res) => {
    const { conta_id, categoria_id = null, descricao, tipo, valor, data_movimentacao, forma_pagamento } = req.body;
    if (!conta_id || !descricao || !["entrada", "despesa"].includes(tipo) ||
        !Number.isFinite(Number(valor)) || Number(valor) <= 0) {
        return res.status(400).json({ erro: "Informe conta, descrição, tipo válido e valor maior que zero." });
    }

    const contas = await query("SELECT usuario_id FROM contas WHERE id = ?", [conta_id]);
    if (!contas.length) return res.status(404).json({ erro: "Conta não encontrada." });

    const result = await query(
        `INSERT INTO movimentacoes
        (conta_id, categoria_id, descricao, tipo, valor, data_movimentacao, forma_pagamento)
        VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?)`,
        [conta_id, categoria_id, descricao, tipo, valor, data_movimentacao || null, forma_pagamento || null]
    );

    const operacao = tipo === "entrada" ? Number(valor) : -Number(valor);
    await query("UPDATE contas SET saldo = saldo + ? WHERE id = ?", [operacao, conta_id]);

    const verbo = tipo === "entrada" ? "Entrada" : "Despesa";
    await query(
        "INSERT INTO notificacoes (usuario_id, mensagem) VALUES (?, ?)",
        [contas[0].usuario_id, `${verbo} de R$ ${Number(valor).toFixed(2).replace(".", ",")} registrada: ${descricao}`.slice(0, 500)]
    );

    res.status(201).json({ id: result.insertId, mensagem: "Movimentação cadastrada." });
};

exports.listar = async (req, res) => {
    let sql = `SELECT m.*, c.nome AS categoria
        FROM movimentacoes m
        LEFT JOIN categorias c ON c.id = m.categoria_id
        WHERE 1 = 1`;
    const params = [];

    if (req.query.usuario_id) {
        sql += " AND m.conta_id IN (SELECT id FROM contas WHERE usuario_id = ?)";
        params.push(req.query.usuario_id);
    }
    if (req.query.conta_id) {
        sql += " AND m.conta_id = ?";
        params.push(req.query.conta_id);
    }
    if (req.query.tipo && ["entrada", "despesa"].includes(req.query.tipo)) {
        sql += " AND m.tipo = ?";
        params.push(req.query.tipo);
    }
    if (req.query.categoria_id) {
        sql += " AND m.categoria_id = ?";
        params.push(req.query.categoria_id);
    }
    if (req.query.busca) {
        sql += " AND m.descricao LIKE ?";
        params.push(`%${req.query.busca}%`);
    }
    if (req.query.data_inicio) {
        sql += " AND DATE(m.data_movimentacao) >= ?";
        params.push(req.query.data_inicio);
    }
    if (req.query.data_fim) {
        sql += " AND DATE(m.data_movimentacao) <= ?";
        params.push(req.query.data_fim);
    }

    sql += " ORDER BY m.data_movimentacao DESC";
    res.json(await query(sql, params));
};

exports.detalhar = async (req, res) => {
    const rows = await query(
        `SELECT m.*, c.nome AS categoria, ct.nome AS conta_nome
        FROM movimentacoes m
        LEFT JOIN categorias c ON c.id = m.categoria_id
        JOIN contas ct ON ct.id = m.conta_id
        WHERE m.id = ?`,
        [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: "Movimentação não encontrada." });
    res.json(rows[0]);
};

exports.resumo = async (req, res) => {
    const filtro = req.query.usuario_id ? " WHERE c.usuario_id = ?" : "";
    const params = req.query.usuario_id ? [req.query.usuario_id] : [];
    const rows = await query(
        `SELECT
            COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN m.valor ELSE 0 END), 0) AS entradas,
            COALESCE(SUM(CASE WHEN m.tipo = 'despesa' THEN m.valor ELSE 0 END), 0) AS despesas,
            COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN m.valor ELSE -m.valor END), 0) AS saldo_movimentacoes
        FROM movimentacoes m
        JOIN contas c ON c.id = m.conta_id${filtro}`,
        params
    );
    const contas = await query(
        `SELECT COALESCE(SUM(saldo), 0) AS saldo FROM contas${req.query.usuario_id ? " WHERE usuario_id = ?" : ""}`,
        params
    );
    res.json({ ...rows[0], saldo: contas[0].saldo });
};