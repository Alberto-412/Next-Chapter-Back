const router = require("express").Router();

const newsletterController = require("../../controllers/newsletter.controller");

/**
 * POST /api/newsletter
 */
router.post(
    "/newsletter",
    newsletterController.createNewsletter
);

module.exports = router;