const pool = require("")


const selectByEmail = async (mail) => {
    const select = "SELECT id, email, role, pass FROM users WHERE email = ?"
    const [result] = await pool.query(select, [mail])      // El select siempre devuelve un array

    if (result.length === 0) {
        return false
    }
    return result // es un array []
}

const addUser = async (nombre, mail, contraseña) => {
    const insert = "INSERT INTO users (nombre, mail, contraseña, rol) VALUES (?, ?, ?, ?)"
    const [result] = await pool.query(insert, [nombre, mail, contraseña, 'user'])
    if (result.affectedRows === 0) {
        return false
    }
    return result
}


module.exports = { selectByEmail, addUser }