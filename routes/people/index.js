const express = require("express");
const router = express.Router();
const dbController = require("../../controllers/db");

router.get("/:personid", dbController.selectPerson);

module.exports = router;
