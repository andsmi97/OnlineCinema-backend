const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
// const ExtractJwt = require("passport-jwt").ExtractJwt;
// const User = require("../models/Users");
const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const config = require("../config/db"); // get db config file
class passportManager {
  initialize() {
    const opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
      secretOrKey: config.secret
    };
    passport.use(
      new Strategy(opts, (jwt_payload, done) => {
        (async () => {
          const user = await db
            .select("*")
            .from("users")
            .where({ userid: jwt_payload._id });
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        })();

        // User.findOne({ _id: jwt_payload._id }, (err, user) => {
        //   if (err) {
        //     done(err, false);
        //   }
        //   if (user) {
        //     done(null, user);
        //   } else {
        //     done(null, false);
        //   }
        // });
      })
    );
    return passport.initialize();
  }
  authenticate(req, res, next) {
    passport.authenticate("jwt", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        if (info.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Your token has expired." });
        } else {
          return res.status(401).json({ message: info.message });
        }
      }
      req.user = user;
      next();
    })(req, res, next);
  }
}
module.exports = new passportManager();
