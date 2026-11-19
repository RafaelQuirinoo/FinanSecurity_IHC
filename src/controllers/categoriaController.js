const query = require("../utils/query");

exports.listar = async (req, res) => {
    res.json(await query("SELECT id, nome FROM categorias ORDER BY nome"));
};