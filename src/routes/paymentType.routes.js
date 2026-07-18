const router = require("express").Router();

const controller =
    require("../controllers/paymentType.controller");

const auth =
    require("../auth/auth.middleware");

const permit =
    require("../auth/permission.middleware");

    console.log(controller);
console.log(typeof auth);
console.log(typeof permit);

router.use(auth);

router.use(
    permit("SUPER_ADMIN")
);

router.get("/", controller.getAll);

router.get(
    "/organization/:organizationId",
    controller.getByOrganization
);

router.get(
    "/college/:collegeId",
    controller.getByCollege
);

router.get(
    "/department/:departmentId",
    controller.getByDepartment
);

router.get(
    "/:id/calculate",
    controller.calculate
);

router.get("/:id", controller.getById);

router.post("/", controller.create);

router.put("/:id", controller.update);

router.delete("/:id", controller.remove);

module.exports = router;