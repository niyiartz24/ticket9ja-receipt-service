const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const sessions = await prisma.academicSession.findMany({
    where: { active: true }
  });

  res.json({ sessions });
});

module.exports = router;