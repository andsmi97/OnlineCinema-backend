const express = require("express");
const router = express.Router();
const dbController = require("../../controllers/db");

router.get("/film/:filmid", dbController.selectFilm);
router.post("/cards/:offset", dbController.filmsCards);
module.exports = router;
