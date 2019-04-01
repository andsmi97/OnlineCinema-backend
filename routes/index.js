const router = require("express").Router();
const dbRouter = require("./db");
const filmsRouter = require("./films");
const peopleRouter = require("./people");
const authRouter = require("./auth");
const userRouter = require("./user");
const dashboardRouter = require("./dashboard");

router.use("/db", dbRouter);
router.use("/dashboard", dashboardRouter);
router.use("/films",  filmsRouter);
router.use("/people", peopleRouter);
router.use("/api/auth",  authRouter);
router.use("/api/user", userRouter);

module.exports = router;
