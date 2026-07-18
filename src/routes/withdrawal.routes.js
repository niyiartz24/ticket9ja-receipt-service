const router = require("express").Router();

const controller =
    require("../controllers/withdrawal.controller");

const auth =
    require("../auth/auth.middleware");

const permit =
    require("../auth/permission.middleware");

router.use(auth);

router.post(

    "/",

    permit(
        "ORGANIZATION_ADMIN",
        "FINANCE_OFFICER"
    ),

    controller.request

);

router.get(

    "/pending",

    permit("SUPER_ADMIN"),

    controller.getPending

);

router.get(

    "/history/:organizationId",

    permit(
        "SUPER_ADMIN",
        "ORGANIZATION_ADMIN",
        "FINANCE_OFFICER"
    ),

    controller.getOrganizationHistory

);

router.patch(

    "/:id/approve",

    permit("SUPER_ADMIN"),

    controller.approve

);

router.patch(

    "/:id/reject",

    permit("SUPER_ADMIN"),

    controller.reject

);

module.exports = router;