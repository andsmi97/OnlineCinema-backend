const express = require("express");
const router = express.Router();
const dbController = require("../../controllers/db");

router.get("/:filmid", dbController.selectFilm);

module.exports = router;
