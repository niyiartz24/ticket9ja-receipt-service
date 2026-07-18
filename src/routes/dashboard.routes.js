const router = require("express").Router();

const controller =
    require("../controllers/dashboard.controller");

const auth =
    require("../auth/auth.middleware");

const permit =
    require("../auth/permission.middleware");

router.use(auth);

router.use(

    permit("SUPER_ADMIN")

);

router.get(

    "/overview",

    controller.overview

);

router.get(

    "/transactions",

    controller.recentTransactions

);

router.get(

    "/withdrawals",

    controller.recentWithdrawals

);

router.get(

    "/revenue/monthly",

    controller.monthlyRevenue

);

module.exports = router;