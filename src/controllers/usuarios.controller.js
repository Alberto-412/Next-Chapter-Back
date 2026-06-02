const bcript = require('bcrypt');
const usuariosModel = require('../models/usuarios.model');
const { checkToken } = require('../../middleware/auth')
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
        const passHashed = bcript.hashSync(contraseña, 10)

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
        const validPassword = bcript.compareSync(userBody.contraseña, selectedUser[0].contraseña)

        if (!validPassword) {
            return res.status(400).json({ message: 'Contraseña incorrecta' })
        }
        // Creamos los datos a enviar al token
        const dataToken = selectedUser[0]

        // 4. Creamos un token con los datos del usuario(jsonwebtoken)
        const token = createToken(dataToken)

        // 5. Enviamos el token al front
        return res.status(200).json({ msj: "Login exitoso", token: token })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const logout = async (req, res) => { }

const getMe = async (req, res) => { }
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getProfile = async (req, res) => { }

const updateProfile = async (req, res) => { }

const updatePassword = async (req, res) => { }

const deleteProfile = async (req, res) => { }
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getAddress = async (req, res) => { }

const addAddress = async (req, res) => { }

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