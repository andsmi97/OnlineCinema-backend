const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const insert = (req, res) => {
  const { table, fields } = req.body;
  db(table)
    .insert(fields)
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

const update = (req, res) => {
  const { id, fields, table } = req.body;
  db(table)
    .where({ [id.name]: id.value })
    .update(fields)
    .returning("*")
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

const remove = (req, res) => {
  const { id, table } = req.body;
  db(table)
    .where({ [id.name]: id.value })
    .del()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};
const selectOne = (req, res) => {
  const { table, idname, idvalue } = req.params;
  db.select("*")
    .from(table)
    .where({ [idname]: idvalue })
    .then(result => res.status(200).json(result[0]))
    .catch(err => res.status(400).json(err));
};
const selectMany = (req, res) => {
  const { table } = req.params;
  db.select("*")
    .from(table)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

const filter = (req, res) => {
  const { table, fields, filter } = req.body;
  db.select(fields)
    .from(table)
    .where(filter)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err));
};

const selectFilm = async (req, res) => {
  const { filmid } = req.params;
  let error = {};
  let response = {};
  const assosiate = (associativeTable, joinTable, joinId, ...fields) => {
    return db
      .select([`${joinTable}.${joinId}`, ...fields])
      .from(associativeTable)
      .innerJoin(
        `${joinTable}`,
        `${associativeTable}.${joinId}`,
        `${joinTable}.${joinId}`
      )
      .where({ filmid })
      .then(result => (response = { ...response, [associativeTable]: result }))
      .catch(err => (error = { ...error, err }));
  };
  await db
    .select("*")
    .from("films")
    .where({ filmid })
    .then(film => (response = { ...response, film: film[0] }))
    .catch(err => (error = { ...error, err }));
  await assosiate("filmsactors", "people", "personid", "personname");
  await assosiate("filmsdirectors", "people", "personid", "personname");
  await assosiate("filmsscriptwriters", "people", "personid", "personname");
  await assosiate("filmsproducers", "people", "personid", "personname");
  await assosiate("filmscomposers", "people", "personid", "personname");
  await assosiate("filmsdesigners", "people", "personid", "personname");
  await assosiate("filmsgenres", "genres", "genreid", "genrename");
  await assosiate("filmscountries", "countries", "countryid", "countryname");
  await assosiate(
    "awards",
    "people",
    "personid",
    "awardname",
    "awardcategory",
    "awardyear"
  );
  await db("usersfilmsratings")
    .avg({ rating: "rating" })
    .where({ filmid })
    .then(result => (response = { ...response, rating: result[0].rating }))
    .catch(err => (error = { ...error, err }));

  await res.status(200).json(response);
  return response;
};

const selectPerson = async (req, res) => {
  const { personid } = req.params;
  let error = {};
  let response = {};
  const assosiate = (associativeTable, joinTable, joinId, ...fields) => {
    return db
      .select([`${joinTable}.${joinId}`, ...fields])
      .from(associativeTable)
      .innerJoin(
        `${joinTable}`,
        `${associativeTable}.${joinId}`,
        `${joinTable}.${joinId}`
      )
      .where({ personid })
      .then(result => (response = { ...response, [associativeTable]: result }))
      .catch(err => (error = { ...error, err }));
  };
  await db
    .select("*")
    .from("people")
    .where({ personid })
    .then(person => (response = { ...response, person: person[0] }))
    .catch(err => (error = { ...error, err }));
  await assosiate("filmsactors", "films", "filmid", "filmname");
  await assosiate("filmsdirectors", "films", "filmid", "filmname");
  await assosiate("filmsscriptwriters", "films", "filmid", "filmname");
  await assosiate("filmsproducers", "films", "filmid", "filmname");
  await assosiate("filmscomposers", "films", "filmid", "filmname");
  await assosiate("filmsdesigners", "films", "filmid", "filmname");
  await res.status(200).json(response);
  return response;
};

module.exports = {
  insert,
  selectOne,
  remove,
  update,
  selectMany,
  filter,
  selectFilm,
  selectPerson
};
