const router = require("express").Router();

const walletController =
require("../controllers/wallet.controller");

const auth =
require("../auth/auth.middleware");

router.get(
    "/",
    auth,
    walletController.getWallet
);

module.exports = router;