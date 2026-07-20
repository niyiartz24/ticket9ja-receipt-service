const router = require("express").Router();

const controller =
require("../controllers/dashboard.controller");

const auth =
require("../auth/auth.middleware");

router.use(auth);

router.get(
    "/summary",
    controller.summary
);

router.get(
    "/revenue-series",
    controller.revenueSeries
);

module.exports = router;