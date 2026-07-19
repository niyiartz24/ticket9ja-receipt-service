const router = require("express").Router();

const controller =
require("../controllers/organization.controller");

const auth =
require("../auth/auth.middleware");

const permit =
require("../auth/permission.middleware");

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
    "/public",
    controller.getPublic
);

router.get(
    "/public/:id",
    controller.getPublicById
);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.use(auth);

router.use(
    permit("SUPER_ADMIN")
);

router.get("/", controller.getAll);

router.get("/:id", controller.getById);

router.post("/", controller.create);

router.put("/:id", controller.update);

router.delete("/:id", controller.remove);

module.exports = router;