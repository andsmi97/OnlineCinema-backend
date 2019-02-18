const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const insert = (req, res) => {
  const {
    filmname,
    filmreleasedate,
    filmagerestriction,
    filmlength,
    filmlink,
    filmprice,
    filmposterlink,
    filmdescription,
    filmbudget,
    filmvievs,
    copyrightownerid,
    filmmonthlyviews
  } = req.body;
  db("films")
    .insert({
      filmname,
      filmreleasedate,
      filmagerestriction,
      filmlength,
      filmlink,
      filmprice,
      filmposterlink,
      filmdescription,
      filmbudget,
      filmvievs,
      copyrightownerid,
      filmmonthlyviews
    })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const update = (req, res) => {
  const {
    filmid,
    filmname,
    filmreleasedate,
    filmagerestriction,
    filmlength,
    filmlink,
    filmprice,
    filmposterlink,
    filmdescription,
    filmbudget,
    filmvievs,
    copyrightownerid,
    filmmonthlyviews
  } = req.body;
  db("films")
    .where({ filmid })
    .update({
      filmname,
      filmreleasedate,
      filmagerestriction,
      filmlength,
      filmlink,
      filmprice,
      filmposterlink,
      filmdescription,
      filmbudget,
      filmvievs,
      copyrightownerid,
      filmmonthlyviews
    })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const remove = (req, res) => {
  const { filmid } = req.body;
  db("films")
    .where({ filmid })
    .del()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const selectOne = (req, res) => {
  const { filmid } = req.body;
  db.select("*")
    .from("films")
    .where({ filmid })
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const selectMany = (req, res) => {
  db.select("*")
    .from("films")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

module.exports = {
  insert,
  selectOne,
  remove,
  update,
  selectMany
};
