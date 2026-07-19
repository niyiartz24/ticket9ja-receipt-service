const router = require("express").Router();

const publicController = require("../controllers/public.controller");
const paymentController = require("../controllers/payment.controller");

// Public lookup endpoints
router.get("/organizations", publicController.organizations);

router.get(
    "/organizations/:organizationId/colleges",
    publicController.colleges
);

router.get(
    "/organizations/:organizationId/departments",
    publicController.departments
);

router.get(
    "/organizations/:organizationId/payment-types",
    publicController.paymentTypes
);

router.get(
    "/sessions",
    publicController.sessions
);

// Public payment
router.post(
    "/payments/initiate",
    paymentController.initiate
);

router.get(
    "/payments/verify/:reference",
    paymentController.verify
);

module.exports = router;