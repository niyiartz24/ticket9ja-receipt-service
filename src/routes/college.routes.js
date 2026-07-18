const router = require("express").Router();

const controller =
require("../controllers/college.controller");

const auth =
require("../auth/auth.middleware");

const permit =
require("../auth/permission.middleware");

router.use(auth);

router.use(
    permit("SUPER_ADMIN")
);

router.get("/", controller.getAll);

router.get("/:id", controller.getById);

router.get(
    "/organization/:organizationId",
    controller.getByOrganization
);

router.post("/", controller.create);

router.put("/:id", controller.update);

router.delete("/:id", controller.remove);

module.exports = router;