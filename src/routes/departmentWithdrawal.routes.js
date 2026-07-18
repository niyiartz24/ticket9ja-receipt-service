const router = require("express").Router();

const controller =
    require("../controllers/departmentWithdrawal.controller");

const auth =
    require("../auth/auth.middleware");

const permit =
    require("../auth/permission.middleware");

router.use(auth);

router.post(
    "/request",
    permit("DEPARTMENT_ADMIN"),
    controller.request
);

router.get(
    "/history",
    permit("DEPARTMENT_ADMIN"),
    controller.history
);

router.get(
    "/pending",
    permit("SUPER_ADMIN"),
    controller.pending
);

router.put(
    "/approve/:id",
    permit("SUPER_ADMIN"),
    controller.approve
);

router.put(
    "/reject/:id",
    permit("SUPER_ADMIN"),
    controller.reject
);

module.exports = router;