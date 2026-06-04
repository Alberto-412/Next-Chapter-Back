const adminModel = require('../models/admin.model');

const validarUsuario = async (req, res) => {
    try {
        const { userId } = req.params
        const result = await adminModel.validarUsuario(userId)
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }
        return res.status(200).json({ msj: "Usuario validado correctamente" })
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const getUsuariosPendientes = async (req, res) => {
    try {
        const result = await adminModel.getUsuariosPendientes()
        if (!result) {
            return res.status(404).json({ message: 'No hay usuarios pendientes de validación' })
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const updateRol = async (req, res) => {
    try {
        const { userId } = req.params
        const { rol } = req.body
        if (rol !== 'admin' && rol !== 'cliente') {
            return res.status(400).json({ message: 'Rol no válido' })
        }
        const result = await adminModel.updateRol(userId, rol)
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }
        return res.status(200).json({ msj: "Rol actualizado correctamente" })
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

const getUsuarioById = async (req, res) => {
    try {
        const { userId } = req.params
        const result = await adminModel.getUsuarioById(userId)

        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        return res.status(200).json(result)

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

module.exports = { validarUsuario, getUsuariosPendientes, updateRol, getUsuarioById }