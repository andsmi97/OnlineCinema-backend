const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const insert = (req, res) => {
  const {
    username,
    userstatus,
    usermoney,
    userstatusduedate,
    useremail,
    userpassword,
    userspent,
  } = req.body;
  db("users")
    .insert({
      username,
      userstatus,
      usermoney,
      userstatusduedate,
      useremail,
      userpassword,
      userspent,
    })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const update = (req, res) => {
  const {
    userid,
    username,
    userstatus,
    usermoney,
    userstatusduedate,
    useremail,
    userpassword,
    userspent,
  } = req.body;
  db("users")
    .where({ userid })
    .update({
      username,
      userstatus,
      usermoney,
      userstatusduedate,
      useremail,
      userpassword,
      userspent,
    })
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const remove = (req, res) => {
  const { userid } = req.body;
  db("users")
    .where({ userid })
    .del()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const selectOne = (req, res) => {
  const { userid } = req.body;
  db.select("*")
    .from("users")
    .where({ userid })
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const selectMany = (req, res) => {
  db.select("*")
    .from("users")
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
