const router = require("express").Router();

const controller =
require("../controllers/walletHistory.controller");

const auth = require("../auth/auth.middleware");

router.get(
    "/",
    auth,
    controller.list
);

module.exports = router;