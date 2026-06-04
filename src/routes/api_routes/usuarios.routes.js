const user = require('../../controllers/usuarios.controller')
const { checkToken } = require('../../middleware/auth')

const router = require('express').Router()


router.post("/auth/register", user.register) // Registrar una nueva cuenta de usuario
router.post("/auth/login", user.login) // Iniciar sesión en la plataforma
router.post("/auth/logout", user.logout) // Cerrar sesión en la plataforma


router.get("/profile", checkToken, user.getProfile) // Obtener el perfil del usuario autenticado
router.put("/profile", checkToken, user.updateProfile) // Actualizar el perfil del usuario autenticado
router.put("/profile/password", checkToken, user.updatePassword) // Cambiar la contraseña del usuario autenticado
router.delete("/profile", checkToken, user.deleteProfile) // Eliminar la cuenta del usuario autenticado


router.get("/wishlist", checkToken, user.getWishlist) // Obtener la lista de deseos del usuario autenticado
router.post("/wishlist/:bookId", checkToken, user.addToWishlist) // Agregar un producto a la lista de deseos del usuario autenticado
router.delete("/wishlist/:bookId", checkToken, user.removeFromWishlist) // Eliminar un producto de la lista de deseos del usuario autenticado

router.get("/reviews", checkToken, user.getReviews) // Obtener las reseñas del usuario autenticado
router.post("/reviews", checkToken, user.addReview) // Agregar una reseña para un producto por parte del usuario autenticado
router.put("/reviews/:reviewId", checkToken, user.updateReview) // Actualizar una reseña existente del usuario autenticado
router.delete("/reviews/:reviewId", checkToken, user.deleteReview) // Eliminar una reseña del usuario autenticado

module.exports = router