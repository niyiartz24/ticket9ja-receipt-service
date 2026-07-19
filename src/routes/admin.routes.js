const router = require("express").Router();

const auth = require("../auth/auth.middleware");
const permit = require("../auth/permission.middleware");

const controller = require("../controllers/admin.controller");

router.use(auth);

router.get(
    "/users",
    permit("SUPER_ADMIN"),
    controller.users
);

module.exports = router;