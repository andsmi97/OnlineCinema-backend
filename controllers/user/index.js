const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const fillWallet = (req, res) => {
  const { userid, usermoney } = req.body;
  console.log("test");
  try {
    (async () => {
      await db("users")
        .where({ userid })
        .increment({ usermoney });

      return res.status(200).json("Кошелек поплнен");
    })();
  } catch (e) {
    return res.status(400).json("Возникла ошибка, повторите позже");
  }
};

const purchaseFilm = (req, res) => {
  const { filmid, userid } = req.body;

  return (async () => {
    const [user] = await db("users")
      .select("usermoney")
      .where({ userid });
    const [film] = await db("films")
      .select("filmprice")
      .where({ filmid });
    try {
      if (user.usermoney >= film.filmprice) {
        (async () => {
          //TODO transaction
          let month = new Date().getMonth();
          let day = new Date().getDate();
          let year = new Date().getFullYear();
          if (month + 2 > 12) {
            month = 1;
            year += 1;
          }
          await db("users")
            .where({ userid })
            .increment({ userspent: film.filmprice })
            .decrement({ usermoney: film.filmprice });
          //TODO remove date fields
          await db("usersfilmslibrary").insert({
            userid,
            filmid,
            dateadd: `${month + 1}-${day}-${year}`,
            dateremove: `${month + 2}-${day}-${year}`
          });
          return res.status(200).json("Фильм приобретен");
        })();
      }
    } catch (e) {
      return res.status(400).json("Недостаточно средств");
    }
  })();
};

const subscribe = (req, res) => {
  const { userid } = req.body;
  return (async () => {
    //get usermoney
    const [user] = await db("users")
      .select("usermoney", "userstatus")
      .where({ userid });
    //TODO change magic number
    console.log(user);
    let month = new Date().getMonth();
    let day = new Date().getDate();
    let year = new Date().getFullYear();
    if (month + 2 > 12) {
      month = 1;
      year += 1;
    }
    if (user.usermoney > 100 && user.userstatus === "Inactive") {
      await db("users")
        .update({
          userstatus: "Premium",
          userstatusduedate: `${month + 2}-${day}-${year}`
        })
        .increment({ userspent: 100 })
        .decrement({ usermoney: 100 })
        .where({ userid });

      return res.status(200).json("Подписка оформлена");
    }
    return res.status(400).json("Недостаточно средств");
  })();
};

const rateFilm = (req, res) => {
  const { filmid, rating, userid } = req.body;
  try {
    (async () => {
      await db("usersfilmsratings").insert({ userid, filmid, rating });
      return res.status(200).json("Рейтинг обновлен");
    })();
  } catch (e) {
    return res.status(400).json("Возникла ошибка, повторите позже");
  }
};

module.exports = {
  fillWallet,
  purchaseFilm,
  subscribe,
  rateFilm
};
