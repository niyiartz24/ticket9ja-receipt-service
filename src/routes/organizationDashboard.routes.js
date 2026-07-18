const router = require("express").Router();

const controller =
    require("../controllers/organizationDashboard.controller");

const auth =
    require("../auth/auth.middleware");

const permit =
    require("../auth/permission.middleware");

router.use(auth);

router.use(

    permit(

        "ORGANIZATION_ADMIN",

        "FINANCE_OFFICER"

    )

);

router.get(

    "/overview",

    controller.overview

);

router.get(

    "/wallet",

    controller.wallet

);

router.get(

    "/transactions",

    controller.transactions

);

router.get(

    "/revenue/monthly",

    controller.monthlyRevenue

);

module.exports = router;