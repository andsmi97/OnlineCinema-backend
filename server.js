const app = require("express")();
// libs
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const knex = require("knex");

//Database Setup
const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const FilmName = "test";
const FilmReleaseDate = "01-01-2018";
const FilmAgeRestriction = "18";
const FilmLength = "120";
const FilmLink = "test";
const FilmPrice = "500";
const FilmDescription = "test";
const FilmBudget = "100";
const FilmPosterLink = "test";

db.select()
  .table("genres")
  .then(films => console.log(films));
// db("films")
//   .insert({
//     FilmName,
//     FilmReleaseDate,
//     FilmAgeRestriction,
//     FilmLength,
//     FilmLink,
//     FilmPrice,
//     FilmPosterLink,
//     FilmDescription,
//     FilmBudget
//   })
//   .then(films => console.log(films));
// Middleware
app.use(bodyParser.json());
const whitelist = ["http://localhost:3000", "https://lesnayagavan.ru"];
const corsOptions = {
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

// app.use(cors(corsOptions));
app.use(cors());
app.use(morgan("combined"));
app.use(helmet());
app.use(express.json());

// Don't stop server in production
process.on("uncaughtException", err => {
  console.log(err);
});

app.listen(process.env.PORT || 8080, () => {
  console.log("server is running on port 8080");
});
