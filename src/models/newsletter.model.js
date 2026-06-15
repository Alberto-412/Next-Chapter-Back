const pool = require("../config/conexion");

/**
 * Guardar un email en newsletter
 */
const insertMail = async (mail) => {

    const sql = `
        INSERT INTO newsletter
        (mail)
        VALUES (?)
    `;

    const [result] = await pool.query(sql, [mail]);

    return result;
};

module.exports = {
    insertMail
};