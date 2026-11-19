const mysql = require("mysql");

// A conexão NÃO informa "database" de propósito: na primeira execução o banco
// ainda pode não existir. O arquivo database/create.sql (executado por
// createTables.js) cria o banco finan_security e já faz o USE nele.
const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true
});

module.exports = connection;
