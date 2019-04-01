const CronJob = require("cron").CronJob;
const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

//reset montlyViews, create Settlements, resetUserSpent,
//at 13:00:00 on first day of every month any day of the week
const job = new CronJob("0 0 13 1 * *", () => db.raw("SELECT montly()"));

module.exports = { job };
