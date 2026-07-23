const router = require("express").Router();

const auth = require("../auth/auth.middleware");
const permit = require("../auth/permission.middleware");
const controller = require("../controllers/withdrawal.controller");

router.use(auth);

/*
|--------------------------------------------------------------------------
| Everyone (returns only their own withdrawals)
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    controller.getMine
);

router.post(
    "/",
    controller.request
);

/*
|--------------------------------------------------------------------------
| Super Admin only
|--------------------------------------------------------------------------
*/

router.get(
    "/pending",
    permit("SUPER_ADMIN"),
    controller.getPending
);

router.patch(
    "/:type/:id/approve",
    permit("SUPER_ADMIN"),
    controller.approve
);

router.patch(
    "/:type/:id/reject",
    permit("SUPER_ADMIN"),
    controller.reject
);

module.exports = router;