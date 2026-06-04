const user = require('../../controllers/usuarios.controller')
const auth = require('../../middleware/auth')

const router = require('express').Router()


router.post("/auth/register", user.register) // Registrar una nueva cuenta de usuario
router.post("/auth/login", user.login) // Iniciar sesión en la plataforma
router.post("/auth/logout", user.logout) // Cerrar sesión en la plataforma


router.get("/profile", auth, user.getProfile) // Obtener el perfil del usuario autenticado
router.put("/profile", auth, user.updateProfile) // Actualizar el perfil del usuario autenticado
router.put("/profile/password", auth, user.updatePassword) // Cambiar la contraseña del usuario autenticado
router.delete("/profile", auth, user.deleteProfile) // Eliminar la cuenta del usuario autenticado


router.get("/wishlist", auth, user.getWishlist) // Obtener la lista de deseos del usuario autenticado
router.post("/wishlist/:bookId", auth, user.addToWishlist) // Agregar un producto a la lista de deseos del usuario autenticado
router.delete("/wishlist/:bookId", auth, user.removeFromWishlist) // Eliminar un producto de la lista de deseos del usuario autenticado

router.get("/reviews", auth, user.getReviews) // Obtener las reseñas del usuario autenticado
router.post("/reviews", auth, user.addReview) // Agregar una reseña para un producto por parte del usuario autenticado
router.put("/reviews/:reviewId", auth, user.updateReview) // Actualizar una reseña existente del usuario autenticado
router.delete("/reviews/:reviewId", auth, user.deleteReview) // Eliminar una reseña del usuario autenticado

module.exports = router