const express = require("express");
const dbRouter = require("./db");
const filmsRouter = require("./films");
const authRouter = require("./auth");
// const projectRouter = require("./Project");

const router = express.Router();

router.use("/db", dbRouter);
router.use("/films", filmsRouter);
router.use("/api/auth", authRouter);
module.exports = router;
