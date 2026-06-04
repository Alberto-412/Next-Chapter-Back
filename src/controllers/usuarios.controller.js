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

        // 3. Validamos que el usuario esté validado por un admin
        if (!selectedUser[0].validado) {
            return res.status(403).json({ message: 'Tu cuenta está pendiente de validación por un administrador' })
        }

        // 4. Validamos que la contraseña sea correcta
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

        // 5. Creamos un token con los datos del usuario(jsonwebtoken)
        const token = generateToken(dataToken)

        // 6. Enviamos el token al front
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
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Obtenemos los datos del body
        const { nombre, mail } = req.body

        // 3. Actualizamos el perfil en la BD
        const result = await usuariosModel.updateProfile(id, nombre, mail)

        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        // 4. Enviamos respuesta al front
        return res.status(200).json({ msj: "Perfil actualizado correctamente" })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const updatePassword = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Obtenemos las contraseñas del body
        const { contraseñaActual, contraseñaNueva } = req.body

        // 3. Consultamos el usuario en la BD
        const user = await usuariosModel.getUserById(id)
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        // 4. Validamos que la contraseña actual sea correcta
        const validPassword = bcrypt.compareSync(contraseñaActual, user.contraseña)
        if (!validPassword) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' })
        }

        // 5. Encriptamos la nueva contraseña
        const passHashed = bcrypt.hashSync(contraseñaNueva, 10)

        // 6. Actualizamos la contraseña en la BD
        const result = await usuariosModel.updatePassword(id, passHashed)
        if (!result) {
            return res.status(500).json({ message: 'Error al actualizar la contraseña' })
        }

        // 7. Enviamos respuesta al front
        return res.status(200).json({ msj: "Contraseña actualizada correctamente" })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const deleteProfile = async (req, res) => {

    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id
        // 1.5 Validamos que el usuario no tenga pedidos activos
        const pedidosActivos = await usuariosModel.getPedidosActivos(id)
        if (pedidosActivos.length > 0) {
            return res.status(400).json({ message: 'No puedes darte de baja con pedidos en curso' })
        }
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
// const getAddress = async (req, res) => {}

// const addAddress = async (req, res) => {}

// const updateAddress = async (req, res) => { }

// const deleteAddress = async (req, res) => { }
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getWishlist = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Consultamos la wishlist en la BD
        const result = await usuariosModel.getWishlist(id)

        if (!result) {
            return res.status(404).json({ message: 'No tienes libros en tu lista de deseos' })
        }

        // 3. Enviamos respuesta al front
        return res.status(200).json(result)

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const addToWishlist = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Obtenemos el id del libro de los params
        const { bookId } = req.params

        // 3. Añadimos el libro a la wishlist
        const result = await usuariosModel.addToWishlist(id, bookId)

        if (!result) {
            return res.status(500).json({ message: 'Error al añadir el libro a la lista de deseos' })
        }

        // 4. Enviamos respuesta al front
        return res.status(201).json({ msj: "Libro añadido a la lista de deseos" })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const removeFromWishlist = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Obtenemos el id del libro de los params
        const { bookId } = req.params

        // 3. Eliminamos el libro de la wishlist
        const result = await usuariosModel.removeFromWishlist(id, bookId)

        if (!result) {
            return res.status(404).json({ message: 'El libro no está en tu lista de deseos' })
        }

        // 4. Enviamos respuesta al front
        return res.status(200).json({ msj: "Libro eliminado de la lista de deseos" })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}
// ---------------------------------- //
//                                    //
// ---------------------------------- //
const getReviews = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Consultamos las reviews en la BD
        const result = await usuariosModel.getReviews(id)

        if (!result) {
            return res.status(404).json({ message: 'No tienes reseñas' })
        }

        // 3. Enviamos respuesta al front
        return res.status(200).json(result)

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const addReview = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Obtenemos los datos del body
        const { producto_id, calificacion, comentario } = req.body

        // 3. Validamos que la calificacion esté entre 1 y 5
        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' })
        }

        // 4. Publicamos la review en la BD
        const result = await usuariosModel.addReview(id, producto_id, calificacion, comentario)

        if (!result) {
            return res.status(500).json({ message: 'Error al publicar la reseña' })
        }

        // 5. Enviamos respuesta al front
        return res.status(201).json({ msj: "Reseña publicada correctamente" })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const updateReview = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Obtenemos el id de la review de los params
        const { reviewId } = req.params

        // 3. Obtenemos los datos del body
        const { calificacion, comentario } = req.body

        // 4. Validamos que la calificacion esté entre 1 y 5
        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' })
        }

        // 5. Actualizamos la review en la BD
        const result = await usuariosModel.updateReview(reviewId, id, calificacion, comentario)

        if (!result) {
            return res.status(404).json({ message: 'Reseña no encontrada' })
        }

        // 6. Enviamos respuesta al front
        return res.status(200).json({ msj: "Reseña actualizada correctamente" })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const deleteReview = async (req, res) => {
    try {
        // 1. Obtenemos el id del usuario del token
        const id = req.user.id

        // 2. Obtenemos el id de la review de los params
        const { reviewId } = req.params

        // 3. Eliminamos la review en la BD
        const result = await usuariosModel.deleteReview(reviewId, id)

        if (!result) {
            return res.status(404).json({ message: 'Reseña no encontrada' })
        }

        // 4. Enviamos respuesta al front
        return res.status(200).json({ msj: "Reseña eliminada correctamente" })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}



module.exports = { register, login, logout, getMe, getProfile, updateProfile, updatePassword, deleteProfile, getWishlist, addToWishlist, removeFromWishlist, getReviews, addReview, updateReview, deleteReview }