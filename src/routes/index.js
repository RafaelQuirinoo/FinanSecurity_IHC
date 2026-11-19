const express = require("express");
const asyncRoute = require("../utils/asyncRoute");
const usuarios = require("../controllers/usuarioController");
const contas = require("../controllers/contaController");
const categorias = require("../controllers/categoriaController");
const movimentacoes = require("../controllers/movimentacaoController");
const revisoes = require("../controllers/revisaoController");
const notificacoes = require("../controllers/notificacaoController");

const router = express.Router();

router.post("/usuarios", asyncRoute(usuarios.criar));
router.get("/usuarios", asyncRoute(usuarios.listar));

router.post("/contas", asyncRoute(contas.criar));
router.get("/contas", asyncRoute(contas.listar));

router.get("/categorias", asyncRoute(categorias.listar));

router.post("/movimentacoes", asyncRoute(movimentacoes.criar));
router.get("/movimentacoes", asyncRoute(movimentacoes.listar));
router.get("/movimentacoes/resumo", asyncRoute(movimentacoes.resumo));
router.get("/movimentacoes/:id", asyncRoute(movimentacoes.detalhar));

router.post("/revisoes", asyncRoute(revisoes.criar));
router.get("/revisoes", asyncRoute(revisoes.listar));

router.get("/notificacoes", asyncRoute(notificacoes.listar));
router.put("/notificacoes/:id/lida", asyncRoute(notificacoes.marcarComoLida));

module.exports = router;