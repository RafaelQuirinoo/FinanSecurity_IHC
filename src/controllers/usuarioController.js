const bcrypt = require("bcryptjs");
const query = require("../utils/query");

exports.criar = async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Informe nome, email e senha." });
    }
    if (String(senha).length < 6) {
        return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);
    const result = await query(
        "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
        [nome, email, senhaHash]
    );
    res.status(201).json({ id: result.insertId, nome, email });
};

exports.listar = async (req, res) => {
    const usuarios = await query(
        "SELECT id, nome, email, criado_em FROM usuarios ORDER BY id DESC"
    );
    res.json(usuarios);
};