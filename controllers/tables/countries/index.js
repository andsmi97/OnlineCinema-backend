const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const insert = (req, res) => {
  const { countryname } = req.body;
  db("countries")
    .insert({ countryname })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const update = (req, res) => {
  const { countryid, countryname } = req.body;
  db("countries")
    .where({ countryid })
    .update({ countryname })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const remove = (req, res) => {
  const { countryid } = req.body;
  db("countries")
    .where({ countryid })
    .del()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

const selectMany = (req, res) => {
  db.select("*")
    .from("countries")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

module.exports = {
  insert,
  remove,
  update,
  selectMany
};
