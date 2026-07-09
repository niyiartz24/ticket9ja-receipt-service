const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { organizationId } = req.query;

  const departments = await prisma.department.findMany({
    where: {
      organizationId,
      isActive: true
    }
  });

  res.json({ departments });
});

module.exports = router;