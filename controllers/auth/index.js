const config = require("../../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt-nodejs");
const transport = require("../../config/nodemailer");
const db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

//GET  /api/auth/verify/:id
const sendActivation = user => {
  const host = "localhost:3000";
  const link = `http://${host}/api/auth/verify/${user.userid}`;
  const mailOptions = {
    from: "andsmi97@yandex.ru",
    to: user.useremail,
    subject: "Подтвердите свой аккаунт",
    html:
      "Здравствуйте,<br> Пожалуйста, нажмите на ссылку чтобы подтвердить Ваш Email.<br><a href=" +
      link +
      ">Нажмите для подтверждения</a>"
  };
  transport.options.sendMail(mailOptions, (error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log(response);
    }
  });
};

const signUp = (req, res) => {
  const { username, password: userpassword, email: useremail } = req.body;
  if (!username || !userpassword || !useremail) {
    res.json({
      success: false,
      msg: "Пожалуйтса введите имя пользователя и пароль"
    });
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return err;
      bcrypt.hash(userpassword, salt, null, (err, hash) => {
        if (err) return err;
        //insert user
        (async () => {
          const [userData] = await db("users")
            .insert({ username, userpassword: hash, useremail })
            .returning("*");
          //send email confirmation
          //   sendActivation(userData);
          const token = jwt.sign(userData, config.secret, {
            expiresIn: "30d"
          });
          return res.json({ success: true, token: "JWT " + token });
        })();
      });
    });
  }
};

const signIn = (req, res) => {
  const { username, password } = req.body;
  (async () => {
    const [user] = await db
      .select("userpassword")
      .from("users")
      .where({ username });
    if (!user) {
      res.status(401).send({
        success: false,
        msg: "Ошибка авторизации. Пользователь не найден."
      });
    } else {
      //   console.log(password);
      //   console.log(user.userpassword);
      // check if password matches
      bcrypt.compare(password, user.userpassword, (err, isMatch) => {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          const token = jwt.sign(user, config.secret, {
            expiresIn: "30d"
          });
          // return the information including token as JSON
          return res.json({ success: true, token: "JWT " + token });
        } else {
          return res.status(401).send({
            success: false,
            msg: "Ошибка авторизации. Неправильный пароль."
          });
        }
      });

      //   user.comparePassword(password, (err, isMatch) => {

      //   });
    }
  })();

  //   User.findOne({ username }, (err, user) => {
  //     if (err) throw err;
  //     if (!user) {
  //       res.status(401).send({
  //         success: false,
  //         msg: "Ошибка авторизации. Пользователь не найден."
  //       });
  //     } else {
  //       // check if password matches
  //       user.comparePassword(password, (err, isMatch) => {
  //         if (isMatch && !err) {
  //           // if user is found and password is right create a token
  //           const token = jwt.sign(user.toJSON(), config.secret, {
  //             expiresIn: "30d"
  //           });
  //           // return the information including token as JSON
  //           return res.json({ success: true, token: "JWT " + token });
  //         } else {
  //           return res.status(401).send({
  //             success: false,
  //             msg: "Ошибка авторизации. Неправильный пароль."
  //           });
  //         }
  //       });
  //     }
  //   });
};

//api/auth/verify/:id
const verifyAccount = (req, res) => {
  const { id } = req.params;
  User.findByIdAndUpdate(id, { activated: true })
    .then(data => {
      if (data) {
        return res.status(200).json("Пользователь успешно активирован");
      } else {
        return res.status(400).json("Неправильная ссылка");
      }
    })
    .catch(err => res.status(400).json("Возникли проблемы, повторите позже"));
};
// POST /api/auth/resetpassword {email}
const resetPassword = (req, res) => {
  const { email } = req.body;
  //send email with link to reset password
  User.findOne({ email })
    .then(user => {
      console.log(user);
      const host = "localhost:3000";
      const link = `http://${host}/api/auth/resetpasswordconfirm/${user._id}`;
      const mailOptions = {
        from: "andsmi97@yandex.ru",
        to: email,
        subject: "Восстановление пароля",
        html:
          "Здравствуйте,<br> Пожалуйста, нажмите на ссылку чтобы получить новый пароль.<br><a href=" +
          link +
          ">Нажмите для получения</a>"
      };
      transport.options.sendMail(mailOptions, (error, response) => {
        if (error) {
          res.status(400).json(error);
        } else {
          res.status(200).json(response);
        }
      });
    })
    .catch.status(400)
    .json("Возникла ошибка, повторите позже");
};

// GET /api/auth/resetpasswordconfirm/:id
const resetPasswordConfirm = (req, res) => {
  const { id } = req.params;
  //change Password
  //send jwt
  //send new Password to email

  const generatedPassword = Math.random()
    .toString(36)
    .slice(-8);

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(generatedPassword, salt, null, (err, password) => {
      User.findByIdAndUpdate(id, { password })
        .then(userData => {
          if (userData) {
            res.status(200).json("Пароль успешно изменен");
            const mailOptions = {
              from: "andsmi97@yandex.ru",
              to: userData.email,
              subject: "Новый пароль",
              html: `Здравствуйте,<br> мы изменили Ваш пароль на: ${generatedPassword} <br>
            Вы можете использовать его для входа в аккаунт, но мы настоятельно рекомендуем Вам сменить пароль в личном кабинете`
            };
            transport.options.sendMail(mailOptions, (error, response) => {
              if (error) {
                console.log(error);
              } else {
                console.log(response);
              }
            });
          } else {
            return res.status(400).json("Неправильная ссылка");
          }
        })
        .catch(err => console.log(err));
    });
  });
};

// app.get("/send", (req, res) => {});

// app.get("/verify", (req, res) => {});

module.exports = {
  sendActivation,
  signUp,
  signIn,
  verifyAccount,
  resetPassword,
  resetPasswordConfirm
};
