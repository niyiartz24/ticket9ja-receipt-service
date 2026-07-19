const router = require("express").Router();

const auth = require("../auth/auth.middleware");
const permit = require("../auth/permission.middleware");

const controller = require("../controllers/platform.controller");

router.use(auth);

router.use(
    permit("SUPER_ADMIN")
);

router.get(
    "/revenue",
    controller.revenue
);

router.get(
    "/fees",
    controller.fees
);

module.exports = router;