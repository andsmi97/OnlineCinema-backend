const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const insert = (req, res) => {
  const { genrename } = req.body;
  db("genres")
    .insert({ genrename })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const update = (req, res) => {
  const { genreid, genrename } = req.body;
  db("genres")
    .where({ genreid })
    .update({ genrename })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const remove = (req, res) => {
  const { genreid } = req.body;
  db("genres")
    .where({ genreid })
    .del()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

const selectMany = (req, res) => {
  db.select("*")
    .from("genres")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

module.exports = {
  insert,
  remove,
  update,
  selectMany
};
