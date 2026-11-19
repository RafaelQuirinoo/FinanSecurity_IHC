require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connection = require("./src/config/database");
const createTables = require("./src/config/createTables");
const apiRoutes = require("./src/routes");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
    res.json({
        sistema: "Finan Security",
        status: "API funcionando",
        endpoints: "/api"
    });
});

app.use((req, res) => {
    res.status(404).json({ erro: "Rota não encontrada." });
});

connection.connect((error) => {
    if (error) {
        console.error("Erro ao conectar ao MySQL:", error.message);
        process.exit(1);
    }

    console.log("Conectado ao MySQL.");
    createTables(connection, (tableError) => {
        if (tableError) {
            console.error("Erro ao preparar as tabelas:", tableError.message);
            process.exit(1);
        }

        app.listen(port, () => {
            console.log(`Finan Security rodando em http://localhost:${port}`);
        });
    });
});

module.exports = app;