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
    .where(id)
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
const selectManyWithAlias = (req, res) => {
  const { table } = req.params;
  const { fields, joins, filter } = req.body;

  const _pipe = (a, b) => arg => b(a(arg));
  const pipe = args => [].slice.apply(args).reduce(_pipe);

  if (filter && joins) {
    const joinInnerMultiple = (table, fields, toJoin) => {
      const joins = toJoin.map(join => con =>
        con.innerJoin(
          `${join.joinTable}`,
          `${table}.${join.joinField}`,
          `${join.joinTable}.${join.joinField}`
        )
      );
      return pipe(joins)(
        db
          .select(fields)
          .from(table)
          .where(filter)
      );
    };
    return joinInnerMultiple(table, fields, joins)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(400).json(err));
  } else if (joins) {
    const joinInnerMultiple = (table, fields, toJoin) => {
      const joins = toJoin.map(join => con =>
        con.innerJoin(
          `${join.joinTable}`,
          `${table}.${join.joinField}`,
          `${join.joinTable}.${join.joinField}`
        )
      );
      return pipe(joins)(db.select(fields).from(table));
    };

    return joinInnerMultiple(table, fields, joins)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(400).json(err));
  } else {
    return db
      .select(fields)
      .from(table)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(400).json(err));
  }

  // if (filter && joins) {
  //   return db
  //     .select(fields)
  //     .from(table)
  //     .innerJoin(
  //       joinTable,
  //       `${table}.${joinField}`,
  //       `${joinTable}.${joinField}`
  //     )
  //     .where(filter)
  //     .then(result => res.status(200).json(result))
  //     .catch(err => res.status(400).json(err));
  // } else if (joins) {
  //   return db
  //     .select(fields)
  //     .from(table)
  //     .then(result => res.status(200).json(result))
  //     .catch(err => res.status(400).json(err));
  // }

  // [
  //   { joinTable: "copyrightowners", joinField: "copyrightownerid" },
  //   { joinTable: "filmsactors", joinField: "filmid" }
  // ]

  // const knex = {
  //   ...db,
  //   select(t) {
  //     this.val = []; // initialize val
  //     return this;
  //   },
  //   from(t) {
  //     return this;
  //   },
  //   innerJoin(name) {
  //     this.val.push("Added: " + name);
  //     return this;
  //   }
  // };

  // var tables = [
  //   // [
  //     { joinTable: "copyrightowners", joinField: "copyrightownerid" },
  //     { joinTable: "filmsactors", joinField: "filmid" }
  //   // ]
  // ];
  // // call innerjoin for each of the tables
  // // this is the same as chaining them

  //  return joins
  //   .reduce(
  //     (result, join) =>
  //       result.innerJoin(
  //         `${join.joinTable}`,
  //         `${table}.${table.joinField}`,
  //         `${join.joinTable}.${table.joinField}`
  //       ),
  //     db.select(fields).from(table)
  //   )
  //   .then(result => res.status(200).json(result))
  //   .catch(err => res.status(400).json(err));

  // // console.log(result.val);
  // result.then(newresult => console.log(newresult));
  // joinTable,
  //       `${table}.${joinField}`,
  //       `${joinTable}.${joinField}

  // const filterInnerJoin = (joinTable, table, joinField) =>{
  //   return query => {
  //     return query.innerJoin(
  //       joinTable,
  //       `${table}.${joinField}`,
  //       `${joinTable}.${joinField}`)
  //   }
  // }
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
  const associate = (associativeTable, joinTable, joinId, ...fields) => {
    return db
      .select([`filmid`, `${joinTable}.${joinId}`, ...fields])
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
  await associate("filmsactors", "people", "personid", "personname", "role");
  await associate("filmsdirectors", "people", "personid", "personname");
  await associate("filmsscriptwriters", "people", "personid", "personname");
  await associate("filmsproducers", "people", "personid", "personname");
  await associate("filmscomposers", "people", "personid", "personname");
  await associate("filmsdesigners", "people", "personid", "personname");
  await associate("filmsgenres", "genres", "genreid", "genrename");
  await associate("filmscountries", "countries", "countryid", "countryname");
  await associate(
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

const filmsCards = async (req, res) => {
  const { offset } = req.params;
  const { filter } = req.body;
  if (Object.keys(filter).length) {
    return db
      .raw(`select filmscardsgenre(${offset},'${filter.genre}') as filmscards`)
      .then(result => res.status(200).json(result.rows)) //returning rows since using raw
      .catch(err => res.status(400).json(err));
  }
  return db
    .raw(`select filmscards(${offset})`)
    .then(result => res.status(200).json(result.rows)) //returning rows since using raw
    .catch(err => res.status(400).json(err));
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
  // await assosiate("filmsgenres", "genres", "genreid", "genrename");
  // await assosiate("filmscountries", "countries", "countryid", "countryname");
  await assosiate(
    "awards",
    "films",
    "filmid",
    "awardname",
    "awardcategory",
    "awardyear"
  );
  await db
    .select("countryname", "cityname")
    .from("people")
    .innerJoin("cities", "cities.cityid", "people.cityid")
    .innerJoin("countries", "countries.countryid", "cities.countryid")
    .where({ personid })
    .then(result => (response = { ...response, personbirthplace: result[0] }))
    .catch(err => (error = { ...error, err }));

  await db
    .union(
      db
        .distinct("genrename")
        .select()
        .from("filmsactors")
        .innerJoin("films", "films.filmid", "filmsactors.filmid")
        .innerJoin("filmsgenres", "films.filmid", "filmsgenres.filmid")
        .innerJoin("genres", "genres.genreid", "filmsgenres.genreid")
        .where({ personid }),
      true
    )
    .union(
      db
        .distinct("genrename")
        .select()
        .from("filmsdirectors")
        .innerJoin("films", "films.filmid", "filmsdirectors.filmid")
        .innerJoin("filmsgenres", "films.filmid", "filmsgenres.filmid")
        .innerJoin("genres", "genres.genreid", "filmsgenres.genreid")
        .where({ personid }),
      true
    )
    .union(
      db
        .distinct("genrename")
        .select()
        .from("filmsscriptwriters")
        .innerJoin("films", "films.filmid", "filmsscriptwriters.filmid")
        .innerJoin("filmsgenres", "films.filmid", "filmsgenres.filmid")
        .innerJoin("genres", "genres.genreid", "filmsgenres.genreid")
        .where({ personid }),
      true
    )
    .union(
      db
        .distinct("genrename")
        .select()
        .from("filmsproducers")
        .innerJoin("films", "films.filmid", "filmsproducers.filmid")
        .innerJoin("filmsgenres", "films.filmid", "filmsgenres.filmid")
        .innerJoin("genres", "genres.genreid", "filmsgenres.genreid")
        .where({ personid }),
      true
    )
    .union(
      db
        .distinct("genrename")
        .select()
        .from("filmscomposers")
        .innerJoin("films", "films.filmid", "filmscomposers.filmid")
        .innerJoin("filmsgenres", "films.filmid", "filmsgenres.filmid")
        .innerJoin("genres", "genres.genreid", "filmsgenres.genreid")
        .where({ personid }),
      true
    )
    .union(
      db
        .distinct("genrename")
        .select()
        .from("filmsdesigners")
        .innerJoin("films", "films.filmid", "filmsdesigners.filmid")
        .innerJoin("filmsgenres", "films.filmid", "filmsgenres.filmid")
        .innerJoin("genres", "genres.genreid", "filmsgenres.genreid")
        .where({ personid }),
      true
    )
    .then(result => (response = { ...response, genres: result }))
    .catch(err => (error = { ...error, err }));
  // console.log(response);
  const filmsamount = [
    response.filmsactors,
    response.filmsdirectors,
    response.filmsscriptwriters,
    response.filmsproducers,
    response.filmscomposers,
    response.filmsdesigners
  ].reduce((acc, role) => {
    return (acc += role.length);
  }, 0);
  response = { ...response, filmsamount };
  await res.status(200).json(response);
  return response;
};

// const selectPerson = async (req, res) => {
//   const { personid } = req.params;
//   let error = {};
//   let response = {};
//   const assosiate = (associativeTable, joinTable, joinId, ...fields) => {
//     return db
//       .select([`${joinTable}.${joinId}`, ...fields])
//       .from(associativeTable)
//       .innerJoin(
//         `${joinTable}`,
//         `${associativeTable}.${joinId}`,
//         `${joinTable}.${joinId}`
//       )
//       .where({ personid })
//       .then(result => (response = { ...response, [associativeTable]: result }))
//       .catch(err => (error = { ...error, err }));
//   };
//   await db
//     .select("*")
//     .from("people")
//     .where({ personid })
//     .then(person => (response = { ...response, person: person[0] }))
//     .catch(err => (error = { ...error, err }));
//   await assosiate("filmsactors", "films", "filmid", "filmname");
//   await assosiate("filmsdirectors", "films", "filmid", "filmname");
//   await assosiate("filmsscriptwriters", "films", "filmid", "filmname");
//   await assosiate("filmsproducers", "films", "filmid", "filmname");
//   await assosiate("filmscomposers", "films", "filmid", "filmname");
//   await assosiate("filmsdesigners", "films", "filmid", "filmname");
//   await res.status(200).json(response);
//   return response;
// };

module.exports = {
  insert,
  selectOne,
  remove,
  update,
  selectMany,
  filter,
  selectFilm,
  selectPerson,
  selectManyWithAlias,
  filmsCards
};
