const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const dashboardData = (req, res) => {
  /*
   *   db raw return knex object
   *   so we need rows[0] object to get result
   */
  return db.raw("SELECT dashboard()").then(data => {
    //destructuring studiosdata from our response
    const { studiosdata, incomedata, ...response } = {
      ...data.rows[0].dashboard,
      studiosLabels: data.rows[0].dashboard.studiosdata.map(
        item => item.copyright.copyrightownername
      ),
      studiosData: data.rows[0].dashboard.studiosdata.map(
        item => item.copyright.totalviews
      ),
      incomeLabels: data.rows[0].dashboard.incomedata.map(item => item.month),
      incomeData: data.rows[0].dashboard.incomedata.map(item => item.income)
    };
    res.status(200).json(response);
  });
};
//incomeSum

//usersCount

//filmsCount

//copyrightownersCount

//filmMaxViews

module.exports = {
  dashboardData
};
