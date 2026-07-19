const router = require("express").Router();

const controller = require("../controllers/transaction.controller");
const auth = require("../auth/auth.middleware");

router.use(auth);

router.get("/", controller.getAll);

router.get("/:id", controller.getOne);

module.exports = router;