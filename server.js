const app = require("express")();
// libs
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const knex = require("knex");

const films = require("./controllers/tables/films");
const users = require("./controllers/tables/users");
//Database Setup
const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const filmname = "test";
const filmreleasedate = "01-01-2018";
const filmagerestriction = "18";
const filmlength = "120";
const filmlink = "test";
const filmprice = "500";
const filmdescription = "test";
const filmbudget = "100";
const filmposterlink = "test";
const filmvievs = 5;
const copyrightownerid = null;
const filmmonthlyviews = 5;

// db.select()
//   .table("genres")
//   .then(films => console.log(films));
// db("films")
//   .insert({
//     filmname,
//     filmreleasedate,
//     filmagerestriction,
//     filmlength,
//     filmlink,
//     filmprice,
//     filmposterlink,
//     filmdescription,
//     filmbudget
//   })
//   .returning("*")
//   .then(films => console.log(films));
// const filmid = 5;
// db.select("*")
//   .from("films")
//   // .where({ filmid })
//   .then(result => console.log(result));
// .then({res=>console.log(res)});
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

app.get("/films/:id", films.selectOne);
app.post("/films", films.insert);
app.delete("/films", films.remove);
app.put("/films", films.update);
app.get("/films", films.selectMany);

app.get("/users/:id", users.selectOne);
app.post("/users", users.insert);
app.delete("/users", users.remove);
app.put("/users", users.update);
app.get("/users", users.selectMany);

// Don't stop server in production
process.on("uncaughtException", err => {
  console.log(err);
});

app.listen(process.env.PORT || 8080, () => {
  console.log("server is running on port 8080");
});
