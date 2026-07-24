const router = require("express").Router();

const auth =
require("../auth/auth.middleware");

const controller =
require("../controllers/wallet.controller");

router.use(auth);

router.get(
    "/",
    controller.getMine
);

module.exports = router;