const router = require("express").Router();

const auth =
require("../auth/auth.middleware");

const controller =
require("../controllers/notification.controller");

router.use(auth);

router.get("/",controller.list);

router.patch(
    "/:id/read",
    controller.markRead
);

module.exports = router;