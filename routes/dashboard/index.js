const express = require("express");
const router = express.Router();
const dbController = require("../../controllers/dashboard");
router.get("/data", dbController.dashboardData);
module.exports = router;
