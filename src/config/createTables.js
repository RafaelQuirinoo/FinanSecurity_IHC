const fs = require("fs");
const path = require("path");

module.exports = function createTables(connection, callback) {
    const sql = fs.readFileSync(
        path.join(__dirname, "../../database/create.sql"),
        "utf8"
    );

    connection.query(sql, (error) => callback(error));
};