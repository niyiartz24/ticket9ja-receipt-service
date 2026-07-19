const router = require("express").Router();

const auth =
require("../auth/auth.middleware");

const permit =
require("../auth/permission.middleware");

const controller =
require("../controllers/withdrawal.controller");

router.use(auth);

router.use(
    permit("SUPER_ADMIN")
);

router.get(
    "/",
    controller.getAll
);

router.patch(
    "/:type/:id/approve",
    controller.approve
);

router.patch(
    "/:type/:id/reject",
    controller.reject
);

module.exports = router;