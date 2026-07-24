const router = require("express").Router();

const auth = require("../auth/auth.middleware");
const permit = require("../auth/permission.middleware");
const controller = require("../controllers/bankAccount.controller");

router.use(auth);

// current tenant's bank accounts
router.get("/", controller.getMine);

// create or update bank account
router.put("/", controller.save);

// verify account details
router.get("/banks", controller.getBanks);

router.post("/verify", controller.verify);

// set default account
router.patch("/:id/default", controller.makeDefault);

// delete account
router.delete("/:id", controller.remove);

// Super Admin (optional)
router.get(
    "/all",
    permit("SUPER_ADMIN"),
    controller.getAll
);



module.exports = router;