const router = require("express").Router();

const auth =
require("../auth/auth.middleware");

const permit =
require("../auth/permission.middleware");

const controller =
require("../controllers/invitation.controller");

router.get(
    "/verify/:token",
    controller.verify
);

router.post(
    "/accept",
    controller.accept
);

router.use(auth);

/*
SUPER_ADMIN
ORGANIZATION_ADMIN
COLLEGE_ADMIN
can invite users.
*/
router.post(

    "/",

    permit(

        "SUPER_ADMIN",

        "ORGANIZATION_ADMIN",

        "COLLEGE_ADMIN"

    ),

    controller.create

);

router.get(

    "/",

    permit("SUPER_ADMIN"),

    controller.list

);

/*
Public
*/
router.get(

    "/verify/:token",

    controller.verify

);

router.post(

    "/accept",

    controller.accept

);

router.delete(

    "/:id",

    permit("SUPER_ADMIN"),

    controller.cancel

);

module.exports = router;