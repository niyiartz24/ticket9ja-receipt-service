const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.get("/", async (req, res) => {

    const count = await prisma.transaction.count();

    res.json({
        success: true,
        transactions: count
    });

});

module.exports = router;