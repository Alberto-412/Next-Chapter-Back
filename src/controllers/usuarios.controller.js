const bcrypt = require('bcrypt');
const usuariosModel = require('../models/usuarios.model');
const { checkToken, tokenBlacklist } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const register = async (req, res) => {
    try {
        const { nombre, mail, contraseña } = req.body
        const selectedUser = await usuariosModel.selectByEmail(mail)
        if (selectedUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' })
        }
        //Encriptamos la contraseña
        const passHashed = bcrypt.hashSync(contraseña, 10)

        //Hacemos el insert en la BD
        const result = await usuariosModel.addUser(nombre, mail, passHashed)
        if (result.insertId) {
            return res.status(201).json({
                id: result.insertId,
                msj: "Usuario registrado correctamente"
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
}

const login = async (req, res) => {
    try {
        //  1. Recibimos el mail y la contraseña del usuario por el body
        const userBody = req.body

        // 2. Validamos que el email exista en la BD
        const selectedUser = await usuariosModel.selectByEmail(userBody.mail)
        if (!selectedUser) {
            return res.status(400).json({ message: 'El correo no está registrado' })
        }
        console.log(selectedUser[0])

        // 3. Validamos que la contraseña sea correcta
        const validPassword = bcrypt.compareSync(userBody.contraseña, selectedUser[0].contraseña)

        if (!validPassword) {
            return res.status(400).json({ message: 'Contraseña incorrecta' })
        }
        // Creamos los datos a enviar al token (sin la contraseña)
        const dataToken = {
            id: selectedUser[0].id,
            mail: selectedUser[0].mail,
            rol: selectedUser[0].rol
        }

        // 4. Creamos un token con los datos del usuario(jsonwebtoken)
        const token = generateToken(dataToken)

        // 5. Enviamos el token al front
        return res.status(200).json({ msj: "Login exitoso", token: token })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(400).json({ message: 'No se proporcionó token' })
        }

        tokenBlacklist.add(token)

        return res.status(200).json({ msj: "Logout exitoso" })
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const getMe = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Consultamos el perfil en la BD
        const result = await usuariosModel.getProfile(id)

        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        // 3. Enviamos respuesta al front
        return res.status(200).json(result)

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getProfile = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Consultamos el perfil en la BD
        const result = await usuariosModel.getProfile(id)

        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        // 3. Enviamos respuesta al front
        return res.status(200).json(result)

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const updateProfile = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const updatePassword = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const deleteProfile = async (req, res) => {

    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Eliminamos el usuario de la BD
        const result = await usuariosModel.deleteUser(id)

        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        // 3. Enviamos respuesta al front
        return res.status(200).json({ msj: "Usuario eliminado correctamente" })
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }

}
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getAddress = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const addAddress = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const updateAddress = async (req, res) => { }

const deleteAddress = async (req, res) => { }
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getWishlist = async (req, res) => { }

const addToWishlist = async (req, res) => { }

const removeFromWishlist = async (req, res) => { }
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getReviews = async (req, res) => { }

const addReview = async (req, res) => { }

const updateReview = async (req, res) => { }

const deleteReview = async (req, res) => { }




module.exports = { register, login, logout, getMe, getProfile, updateProfile, updatePassword, deleteProfile, getAddress, addAddress, updateAddress, deleteAddress, getWishlist, addToWishlist, removeFromWishlist, getReviews, addReview, updateReview, deleteReview }